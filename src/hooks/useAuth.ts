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
        await msalInstance.initialize();
        const response = await msalInstance.handleRedirectPromise();
        console.log('MSAL Response:', response);

        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const account = accounts[0];
          console.log('Logged in account:', account);

          // Get access token for the user
          const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ['User.Read', 'profile', 'email'],
            account: account
          });

          // Get user info from backend with token
          const backendResponse = await apiClient.get('/api/auth/microsoft/user', {
            headers: {
              'Authorization': `Bearer ${tokenResponse.accessToken}`
            }
          });
          console.log('Backend Response:', backendResponse.data);

          if (backendResponse.data.user) {
            localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(backendResponse.data.user));
            if (backendResponse.data.access_token) {
              localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, backendResponse.data.access_token);
            }
          }
        }
      } catch (error) {
        console.error('Error handling Microsoft redirect:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
        }
      }
    };

    handleMsalResponse();
  }, [msalInstance]);

  const loginWithMicrosoft = async () => {
    try {
      await msalInstance.initialize();
      await msalInstance.loginRedirect(msalRequest);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return {
    loginWithMicrosoft,
  };
}
