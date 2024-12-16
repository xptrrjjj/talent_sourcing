import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { AUTH_STORAGE_KEYS } from '../config/auth';
import { apiClient } from '../services/api/client';
import { msalRequest } from '../config/msal';

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
      // Trigger login redirect with backend's redirect URI
      await msalInstance.loginRedirect({
        scopes: msalRequest.scopes,
        redirectUri: 'https://44.211.135.244:8000/api/auth/microsoft/callback'
      });
  
      // The backend will handle the exchange and create a user session
      const response = await apiClient.get('/api/auth/microsoft/user'); // Endpoint to fetch user session from backend
      console.log('Backend response:', response.data);
  
      // Save user data from backend response
      if (response.data.user) {
        setAuthData(response.data.user); // Assuming `setAuthData` saves user data in localStorage
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
