import { AxiosInstance } from 'axios';
import { tokenManager } from '../token';
import { requestQueue } from '../queue';
import { refreshToken } from '../../../auth/token';
import { AUTH_ROUTES } from '../../../auth/constants';

export function setupResponseInterceptor(client: AxiosInstance) {
  let isRefreshing = false;
  let refreshSubscribers: Array<(token: string) => void> = [];

  function onTokenRefreshed(token: string) {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
  }

  function addRefreshSubscriber(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
  }

  client.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(resolve => {
          addRefreshSubscriber(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        
        if (newToken) {
          onTokenRefreshed(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
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
  );
}