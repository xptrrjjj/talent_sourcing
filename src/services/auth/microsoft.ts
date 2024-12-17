import { getMsalInstance } from '../msal';
import { apiClient, tokenManager } from '../api/client';
import { AUTH_SCOPES } from './constants';
import { storeAuthData } from './storage';

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

    const backendResponse = await apiClient.post('/api/auth/microsoft/callback', {
      microsoft_token: tokenResponse.accessToken
    });

    if (backendResponse.data.access_token) {
      storeAuthData(backendResponse.data.access_token, backendResponse.data.user);
      tokenManager.setTokenType('microsoft');
      return backendResponse.data.access_token;
    }

    return null;
  } catch (error) {
    console.error('Failed to refresh Microsoft token:', error);
    return null;
  }
}