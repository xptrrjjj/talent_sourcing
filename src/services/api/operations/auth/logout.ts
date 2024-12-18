import { apiClient } from '../../client';
import { AUTH_STORAGE_KEYS } from '../../../../config/auth';

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/api/auth/logout/');
  } finally {
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }
}