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
    redirectUri: 'https://44.211.135.244:8000/api/auth/microsoft/callback', // Redirect to backend for code exchange
    postLogoutRedirectUri: window.location.origin, // Redirect to frontend after logout
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use sessionStorage for better security
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Verbose, // Enable detailed logs
      loggerCallback: (level, message) => {
        console.log(`[MSAL:${level}] ${message}`);
      },
    },
    allowNativeBroker: false, // For browser-based login
  },
};

export const msalRequest: PopupRequest = {
  scopes: ['User.Read', 'profile', 'email'], // Ensure these match Azure's app registration permissions
  prompt: 'select_account', // Always prompt the user to select an account
};
