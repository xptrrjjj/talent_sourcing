import { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: 'https://44.211.135.244:5173', // Frontend Redirect URI
    postLogoutRedirectUri: 'https://44.211.135.244:5173'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

export const msalRequest: PopupRequest = {
  scopes: ['User.Read', 'profile', 'email'],
  prompt: 'select_account'
};
