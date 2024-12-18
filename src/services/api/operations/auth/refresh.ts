import { apiClient } from '../../client';
import { AUTH_STORAGE_KEYS } from '../../../../config/auth';

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await apiClient.post('/api/auth/tokens/refresh', {
      refresh_token: refreshToken
    });

    if (response.data.access_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
      return response.data.access_token;
    }

    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}