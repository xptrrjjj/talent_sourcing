// import { useMsal } from '@azure/msal-react';
// import { msalRequest } from '../config/msal';
// import { apiClient } from '../services/api/client';
// import { AUTH_STORAGE_KEYS } from '../config/auth';
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { login } from '../services/api/auth';

// export function useAuth() {
//   const { instance: msalInstance } = useMsal();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleMsalResponse = async () => {
//       try {
//         console.log('[Auth] Handling MSAL redirect...');
//         const response = await msalInstance.handleRedirectPromise();
//         console.log('[Auth] MSAL Redirect Response:', response);
    
//         if (response?.account) {
//           const tokenResponse = await msalInstance.acquireTokenSilent({
//             scopes: ['User.Read', 'profile', 'email', 'openid'],
//             account: response.account
//           });
//           console.log('[Auth] Access Token Response:', tokenResponse);
    
//           const backendResponse = await apiClient.post('/api/auth/microsoft/callback', {
//             microsoft_token: tokenResponse.accessToken,
//             account: {
//               username: response.account.username,
//               name: response.account.name,
//               email: response.account.username
//             }
//           });
//           console.log('[Auth] Backend Response:', backendResponse.data);
    
//           if (backendResponse.data.access_token) {
//             console.log('[Auth] Storing tokens and navigating...');
//             localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, backendResponse.data.access_token);
//             localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(backendResponse.data.user));
            
//             // Force navigation and page reload
//             window.location.href = '/';
//             return; // Stop execution after redirect
//           }
//         }

//         // Check if we should redirect from login page
//         const hasToken = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
//         const isLoginPage = window.location.pathname === '/login';
//         console.log('[Auth] Path check:', { hasToken, isLoginPage });

//         if (hasToken && isLoginPage) {
//           console.log('[Auth] Redirecting from login page...');
//           window.location.href = '/';
//         }
//       } catch (error: any) {
//         console.error('[Auth] Error handling MSAL response:', error);
//         if (error.response?.data) {
//           console.error('[Auth] Backend error details:', {
//             detail: error.response.data.detail,
//             raw: error.response.data
//           });
//         }
//       }
//     };
  
//     handleMsalResponse();
//   }, [msalInstance, navigate]);

//   const loginWithMicrosoft = async () => {
//     try {
//       console.log('[Auth] Initiating Microsoft login...');
//       await msalInstance.loginRedirect(msalRequest);
//     } catch (error) {
//       console.error('[Auth] Microsoft login error:', error);
//     }
//   };

//   const loginWithCredentials = async (username: string, password: string) => {
//     try {
//       console.log('[Auth] Attempting native login...');
//       const response = await login(username, password);
//       console.log('[Auth] Login successful:', response);
      
//       // Force navigation and page reload after successful login
//       window.location.href = '/';
//     } catch (error) {
//       console.error('[Auth] Native login error:', error);
//       throw error;
//     }
//   };

//   return {
//     loginWithMicrosoft,
//     login: loginWithCredentials,
//   };
// }

import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { apiClient } from '../services/api/client';
import { AUTH_STORAGE_KEYS } from '../config/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api/auth';

export function useAuth() {
  const { instance: msalInstance } = useMsal();
  const navigate = useNavigate();
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  useEffect(() => {
    const handleMsalResponse = async () => {
      if (isProcessingAuth) return;

      try {
        setIsProcessingAuth(true);
        const response = await msalInstance.handleRedirectPromise();
        
        if (response?.account) {
          const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ['User.Read', 'profile', 'email', 'openid'],
            account: response.account
          });

          if (tokenResponse.accessToken) {
            const backendResponse = await apiClient.post('/api/auth/microsoft/callback', {
              microsoft_token: tokenResponse.accessToken,
              account: {
                username: response.account.username,
                name: response.account.name,
                email: response.account.username
              }
            });

            if (backendResponse.data.access_token) {
              localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, backendResponse.data.access_token);
              localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(backendResponse.data.user));
              
              // Use replace instead of push to prevent back button issues
              window.location.replace('/');
              return;
            }
          }
        }

        // Check if we should redirect from login page
        const hasToken = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        const isLoginPage = window.location.pathname === '/login';

        if (hasToken && isLoginPage) {
          window.location.replace('/');
        }
      } catch (error: any) {
        console.error('[Auth] Error handling MSAL response:', error);
        if (error.response?.data) {
          console.error('[Auth] Backend error details:', error.response.data);
        }
      } finally {
        setIsProcessingAuth(false);
      }
    };
  
    handleMsalResponse();
  }, [msalInstance, navigate]);

  const loginWithMicrosoft = async () => {
    try {
      await msalInstance.loginRedirect(msalRequest);
    } catch (error) {
      console.error('[Auth] Microsoft login error:', error);
      throw error;
    }
  };

  const loginWithCredentials = async (username: string, password: string) => {
    try {
      const response = await login(username, password);
      
      if (response.access_token) {
        window.location.replace('/');
      }
      
      return response;
    } catch (error) {
      console.error('[Auth] Native login error:', error);
      throw error;
    }
  };

  return {
    loginWithMicrosoft,
    login: loginWithCredentials,
    isProcessingAuth
  };
}