import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { apiClient } from '../services/api/client';
import { AUTH_STORAGE_KEYS } from '../config/auth';
import type { User } from '../types';

export function useAuth() {
  const { instance: msalInstance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearAuthData = useCallback(() => {
    Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }, []);

  const setAuthData = useCallback((user: User) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }, []);

  const loginWithMicrosoft = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Trigger login redirect
      await msalInstance.loginRedirect(msalRequest);
      // Note: No code execution happens here after redirect
    } catch (err: any) {
      console.error('Microsoft login error:', err);
      setError(err.message || 'Microsoft login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserFromBackend = async (): Promise<User> => {
    try {
      // Fetch authenticated user session from the backend
      const response = await apiClient.get('/api/auth/microsoft/user');
      console.log('Backend response:', response.data);

      if (response.data.user) {
        setAuthData(response.data.user); // Save user data to localStorage
        return response.data.user;
      } else {
        throw new Error('Invalid backend response');
      }
    } catch (err: any) {
      console.error('Error fetching user:', err);
      throw new Error(err.response?.data?.message || 'Failed to fetch user');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const msalAccount = msalInstance.getAllAccounts()[0];
      if (msalAccount) {
        await msalInstance.logoutRedirect({
          account: msalAccount,
          postLogoutRedirectUri: window.location.origin,
        });
      }
      await apiClient.post('/api/auth/logout/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthData();
    }
  };

  return {
    loginWithMicrosoft,
    fetchUserFromBackend,
    logout,
    isLoading,
    error,
  };
}
