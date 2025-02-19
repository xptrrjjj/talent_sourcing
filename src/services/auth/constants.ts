export const AUTH_STORAGE_KEYS = {
  USER_DATA: 'user_data',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const AUTH_ROUTES = {
  LOGIN: '/login',
  HOME: '/',
} as const;

export const AUTH_SCOPES = ['User.Read', 'profile', 'email', 'openid'];

export const AUTH_ERRORS = {
  POPUP_BLOCKED: 'Popup was blocked by the browser',
  AUTH_FAILED: 'Authentication failed',
  TOKEN_ACQUISITION_FAILED: 'Failed to acquire access token',
} as const;