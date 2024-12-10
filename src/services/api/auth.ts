import axios from 'axios';
import { APIError } from '../errors';

const API_URL = 'http://44.211.135.244:8000';
const APP_ID = 'talent_sourcing_platform';

interface LoginResponse {
  status: 'success' | 'error';
  access_token: string | null;
  refresh_token: string | null;
  user: {
    id: number;
    username: string;
  } | null;
  message: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login/`, {
      username,
      password,
      app_id: APP_ID
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new APIError(error.response.data.message || 'Login failed');
    }
    throw new APIError('Failed to connect to authentication server');
  }
}

export function setAuthToken(token: string) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearAuthToken() {
  delete axios.defaults.headers.common['Authorization'];
}