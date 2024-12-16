import { apiClient } from '../services/api/client';
import type { User } from '../types';

export const AUTH_STORAGE_KEYS = {
  USER_DATA: 'user_data',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// Validate Microsoft token with backend
export async function validateMicrosoftToken(): Promise<User> {
  try {
    // Fetch user information from the backend after redirect
    const response = await apiClient.get('/api/auth/microsoft/user'); // Backend returns validated user info

    if (response.data.status === 'error' || !response.data.user) {
      throw new Error(response.data.message || 'Microsoft login validation failed');
    }

    // Store tokens if provided
    if (response.data.access_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh_token);
    }

    // Save user data to localStorage
    const user = {
      id: response.data.user.id.toString(),
      name: response.data.user.name || response.data.user.username,
      email: response.data.user.email,
    };
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(user));

    return user;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Microsoft login validation failed');
  }
}

// Logout flow
export async function logout(): Promise<void> {
  // Clear local storage
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);

  // Clear backend session
  await apiClient.post('/api/auth/logout/');
}
