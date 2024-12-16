import axios from 'axios';
import { refreshAccessToken } from './auth';
import { msalRequest } from '../../config/msal';
import { PublicClientApplication } from '@azure/msal-browser';
import { AUTH_STORAGE_KEYS } from '../../config/auth';
import { getMsalInstance } from '../msal';

const BASE_URL = 'https://44.211.135.244:8000';

// Debug Logging Helper
const logToStorage = (message: string, data?: any) => {
  const logs = JSON.parse(localStorage.getItem('auth_debug_logs') || '[]');
  logs.push({ timestamp: new Date().toISOString(), message, data });
  localStorage.setItem('auth_debug_logs', JSON.stringify(logs.slice(-20)));
};

// Determines if Microsoft authentication is active
const isUsingMicrosoftAuth = () => {
  const hasMsalAccount = window.sessionStorage.getItem('msal.account.keys') !== null;
  logToStorage('Checking Microsoft Auth status', { hasMsalAccount });
  return hasMsalAccount;
};

// Fetch Microsoft Access Token
const getMicrosoftToken = async () => {
  try {
    const msalInstance = await getMsalInstance();
    const accounts = msalInstance.getAllAccounts();

    if (accounts.length > 0) {
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: [`api://${msalRequest.scopes[0]}`],
        account: accounts[0],
      });

      logToStorage('Acquired Microsoft Token', tokenResponse.accessToken);

      // Exchange with backend
      const response = await axios.post(`${BASE_URL}/api/auth/microsoft/token`, {
        microsoft_token: tokenResponse.accessToken,
      });

      const backendToken = response.data.access_token;
      if (backendToken) {
        localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, backendToken);
        return backendToken;
      }
    }
  } catch (error) {
    logToStorage('Failed to acquire Microsoft token', error);
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
  logToStorage('Intercepting request', { url: config.url });

  let token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token && isUsingMicrosoftAuth()) {
    logToStorage('No token found, acquiring Microsoft token');
    token = await getMicrosoftToken();
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    logToStorage('No valid token available, request will fail.');
  }

  return config;
});

// Response Interceptor: Handle 401 Errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    logToStorage('Handling response error', {
      status: error.response?.status,
      url: error.config?.url,
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isUsingMicrosoftAuth()) {
        logToStorage('Refreshing Microsoft token');
        const newToken = await getMicrosoftToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } else {
        logToStorage('Refreshing native token');
        const newToken = await refreshAccessToken();
        if (newToken) {
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  }
);
