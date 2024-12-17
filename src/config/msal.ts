import { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false // Disable navigation for popup flow
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    allowNativeBroker: false,
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
    popupWindowAttributes: {
      width: 483,
      height: 600,
      top: window.screenY + (window.outerHeight - 600) / 2,
      left: window.screenX + (window.outerWidth - 483) / 2,
    }
  }
};

export const msalRequest: PopupRequest = {
  scopes: ['User.Read', 'profile', 'email', 'openid'],
  prompt: 'select_account'
};