import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { apiClient } from '../services/api/client';
import { AUTH_STORAGE_KEYS } from '../config/auth';

export function useAuth() {
  const { instance: msalInstance } = useMsal();

  // Handles the code sent via query parameters
  const handleRedirect = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      try {
        console.log('Received code:', code);

        // Send the code to the backend for token exchange
        const response = await apiClient.post('/api/auth/microsoft/callback', { code });

        console.log('Backend response:', response.data);

        if (response.data.access_token) {
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
          localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.error('Error handling Microsoft login:', error);
      } finally {
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  };

  // Initiates the login flow
  const loginWithMicrosoft = async () => {
    await msalInstance.loginRedirect(msalRequest);
  };

  return {
    loginWithMicrosoft,
    handleRedirect,
  };
}
