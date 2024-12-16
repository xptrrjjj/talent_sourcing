// import { Configuration, PopupRequest } from '@azure/msal-browser';

// export const msalConfig: Configuration = {
//   auth: {
//     clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
//     authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
//     redirectUri: window.location.origin,
//   },
//   cache: {
//     cacheLocation: 'sessionStorage',
//     storeAuthStateInCookie: false,
//   }
// };

// export const loginRequest: PopupRequest = {
//   scopes: ['User.Read', 'profile', 'email']
// };


import { Configuration, RedirectRequest, LogLevel } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '', // Azure App (Client) ID
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`, // Tenant ID
    redirectUri: window.location.origin, // Frontend URI to handle post-login flow
    postLogoutRedirectUri: window.location.origin, // Frontend URI post-logout
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Verbose, // Enable detailed logs for debugging
      loggerCallback: (level, message) => {
        console.log(`[MSAL:${level}] ${message}`);
      },
    },
    allowNativeBroker: false, // Only relevant for desktop apps
  },
};

// Use RedirectRequest for proper flow
export const msalRequest: RedirectRequest = {
  scopes: ['User.Read', 'profile', 'email'], // Ensure these match Azure's app registration permissions
  redirectUri: 'https://44.211.135.244:8000/api/auth/microsoft/callback', // Backend callback URI
};
