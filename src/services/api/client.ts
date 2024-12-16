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
        // Request token for our backend API
        const tokenResponse = await msalInstance.acquireTokenSilent({
          scopes: [`api://${msalConfig.auth.clientId}/access_as_user`], // Use your API's scope
          account: accounts[0]
        });
        
        logToStorage('Token acquired for backend API', {
          scopes: tokenResponse.scopes,
          tokenType: tokenResponse.tokenType
        });
        
        return tokenResponse.accessToken;
      } catch (silentError) {
        logToStorage('Silent token acquisition failed', silentError);
        try {
          // Try interactive as fallback
          const interactiveResponse = await msalInstance.acquireTokenPopup({
            scopes: [`api://${msalConfig.auth.clientId}/access_as_user`],
            account: accounts[0]
          });
          return interactiveResponse.accessToken;
        } catch (interactiveError) {
          logToStorage('Interactive token acquisition failed', interactiveError);
          return null;
        }
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
  
  if (isUsingMicrosoftAuth()) {
    const token = await getMicrosoftToken();
    if (token) {
      logToStorage('Using Microsoft token', { tokenLength: token.length });
      config.headers.Authorization = `Bearer ${token}`;
      // Store token for future use
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
    } else {
      logToStorage('No Microsoft token available');
      // Clear any stored tokens
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      return handleAuthError(new Error('No Microsoft token available'));
    }
  } else {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      logToStorage('Using stored token', { tokenLength: token.length });
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      logToStorage('No token found');
      return handleAuthError(new Error('No token available'));
    }
  }
  return config;
}, (error) => {
  logToStorage('Request interceptor error', error);
  return Promise.reject(error);
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