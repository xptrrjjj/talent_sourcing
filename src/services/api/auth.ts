import axios from 'axios';
import { apiClient } from './client';
import type { User, AuthResponse } from '../../types';
import { AUTH_STORAGE_KEYS } from '../../config/auth';

export async function login(username: string, password: string): Promise<User> {
  try {
    const response = await apiClient.post<AuthResponse>('/api/auth/login/', {
      username,
      password,
      app_id: 'talent_sourcing_platform'
    });

    if (response.data.status === 'error' || !response.data.access_token || !response.data.user) {
      throw new Error(response.data.message || 'Login failed');
    }

    // Store tokens
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh_token!);

    // Return user data
    return {
      id: response.data.user.id.toString(),
      name: response.data.user.username,
      email: `${response.data.user.username}@example.com`
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
    throw error;
  }
}

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



export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await apiClient.post<AuthResponse>('/api/auth/refresh/', {
      refresh_token: refreshToken,
      app_id: 'talent_sourcing_platform'
    });

    if (response.data.status === 'error' || !response.data.access_token) {
      throw new Error(response.data.message || 'Token refresh failed');
    }

    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
    throw error;
  }
}

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