import { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: 'https://recruiter.2bv.io/', // Frontend Redirect URI
    postLogoutRedirectUri: 'https://recruiter.2bv.io/',
    navigateToLoginRequestUrl: true
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
  }
};

export const msalRequest: PopupRequest = {
  scopes: [`${msalConfig.auth.clientId}/.default`], // GUID-based App Identifier
  prompt: 'select_account'
};
