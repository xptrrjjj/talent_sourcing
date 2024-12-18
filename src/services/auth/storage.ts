import { AUTH_STORAGE_KEYS } from './constants';
import type { User } from '../../types';

export function getStoredUser(): User | null {
  try {
    const userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
    if (!userData) return null;

    const user = JSON.parse(userData);
    
    // Ensure we have valid user data
    if (!user.id || !user.name || !user.email) {
      console.warn('Invalid user data found:', user);
      clearAuthData();
      return null;
    }

    return {
      id: user.id.toString(), // Ensure ID is string
      name: user.name || user.email.split('@')[0], // Fallback to email username if name missing
      email: user.email
    };
  } catch (err) {
    console.error('Failed to parse user data:', err);
    clearAuthData();
    return null;
  }
}

export function storeAuthData(token: string, user: User): void {
  // Ensure user data is complete
  const userData: User = {
    id: user.id.toString(),
    name: user.name || user.email.split('@')[0], // Fallback to email username
    email: user.email
  };

  localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  sessionStorage.setItem('auth_success', 'true');
  console.log('Auth data stored successfully');
}

export function clearAuthData(): void {
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  sessionStorage.removeItem('auth_success');
}

export function isAuthenticated(): boolean {
  const hasToken = !!getStoredToken();
  const hasUser = !!getStoredUser();
  return hasToken && hasUser;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
}