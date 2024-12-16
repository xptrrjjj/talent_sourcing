import { Configuration, PopupRequest } from '@azure/msal-browser';

// Microsoft Authentication configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  system: {
    allowNativeBroker: false,
    loggerOptions: {
      logLevel: 3, // Error
      piiLoggingEnabled: false
    }
  }
};

// Microsoft login request configuration
export const msalRequest: PopupRequest = {
  scopes: ['User.Read', 'profile', 'email', 'offline_access'],
  prompt: 'select_account'
};

// Auth configuration constants
export const AUTH_STORAGE_KEYS = {
  USER_DATA: 'user_data',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token'
} as const;