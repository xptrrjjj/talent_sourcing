import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { apiClient } from '../services/api/client';
import { AUTH_STORAGE_KEYS } from '../config/auth';
import { useEffect } from 'react';

export function useAuth() {
  const { instance: msalInstance } = useMsal();

  useEffect(() => {
    const handleMsalResponse = async () => {
      try {
        console.log('[Auth] Handling MSAL redirect...');
        const response = await msalInstance.handleRedirectPromise();
        console.log('[Auth] MSAL Redirect Response:', response);
    
        if (response?.account && response?.idToken) {
          console.log('[Auth] Logged in MSAL Account:', response.account);
    
          // Exchange idToken for backend token
          const backendResponse = await apiClient.post('/api/auth/microsoft/callback', {
            microsoft_token: response.idToken, // Consistent naming
          });
          console.log('[Auth] Backend Response:', backendResponse.data);
    
          if (backendResponse.data.access_token) {
            localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, backendResponse.data.access_token);
            localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(backendResponse.data.user));
          }
        } else {
          console.error('[Auth] No account or idToken in MSAL response.');
        }
      } catch (error: any) {
        console.error('[Auth] Error handling MSAL response:', error);
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
