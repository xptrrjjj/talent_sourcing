import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { logout as apiLogout } from '../services/api/auth';
import { AUTH_STORAGE_KEYS } from '../config/auth';

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

  // Login with Microsoft using redirect
  const loginWithMicrosoft = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // Use MSAL redirect flow to handle Authorization Code Flow
      await msalInstance.loginRedirect(msalRequest);
    } catch (err: any) {
      const message = err.message || 'Microsoft login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      const msalAccount = msalInstance.getAllAccounts()[0];
      if (msalAccount) {
        await msalInstance.logoutRedirect({
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
