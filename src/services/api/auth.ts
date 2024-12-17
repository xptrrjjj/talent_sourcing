import axios from 'axios';
import { apiClient } from './client';
import type { User, AuthResponse } from '../../types';
import { AUTH_STORAGE_KEYS } from '../../config/auth';

export const login = async (username: string, password: string) => {
  try {
    const response = await apiClient.post('/api/auth/login/', {
      username,
      password,
      app_id: 'talent_sourcing_platform'
    });

    console.log('[Auth] Login response:', response.data);

    if (response.data.status === 'error') {
      throw new Error(response.data.message);
    }

    if (response.data.status === 'success' && response.data.access_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh_token);
      }
      if (response.data.user) {
        localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
      }
      return response.data;
    }

    throw new Error('Invalid response from server');
  } catch (error: any) {
    console.error('[Auth] Login error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export async function validateMicrosoftToken(): Promise<User> {
  try {
    // Fetch user info after successful login
    const response = await apiClient.get('/api/auth/microsoft/user'); // Example endpoint for fetching user info

    if (response.data.status === 'error' || !response.data.user) {
      throw new Error(response.data.message || 'Microsoft login failed');
    }

    // Store tokens if provided
    if (response.data.access_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
    }
    if (response.data.refresh_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh_token);
    }

    return {
      id: response.data.user.id.toString(),
      name: response.data.user.name || response.data.user.username,
      email: response.data.user.email,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Microsoft login validation failed');
    }
    throw error;
  }
}

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await apiClient.post('/api/auth/refresh', {
    refresh_token: refreshToken
  });

  if (response.data.access_token) {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
    return response.data.access_token;
  }

  throw new Error('Failed to refresh token');
};

export async function logout(): Promise<void> {
  try {
    // Clear backend session
    await apiClient.post('/api/auth/logout/');
  } finally {
    // Clear local storage (even if backend call fails)
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  }
}