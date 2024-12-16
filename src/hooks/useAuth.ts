import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { apiClient } from '../services/api/client';
import { AUTH_STORAGE_KEYS } from '../config/auth';
import axios from 'axios';
import { useEffect } from 'react';

export function useAuth() {
  const { instance: msalInstance } = useMsal();

  // Handle MSAL redirect response
  useEffect(() => {
    const handleMsalResponse = async () => {
      try {
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          console.log('MSAL Response:', response);
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          console.log('Auth Code:', code);

          if (code) {
            // Send the code to the backend
            const backendResponse = await apiClient.post('/api/auth/microsoft/callback', { code });
            console.log('Backend Response:', backendResponse.data);

            if (backendResponse.data.access_token) {
              localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, backendResponse.data.access_token);
              localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(backendResponse.data.user));
            }
          }
        }
      } catch (error) {
        console.error('Error handling Microsoft redirect:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
        }
      } finally {
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleMsalResponse();
  }, [msalInstance]);

  const loginWithMicrosoft = async () => {
    await msalInstance.loginRedirect(msalRequest);
  };

  return {
    loginWithMicrosoft,
  };
}
