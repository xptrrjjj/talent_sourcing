import axios from 'axios';
import { refreshAccessToken } from './auth';
import { msalRequest, msalConfig } from '../../config/msal';
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

// Get Microsoft Token and Exchange with Backend
const getMicrosoftToken = async () => {
  try {
    console.log('[Auth] Attempting to get Microsoft token...');
    const msalInstance = await getMsalInstance();
    const accounts = msalInstance.getAllAccounts();
    console.log('[Auth] MSAL Accounts:', accounts);

    if (accounts.length > 0) {
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ['User.Read', 'profile', 'email', 'openid'],
        account: accounts[0],
      });

      console.log('[Auth] Microsoft Token acquired:', tokenResponse.accessToken);

      // Send Microsoft Token to Backend for Validation/Exchange
      const backendResponse = await axios.post(`${BASE_URL}/api/auth/microsoft/callback`, {
        code: tokenResponse.accessToken, // Exchange the Microsoft Token
      });

      if (backendResponse.data.access_token) {
        console.log('[Auth] Backend token received:', backendResponse.data.access_token);

        // Save backend token locally
        localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, backendResponse.data.access_token);
        return backendResponse.data.access_token;
      } else {
        console.error('[Auth] Backend did not return an access token.');
      }
    }

    console.warn('[Auth] No accounts found in MSAL instance.');
    return null;
  } catch (error) {
    console.error('[Auth] Error fetching Microsoft token:', error);
    return null;
  }
};

// Axios Client with Token Handling
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(async (config) => {
  console.log('[API] Intercepting request to:', config.url);

  let token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  console.log('[API] Existing Token:', token);

  if (!token && isUsingMicrosoftAuth()) {
    console.log('[API] No token found. Fetching Microsoft token...');
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
      console.warn('[API] Handling 401 error - attempting token refresh.');
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

      console.error('[API] Token refresh failed. Clearing tokens.');
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    }

    return Promise.reject(error);
  }
);
