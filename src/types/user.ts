export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  access_token: string | null;
  refresh_token: string | null;
  user: {
    id: number;
    username: string;
  } | null;
  message: string;
}