import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../config/msal';
import { validateMicrosoftUser } from '../services/auth/microsoft';
import { login } from '../services/api/operations/auth';
import { storeAuthData } from '../services/auth/storage';
import { AUTH_ROUTES } from '../services/auth/constants';
import type { User } from '../types';

export function useAuth() {
  const navigate = useNavigate();
  const { instance: msalInstance } = useMsal();
  const [isLoading, setIsLoading] = useState(false);

  const loginWithMicrosoft = async () => {
    try {
      setIsLoading(true);
      const response = await msalInstance.loginPopup(msalRequest);
      
      if (!response?.account) {
        throw new Error('Microsoft login failed');
      }

      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: msalRequest.scopes,
        account: response.account
      });

      if (!tokenResponse.accessToken) {
        throw new Error('Failed to acquire token');
      }

      const user = await validateMicrosoftUser(tokenResponse.accessToken);
      navigate(AUTH_ROUTES.HOME, { replace: true });
      return user;
    } catch (error) {
      console.error('Microsoft auth error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await login(username, password);
      
      if (response.access_token && response.user) {
        const user: User = {
          id: response.user.id.toString(),
          name: response.user.username,
          email: response.user.username
        };
        storeAuthData(response.access_token, user);
        navigate(AUTH_ROUTES.HOME, { replace: true });
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login: handleLogin,
    loginWithMicrosoft,
    isLoading
  };
}