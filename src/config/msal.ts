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
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin, // Ensure this matches the registered redirect URI in Azure
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use sessionStorage for better security
    storeAuthStateInCookie: false, // Recommended for modern browsers
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Verbose, // Enable detailed logs
      loggerCallback: (level, message) => {
        console.log(`[MSAL:${level}] ${message}`);
      },
    },
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'profile', 'email'], // Ensure these scopes are granted in Azure AD
};
