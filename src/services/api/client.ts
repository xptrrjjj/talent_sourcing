import axios from 'axios';
import { refreshAccessToken } from './auth';
import { msalRequest } from '../../config/msal';
import { PublicClientApplication } from '@azure/msal-browser';
import { AUTH_STORAGE_KEYS } from '../../config/auth';
import { getMsalInstance } from '../msal';

const BASE_URL = 'https://44.211.135.244:8000';

// Determines if Microsoft authentication is active
const isUsingMicrosoftAuth = () => {
  const hasMsalAccount = window.sessionStorage.getItem('msal.account.keys') !== null;
  console.log('[Auth] Checking Microsoft Auth status:', hasMsalAccount);
  return hasMsalAccount;
};

// Fetch Microsoft Access Token
const getMicrosoftToken = async () => {
  console.log('[Auth] Fetching Microsoft token...');
  try {
    const msalInstance = await getMsalInstance();
    const accounts = msalInstance.getAllAccounts();
    console.log('[Auth] Found MSAL accounts:', accounts);

    if (accounts.length > 0) {
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: [`api://${msalRequest.scopes[0]}`],
        account: accounts[0],
      });
      console.log('[Auth] Microsoft token acquired:', tokenResponse.accessToken);

      // Exchange Microsoft token for backend token
      const response = await axios.post(`${BASE_URL}/api/auth/microsoft/token`, {
        microsoft_token: tokenResponse.accessToken,
      });
      console.log('[Auth] Backend token response:', response.data);

      const backendToken = response.data.access_token;
      if (backendToken) {
        localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, backendToken);
        console.log('[Auth] Backend token stored successfully.');
        return backendToken;
      }
    }
  } catch (error) {
    console.error('[Auth] Failed to acquire Microsoft token:', error);
  }
  return null;
};

// Axios instance with interceptors
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(async (config) => {
  console.log('[API] Intercepting request to:', config.url);

  let token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  console.log('[API] Stored token:', token);

  if (!token && isUsingMicrosoftAuth()) {
    console.log('[API] No stored token. Trying to fetch Microsoft token...');
    token = await getMicrosoftToken();
  }

  if (token) {
    console.log('[API] Attaching token to request:', token);
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('[API] No valid token found. Request may fail.');
  }

  return config;
});

// Response Interceptor: Handle 401 Errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API] Response received from:', response.config.url, response.data);
    return response;
  },
  async (error) => {
    console.error('[API] Error response:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('[API] Handling 401 error - token refresh required.');
      originalRequest._retry = true;

      if (isUsingMicrosoftAuth()) {
        console.log('[API] Refreshing Microsoft token...');
        const newToken = await getMicrosoftToken();
        if (newToken) {
          console.log('[API] Retrying request with new Microsoft token.');
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } else {
        console.log('[API] Refreshing native token...');
        const newToken = await refreshAccessToken();
        if (newToken) {
          console.log('[API] Retrying request with new native token.');
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      }

      console.error('[API] Token refresh failed. Logging out user.');
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    }

    return Promise.reject(error);
  }
);
