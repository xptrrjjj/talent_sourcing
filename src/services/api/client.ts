import axios from 'axios';
import { refreshAccessToken } from './auth';
import { msalRequest } from '../../config/msal';

const BASE_URL = 'https://44.211.135.244:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle authentication
apiClient.interceptors.request.use((config) => {
  // Check for Microsoft token first
  const msalAccount = window.sessionStorage.getItem('msal.account.keys');
  if (msalAccount) {
    const token = window.sessionStorage.getItem(`msal.${JSON.parse(msalAccount)[0]}.idToken`);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
  }

  // Fall back to regular token
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
      
      try {
        // Try to refresh Microsoft token first
        const msalAccount = window.sessionStorage.getItem('msal.account.keys');
        if (msalAccount) {
          // Let MSAL handle token refresh
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Fall back to regular token refresh
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);