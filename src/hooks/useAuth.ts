import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { validateMicrosoftToken } from '../services/api/auth';
import { msalRequest } from '../config/msal';
import { AUTH_STORAGE_KEYS, logout as apiLogout } from '../config/auth';
import type { User } from '../types';

export function useAuth() {
  const { instance: msalInstance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear authentication data from local storage
  const clearAuthData = useCallback(() => {
    Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }, []);

  // Save user data to local storage
  const setAuthData = useCallback((user: User) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }, []);

  // Login with Microsoft
  const loginWithMicrosoft = async (): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      // Use MSAL to log in via popup
      const result = await msalInstance.loginPopup(msalRequest);

      if (!result.accessToken) {
        throw new Error('Failed to retrieve Microsoft access token');
      }

      // Backend handles the redirect and validates the token
      const user = await validateMicrosoftToken();
      setAuthData(user);
      return user;
    } catch (err: any) {
      const message = err.message || 'Microsoft login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout from Microsoft and clear local storage
  const logout = async () => {
    try {
      const msalAccount = msalInstance.getAllAccounts()[0];
      if (msalAccount) {
        await msalInstance.logoutPopup({
          account: msalAccount,
          postLogoutRedirectUri: window.location.origin,
        });
      }
      await apiLogout();
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
