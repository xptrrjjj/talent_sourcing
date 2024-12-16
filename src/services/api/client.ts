import axios from 'axios';
import { refreshAccessToken } from './auth';
import { msalRequest, msalConfig } from '../../config/msal';
import { PublicClientApplication } from '@azure/msal-browser';
import { AUTH_STORAGE_KEYS } from '../../config/auth';

const BASE_URL = 'https://44.211.135.244:8000';

// Track which auth method is being used
const isUsingMicrosoftAuth = () => {
  return window.sessionStorage.getItem('msal.account.keys') !== null;
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle authentication
apiClient.interceptors.request.use(async (config) => {
  if (isUsingMicrosoftAuth()) {
    // Microsoft authentication
    try {
      const msalInstance = new PublicClientApplication(msalConfig);
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        const tokenResponse = await msalInstance.acquireTokenSilent({
          scopes: msalRequest.scopes,
          account: accounts[0]
        });
        config.headers.Authorization = `Bearer ${tokenResponse.accessToken}`;
        return config;
      }
    } catch (error) {
      console.error('Error getting Microsoft token:', error);
    }
  } else {
    // Regular authentication
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (isUsingMicrosoftAuth()) {
        // Microsoft auth refresh
        window.location.href = '/login';
        return Promise.reject(error);
      } else {
        // Regular auth refresh
        try {
          const newToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);