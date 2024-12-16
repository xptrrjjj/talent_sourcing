import axios from 'axios';
import { refreshAccessToken } from './auth';
import { msalRequest, msalConfig } from '../../config/msal';
import { PublicClientApplication } from '@azure/msal-browser';
import { AUTH_STORAGE_KEYS } from '../../config/auth';
import { getMsalInstance } from '../msal';

const BASE_URL = 'https://44.211.135.244:8000';

// Add this at the top
const logToStorage = (message: string, data?: any) => {
  const logs = JSON.parse(localStorage.getItem('auth_debug_logs') || '[]');
  logs.push({
    timestamp: new Date().toISOString(),
    message,
    data
  });
  localStorage.setItem('auth_debug_logs', JSON.stringify(logs.slice(-20))); // Keep last 20 logs
};

// Track which auth method is being used
const isUsingMicrosoftAuth = () => {
  const hasMsalAccount = window.sessionStorage.getItem('msal.account.keys') !== null;
  logToStorage('Auth method check', { hasMsalAccount });
  return hasMsalAccount;
};

// Add this helper function
const handleAuthError = (error: any) => {
  logToStorage('Auth error occurred', {
    status: error.response?.status,
    url: error.config?.url,
    message: error.message,
    stack: error.stack
  });
  
  console.error('Auth error:', {
    status: error.response?.status,
    url: error.config?.url,
    message: error.message
  });
  
  // Add a 10-minute delay before redirect
  const lastRedirect = localStorage.getItem('last_auth_redirect');
  const now = Date.now();
  const TEN_MINUTES = 10 * 60 * 1000; // 10 minutes in milliseconds
  
  if (!lastRedirect || (now - parseInt(lastRedirect)) > TEN_MINUTES) {
    localStorage.setItem('last_auth_redirect', now.toString());
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }
  
  return Promise.reject(error);
};

// Add this helper function
const getMicrosoftToken = async () => {
  try {
    const msalInstance = await getMsalInstance();
    const accounts = msalInstance.getAllAccounts();
    logToStorage('MSAL accounts found', { count: accounts.length });
    
    if (accounts.length > 0) {
      try {
        // Get Microsoft token
        const tokenResponse = await msalInstance.acquireTokenSilent({
          scopes: ['User.Read', 'profile', 'email', 'openid'],
          account: accounts[0]
        });
        
        // Exchange Microsoft token for backend token
        const response = await axios.post(`${BASE_URL}/api/auth/microsoft/token`, {
          microsoft_token: tokenResponse.accessToken
        });

        if (response.data.access_token) {
          // Store and return backend token
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
          return response.data.access_token;
        }
      } catch (error) {
        logToStorage('Token acquisition/exchange failed', error);
        return null;
      }
    }
    return null;
  } catch (error) {
    logToStorage('Failed to get Microsoft token', error);
    return null;
  }
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle authentication
apiClient.interceptors.request.use(async (config) => {
  logToStorage('Request interceptor start', { url: config.url });
  
  // Always try stored token first
  const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  if (storedToken) {
    logToStorage('Using stored token');
    config.headers.Authorization = `Bearer ${storedToken}`;
    return config;
  }
  
  // If no stored token and using Microsoft auth, get new token
  if (isUsingMicrosoftAuth()) {
    const token = await getMicrosoftToken();
    if (token) {
      logToStorage('Using new Microsoft token');
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
  }

  logToStorage('No valid token available');
  return handleAuthError(new Error('No valid token available'));
});

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    logToStorage('Response error interceptor', {
      status: error.response?.status,
      url: error.config?.url
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      logToStorage('Handling 401 error');
      originalRequest._retry = true;
      
      if (isUsingMicrosoftAuth()) {
        logToStorage('Microsoft auth needs refresh');
        return handleAuthError(error);
      } else {
        try {
          const newToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
          return handleAuthError(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);