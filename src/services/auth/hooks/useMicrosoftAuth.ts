import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { msalRequest } from '../../../config/msal';
import { apiClient } from '../../api/client';
import { AUTH_SCOPES, AUTH_ERRORS } from '../constants';
import { storeAuthData } from '../storage';

export function useMicrosoftAuth() {
  const { instance: msalInstance } = useMsal();
  const [isProcessing, setIsProcessing] = useState(false);

  const login = useCallback(async () => {
    try {
      setIsProcessing(true);
      console.log('Starting Microsoft login...');

      // Clear any existing auth data
      sessionStorage.removeItem('auth_success');

      // Perform Microsoft login
      const response = await msalInstance.loginPopup(msalRequest);
      console.log('Microsoft login successful:', response?.account?.username);
      
      if (!response?.account) {
        throw new Error(AUTH_ERRORS.AUTH_FAILED);
      }

      // Get access token
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: AUTH_SCOPES,
        account: response.account
      });

      if (!tokenResponse.accessToken) {
        throw new Error(AUTH_ERRORS.TOKEN_ACQUISITION_FAILED);
      }

      console.log('Token acquired, exchanging with backend...');

      // Exchange token with backend
      const backendResponse = await apiClient.post('/api/auth/microsoft/callback', {
        microsoft_token: tokenResponse.accessToken,
        account: {
          username: response.account.username,
          name: response.account.name,
          email: response.account.username
        }
      });

      if (!backendResponse.data.access_token || !backendResponse.data.user) {
        throw new Error('Backend authentication failed');
      }

      console.log('Backend authentication successful');

      // Store auth data
      storeAuthData(backendResponse.data.access_token, backendResponse.data.user);
      
      return backendResponse.data.user;
    } catch (err) {
      console.error('Microsoft auth error:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [msalInstance]);

  return { login, isProcessing };
}