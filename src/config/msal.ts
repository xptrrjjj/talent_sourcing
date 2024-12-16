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
    redirectUri: window.location.origin, // Matches registered Redirect URI in Azure AD
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use sessionStorage for better security
    storeAuthStateInCookie: false, // Recommended for modern browsers
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Verbose, // Enable detailed logs for debugging
      loggerCallback: (level, message) => {
        console.log(`[MSAL:${level}] ${message}`);
      },
    },
  },
};

// Updated loginRequest to request API-specific scopes for your application
export const loginRequest: PopupRequest = {
  scopes: [`api://${import.meta.env.VITE_MICROSOFT_CLIENT_ID}/.default`], // App-specific scopes
};
