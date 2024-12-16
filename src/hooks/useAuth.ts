import { useEffect, useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { apiClient } from '../services/api/client';
import { AUTH_STORAGE_KEYS } from '../config/auth';

export function useAuth() {
  const { instance: msalInstance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearAuthData = useCallback(() => {
    Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }, []);

  const setAuthData = (user: any) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  };

  // Handle redirect response after returning from Azure
  useEffect(() => {
    const handleRedirectResponse = async () => {
      try {
        const response = await msalInstance.handleRedirectPromise();

        if (response) {
          console.log('Redirect response:', response);
          // Send the token/code to the backend for validation
          const backendResponse = await apiClient.post('/api/auth/microsoft/callback', {
            code: response.code, // Ensure the response includes a code or token
          });

          console.log('Backend response:', backendResponse.data);

          if (backendResponse.data.access_token) {
            setAuthData(backendResponse.data.user);
          }
        }
      } catch (err) {
        console.error('Redirect handling error:', err);
        setError('Failed to handle redirect response');
      }
    };

    handleRedirectResponse();
  }, [msalInstance]);

  // Trigger Microsoft Login Redirect
  const loginWithMicrosoft = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await msalInstance.loginRedirect(msalRequest);
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Microsoft login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await msalInstance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
      clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    loginWithMicrosoft,
    logout,
    isLoading,
    error,
  };
}
