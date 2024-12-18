import { apiClient } from '../../client';
import { APIError } from '../../../errors';
import type { AuthResponse } from '../../../../types';

export async function login(username: string, password: string): Promise<AuthResponse> {
  try {
    const response = await apiClient.post('/api/auth/login/', {
      username,
      password,
      app_id: 'talent_sourcing_platform'
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error: any) {
    console.error('[Auth] Login error:', error);
    throw new APIError(error.response?.data?.message || 'Login failed');
  }
}