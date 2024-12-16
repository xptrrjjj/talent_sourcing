import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { AUTH_STORAGE_KEYS } from '../config/auth';
import { apiClient } from '../services/api/client';

export function useAuth() {
  const { instance: msalInstance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearAuthData = useCallback(() => {
    Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }, []);

  const setAuthData = useCallback((user: any) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }, []);

  const loginWithMicrosoft = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Trigger login redirect
      await msalInstance.loginRedirect();

      // Backend handles redirect URI and exchanges the code for tokens
      const response = await apiClient.get('/api/auth/microsoft/user'); // Get user session from backend
      console.log('Backend response:', response.data);

      // Save user data
      if (response.data.user) {
        setAuthData(response.data.user);
      } else {
        throw new Error('Invalid backend response');
      }
    } catch (err: any) {
      console.error('Microsoft login error:', err);
      setError(err.message || 'Microsoft login failed');
      throw new Error(err.message || 'Microsoft login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const msalAccount = msalInstance.getAllAccounts()[0];
      if (msalAccount) {
        await msalInstance.logoutRedirect({
          account: msalAccount,
          postLogoutRedirectUri: window.location.origin,
        });
      }

      // Notify the backend to clear session
      await apiClient.post('/api/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  return {
    loginWithMicrosoft,
    logout,
    isLoading,
    error,
  };
}
