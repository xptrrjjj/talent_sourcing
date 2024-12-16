import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { apiClient } from '../services/api/client';
import { AUTH_STORAGE_KEYS } from '../config/auth';

export function useAuth() {
  const { instance: msalInstance } = useMsal();

  const handleRedirect = async () => {
    // Extract the code from the URL fragment
    const fragmentParams = new URLSearchParams(window.location.hash.substring(1));
    const code = fragmentParams.get('code');

    if (code) {
      try {
        // Send the code to the backend
        const response = await apiClient.post('/api/auth/microsoft/callback', {
          code,
        });

        console.log('Backend response:', response.data);

        // Save user data or tokens
        if (response.data.access_token) {
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
        }
        if (response.data.user) {
          localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.error('Error handling redirect:', error);
      } finally {
        // Clean up the URL by removing the fragment
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  };

  useEffect(() => {
    handleRedirect();
  }, []);

  const loginWithMicrosoft = async (): Promise<void> => {
    try {
      // Initiate the login flow
      await msalInstance.loginRedirect(msalRequest);
    } catch (error) {
      console.error('Microsoft login error:', error);
    }
  };

  return {
    loginWithMicrosoft,
  };
}
