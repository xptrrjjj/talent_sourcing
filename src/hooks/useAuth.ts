import { useState, useCallback, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { logout as apiLogout } from '../services/api/auth';
import { AUTH_STORAGE_KEYS } from '../config/auth';
import { apiClient } from '../services/api/client';

export function useAuth() {
  const { instance: msalInstance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle the redirect response
  useEffect(() => {
    const handleRedirectResponse = async () => {
      try {
        await msalInstance.initialize();
        const response = await msalInstance.handleRedirectPromise();
        
        if (response?.accessToken) {
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          
          if (!code) {
            throw new Error('Authorization code not found');
          }

          // Add logging
          console.log('Sending to Microsoft callback:', {
            code,
            accessToken: response.accessToken,
            account: response.account,
            url: '/api/auth/microsoft/callback',
            searchParams: window.location.search
          });

          // Send code to backend
          const callbackResponse = await apiClient.post('/api/auth/microsoft/callback', { code });
          console.log('Callback response:', callbackResponse.data);
        }
      } catch (err: any) {
        console.error('Microsoft callback error:', err);
        setError(err.message || 'Failed to handle Microsoft redirect');
      }
    };

    handleRedirectResponse();
  }, [msalInstance]);

  const clearAuthData = useCallback(() => {
    Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }, []);

  const loginWithMicrosoft = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await msalInstance.loginRedirect(msalRequest);
      // Backend handles the redirect and processes the 'code'
    } catch (err: any) {
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
