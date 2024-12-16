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


import { Configuration, PopupRequest, LogLevel } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '', // Your App (Client) ID
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`, // Tenant ID
    redirectUri: 'https://44.211.135.244:8000/api/auth/microsoft/callback', // Matches backend's registered Redirect URI
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Verbose,
      loggerCallback: (level, message) => {
        console.log(`[MSAL:${level}] ${message}`);
      },
    },
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['User.Read'], // Adjust scopes based on your app's API permissions
};
