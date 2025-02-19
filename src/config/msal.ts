import { Configuration, PopupRequest } from '@azure/msal-browser';

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: isSafari,
  },
  system: {
    allowNativeBroker: false,
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) {
          console.log(`[MSAL] ${message}`);
        }
      },
      logLevel: 3,
      piiLoggingEnabled: false,
    },
  },
};

export const msalRequest: PopupRequest = {
  scopes: ['User.Read', 'profile', 'email', 'openid'],
  prompt: 'select_account',
  redirectUri: window.location.origin
};