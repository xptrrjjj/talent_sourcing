import { AxiosInstance } from 'axios';
import { tokenManager } from '../token';
import { requestQueue } from '../queue';

export function setupRequestInterceptor(client: AxiosInstance) {
  client.interceptors.request.use(async (config) => {
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
  });
}