import axios from 'axios';
import { apiClient } from './client';
import type { User, AuthResponse } from '../../types';

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
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token!);

    // Return user data
    return {
      id: response.data.user.id.toString(),
      name: response.data.user.username,
      email: `${response.data.user.username}@example.com` // Placeholder
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
    throw error;
  }
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh_token');
  
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

    localStorage.setItem('access_token', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
    throw error;
  }
}