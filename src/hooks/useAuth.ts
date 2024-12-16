import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { apiClient } from '../services/api/client';
import { AUTH_STORAGE_KEYS } from '../config/auth';

export function useAuth() {
  const { instance: msalInstance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithMicrosoft = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Redirect to Microsoft login
      await msalInstance.loginRedirect(msalRequest);

      // The backend will handle the redirect and exchange the code
      const response = await apiClient.get('/api/auth/microsoft/user');
      console.log('Backend response:', response.data);

      // Store user data in local storage
      localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    } catch (err: any) {
      console.error('Microsoft login error:', err);
      setError(err.message || 'Microsoft login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { loginWithMicrosoft, isLoading, error };
}
