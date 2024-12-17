import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMicrosoftAuth } from '../services/auth/hooks/useMicrosoftAuth';
import { login as loginApi } from '../services/api/auth';
import { storeAuthData } from '../services/auth/storage';
import { AUTH_ROUTES } from '../services/auth/constants';

export function useAuth() {
  const navigate = useNavigate();
  const [isProcessingCredentials, setIsProcessingCredentials] = useState(false);
  const { login: microsoftLogin, isProcessing: isProcessingMicrosoft } = useMicrosoftAuth();

  const loginWithCredentials = async (username: string, password: string) => {
    try {
      setIsProcessingCredentials(true);
      const response = await loginApi(username, password);
      
      if (response.access_token && response.user) {
        storeAuthData(response.access_token, response.user);
        navigate(AUTH_ROUTES.HOME, { replace: true });
      }
      
      return response;
    } catch (error) {
      console.error('Native login error:', error);
      throw error;
    } finally {
      setIsProcessingCredentials(false);
    }
  };

  return {
    loginWithMicrosoft: microsoftLogin,
    login: loginWithCredentials,
    isLoading: isProcessingCredentials || isProcessingMicrosoft
  };
}