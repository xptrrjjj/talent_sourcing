import { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { tokenManager } from './token-manager';
import { requestQueue } from './queue';
import { refreshMicrosoftToken } from '../../auth/microsoft';
import { refreshAccessToken } from '../auth';
import { AUTH_ROUTES } from '../../auth/constants';

export async function requestInterceptor(config: InternalAxiosRequestConfig) {
  // Skip auth for login endpoints
  if (config.url?.includes('/api/auth/login/')) {
    return config;
  }

  const queueKey = requestQueue.getKey(
    config.method || 'get',
    config.url || '',
    config.data
  );

  return requestQueue.enqueue(queueKey, async () => {
    const authHeader = await tokenManager.getAuthHeader();
    if (authHeader) {
      config.headers.Authorization = authHeader;
    }
    return config;
  });
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

export async function responseErrorInterceptor(error: AxiosError) {
  const originalRequest = error.config;
  
  if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
    return Promise.reject(error);
  }

  if (isRefreshing) {
    return new Promise(resolve => {
      addRefreshSubscriber(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        resolve(axios(originalRequest));
      });
    });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  try {
    const tokenType = tokenManager.getTokenType();
    let newToken: string | null = null;

    if (tokenType === 'microsoft') {
      newToken = await refreshMicrosoftToken();
    } else if (tokenType === 'native') {
      newToken = await refreshAccessToken();
    }

    if (newToken) {
      onTokenRefreshed(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axios(originalRequest);
    }
  } catch (refreshError) {
    console.error('Token refresh failed:', refreshError);
  } finally {
    isRefreshing = false;
  }

  tokenManager.clearCache();
  requestQueue.clear();
  window.location.href = AUTH_ROUTES.LOGIN;
  return Promise.reject(error);
}

export function responseSuccessInterceptor(response: AxiosResponse) {
  return response;
}