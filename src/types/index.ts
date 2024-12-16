export * from './analysis';
export * from './company';
export * from './position';
export * from './user';
export * from './api';
export * from './pipeline';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  status: string;
  message?: string;
  user?: User;
  access_token?: string;
  refresh_token?: string;
}