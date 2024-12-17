import { AUTH_STORAGE_KEYS } from './constants';
import type { User } from '../../types';

export function getStoredUser(): User | null {
  try {
    const userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (err) {
    console.error('Failed to parse user data:', err);
    clearAuthData();
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
}

export function storeAuthData(token: string, user: User): void {
  localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
}

export function clearAuthData(): void {
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
}