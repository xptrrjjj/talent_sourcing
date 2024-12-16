import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { login as apiLogin, validateMicrosoftToken } from '../services/api/auth';
import { msalRequest, AUTH_STORAGE_KEYS } from '../config/auth';
import type { User } from '../types';

export function useAuth() {
  const { instance: msalInstance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearAuthData = useCallback(() => {
    Object.values(AUTH_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }, []);

  const setAuthData = useCallback((user: User) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await apiLogin(username, password);
      setAuthData(user);
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMicrosoft = async (): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await msalInstance.loginPopup(msalRequest);

      if (!result.accessToken) {
        throw new Error('Failed to get Microsoft access token');
      }

      const user = await validateMicrosoftToken(result.accessToken);
      setAuthData(user);
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microsoft login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const msalAccount = msalInstance.getAllAccounts()[0];
      if (msalAccount) {
        await msalInstance.logoutPopup({
          account: msalAccount,
          postLogoutRedirectUri: window.location.origin
        });
      }
    } catch (error) {
      console.error('Microsoft logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  return {
    login,
    loginWithMicrosoft,
    logout,
    isLoading,
    error
  };
}