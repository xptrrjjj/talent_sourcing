import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { apiClient } from '../services/api/client';
import { AUTH_STORAGE_KEYS } from '../config/auth';
import { useEffect } from 'react';
import { login } from '../services/api/auth';

export function useAuth() {
  const { instance: msalInstance } = useMsal();

  useEffect(() => {
    const handleMsalResponse = async () => {
      try {
        console.log('[Auth] Handling MSAL redirect...');
        const response = await msalInstance.handleRedirectPromise();
        console.log('[Auth] MSAL Redirect Response:', response);
    
        if (response?.account) {
          // Get access token for backend
          const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ['User.Read', 'profile', 'email', 'openid'],
            account: response.account
          });
          console.log('[Auth] Access Token Response:', tokenResponse);
    
          // Exchange access token for backend token
          const backendResponse = await apiClient.post('/api/auth/microsoft/callback', {
            microsoft_token: tokenResponse.accessToken,
            account: {
              username: response.account.username,
              name: response.account.name,
              email: response.account.username
            }
          });
          console.log('[Auth] Backend Response:', backendResponse.data);
    
          if (backendResponse.data.access_token) {
            localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, backendResponse.data.access_token);
            localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(backendResponse.data.user));
          }
        } else {
          console.error('[Auth] No account in MSAL response.');
        }
      } catch (error: any) {
        console.error('[Auth] Error handling MSAL response:', error);
        if (error.response?.data) {
          console.error('[Auth] Backend error details:', {
            detail: error.response.data.detail,
            raw: error.response.data
          });
        }
      }
    };
  
    handleMsalResponse();
  }, [msalInstance]);
  

  const loginWithMicrosoft = async () => {
    try {
      console.log('[Auth] Initiating Microsoft login...');
      await msalInstance.loginRedirect(msalRequest);
    } catch (error) {
      console.error('[Auth] Microsoft login error:', error);
    }
  };

  return {
    loginWithMicrosoft,
  };
}
