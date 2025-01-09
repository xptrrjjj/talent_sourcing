import { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false, // Prevent navigation to the original request URL to avoid hash clearing in Safari
  },
  cache: {
    cacheLocation: 'localStorage', // Use localStorage for better persistence and Safari compatibility
    storeAuthStateInCookie: true, // Ensure compatibility with Safari and strict cookie policies
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
      logLevel: 3, // Verbose logging for debugging issues
      piiLoggingEnabled: false,
    },
  },
};

export const msalRequest: PopupRequest = {
  scopes: ['User.Read', 'profile', 'email', 'openid'], // Ensure these scopes align with the app registration
  prompt: 'select_account', // Prompt the user to select an account
};
