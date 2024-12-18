import { getMsalInstance } from '../msal';
import { apiClient } from '../api/client';
import { AUTH_SCOPES } from './constants';
import { storeAuthData } from './storage';
import type { User } from '../../types';

export async function validateMicrosoftUser(microsoftToken: string): Promise<User> {
  try {
    const response = await apiClient.post('/api/auth/microsoft/callback', {
      microsoft_token: microsoftToken
    });

    if (!response.data.user || !response.data.access_token) {
      throw new Error('Invalid response from server');
    }

    const user: User = {
      id: response.data.user.id.toString(),
      name: response.data.user.name || response.data.user.email.split('@')[0],
      email: response.data.user.email
    };

    storeAuthData(response.data.access_token, user);
    return user;
  } catch (error) {
    console.error('Microsoft validation error:', error);
    throw error;
  }
}

export async function refreshMicrosoftToken(): Promise<string | null> {
  try {
    const msalInstance = await getMsalInstance();
    const accounts = msalInstance.getAllAccounts();
    
    if (accounts.length === 0) {
      return null;
    }

    const tokenResponse = await msalInstance.acquireTokenSilent({
      scopes: AUTH_SCOPES,
      account: accounts[0]
    });

    if (!tokenResponse.accessToken) {
      return null;
    }

    const user = await validateMicrosoftUser(tokenResponse.accessToken);
    return tokenResponse.accessToken;
  } catch (error) {
    console.error('Failed to refresh Microsoft token:', error);
    return null;
  }
}