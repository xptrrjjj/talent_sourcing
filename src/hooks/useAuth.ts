import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { logout as apiLogout } from '../services/api/auth';
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

  const loginWithMicrosoft = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // Get token from Microsoft
      const response = await msalInstance.loginPopup(msalRequest);
      console.log('Microsoft login response:', {
        accessToken: response.accessToken,
        account: response.account,
        scopes: response.scopes
      });

      // Send the access token to our backend
      const callbackResponse = await apiClient.post('/api/auth/microsoft/callback', {
        access_token: response.accessToken,
        account_id: response.account?.homeAccountId
      });
      console.log('Callback response:', callbackResponse.data);
      
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
