// import { Configuration, PopupRequest } from '@azure/msal-browser';

// // Microsoft Authentication configuration
// export const msalConfig: Configuration = {
//   auth: {
//     clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
//     authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
//     redirectUri: window.location.origin,
//     postLogoutRedirectUri: window.location.origin,
//     navigateToLoginRequestUrl: true
//   },
//   cache: {
//     cacheLocation: 'sessionStorage',
//     storeAuthStateInCookie: false
//   },
//   system: {
//     allowNativeBroker: false,
//     loggerOptions: {
//       logLevel: 3, // Error
//       piiLoggingEnabled: false
//     }
//   }
// };

// // Microsoft login request configuration
// export const msalRequest: PopupRequest = {
//   scopes: ['User.Read', 'profile', 'email', 'offline_access'],
//   prompt: 'select_account'
// };

// // Auth configuration constants
// export const AUTH_STORAGE_KEYS = {
//   USER_DATA: 'user_data',
//   ACCESS_TOKEN: 'access_token',
//   REFRESH_TOKEN: 'refresh_token'
// } as const;


import { Configuration, PopupRequest, LogLevel } from '@azure/msal-browser';

// Microsoft Authentication configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true, // Ensure user is redirected to the original request URL after login
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use sessionStorage for security
    storeAuthStateInCookie: false, // Avoid using cookies for auth state
  },
  system: {
    allowNativeBroker: false,
    loggerOptions: {
      logLevel: LogLevel.Verbose, // Enable detailed logs for debugging
      piiLoggingEnabled: false, // Disable personally identifiable information logs
      loggerCallback: (level, message) => {
        console.log(`[MSAL LogLevel ${level}] ${message}`);
      },
    },
  },
};

// Microsoft login request configuration
export const msalRequest: PopupRequest = {
  scopes: ['User.Read', 'profile', 'email', 'offline_access'], // Add scopes for required permissions
  prompt: 'select_account', // Ensure the user can select an account to avoid auto-login issues
};

// Auth configuration constants
export const AUTH_STORAGE_KEYS = {
  USER_DATA: 'user_data',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// Error handling for MSAL
export const handleAuthError = (error: any): void => {
  console.error('Authentication error:', error.message);

  // Add specific error handling for known MSAL errors
  if (error.name === 'InteractionRequiredAuthError') {
    console.error('Interaction required. User action needed.');
  } else if (error.name === 'BrowserAuthError') {
    console.error('Browser auth error:', error);
  } else {
    console.error('Unknown auth error:', error);
  }

  // Prevent further error propagation to stop unwanted reloads or crashes
};

// Log authentication results for debugging
export const logAuthResponse = (response: any): void => {
  console.log('Authentication response:', response);

  if (response.accessToken) {
    console.log('Access token acquired:', response.accessToken);
  }
  if (response.idToken) {
    console.log('ID token acquired:', response.idToken);
  }
  if (response.account) {
    console.log('Account details:', response.account);
  }
};
