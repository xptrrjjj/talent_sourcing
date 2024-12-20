// import axios from 'axios';
// import { refreshAccessToken } from './auth';
// import { msalRequest, msalConfig } from '../../config/msal';
// import { PublicClientApplication } from '@azure/msal-browser';
// import { AUTH_STORAGE_KEYS } from '../../config/auth';
// import { getMsalInstance } from '../msal';

// const BASE_URL = 'https://44.211.135.244:8000';

// // Determines if Microsoft authentication is active
// const isUsingMicrosoftAuth = () => {
//   const hasMsalAccount = window.sessionStorage.getItem('msal.account.keys') !== null;
//   console.log('[Auth] Checking Microsoft Auth status:', hasMsalAccount);
//   return hasMsalAccount;
// };

// // Get Microsoft Token and Exchange with Backend
// const getMicrosoftToken = async () => {
//   try {
//     const msalInstance = await getMsalInstance();
//     const accounts = msalInstance.getAllAccounts();
//     console.log('[Auth] MSAL Accounts:', accounts);

//     if (accounts.length > 0) {
//       const tokenResponse = await msalInstance.acquireTokenSilent({
//         scopes: ['User.Read', 'profile', 'email', 'openid'],
//         account: accounts[0],
//       });

//       console.log('[Auth] MSAL Token Response:', tokenResponse);
//       console.log('[Auth] Sending access token to backend', tokenResponse.accessToken);

//       const response = await axios.post(`${BASE_URL}/api/auth/microsoft/callback`, {
//         microsoft_token: tokenResponse.accessToken,
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       });

//       if (response.data.access_token) {
//         console.log('[Auth] Backend token acquired');
//         localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
//         return response.data.access_token;
//       }
//     }
//     return null;
//   } catch (error: any) {
//     console.error('[Auth] Error fetching Microsoft token:', error);
//     if (error.response?.data) {
//       console.error('[Auth] Backend error details:', {
//         detail: error.response?.data?.detail,
//         raw: error.response?.data,
//         request: {
//           url: error.config?.url,
//           data: JSON.parse(error.config?.data || '{}'),
//           headers: error.config?.headers
//         },
//         response: {
//           status: error.response?.status,
//           statusText: error.response?.statusText,
//           data: error.response?.data
//         }
//       });
//     }
//     return null;
//   }
// };



// // Axios Client with Token Handling
// export const apiClient = axios.create({
//   baseURL: BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// // Request Interceptor: Attach Token
// apiClient.interceptors.request.use(async (config) => {
//   console.log('[API] Intercepting request to:', config.url);

//   // Skip token for login endpoints
//   if (config.url?.includes('/api/auth/login/')) {
//     console.log('[API] Skipping token for login endpoint');
//     return config;
//   }

//   let token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
//   console.log('[API] Existing Token:', token);

//   if (!token && isUsingMicrosoftAuth()) {
//     console.log('[API] No token found. Fetching Microsoft token...');
//     token = await getMicrosoftToken();
//   }

//   if (token) {
//     console.log('[API] Attaching token to request');
//     config.headers.Authorization = `Bearer ${token}`;
//   } else {
//     console.warn('[API] No valid token found. Request may fail.');
//   }

//   return config;  // Always return config, let the request proceed
// });

// // Response Interceptor: Handle 401 Errors
// apiClient.interceptors.response.use(
//   (response) => {
//     console.log('[API] Response received from:', response.config.url, response.data);
//     return response;
//   },
//   async (error) => {
//     console.error('[API] Error response:', {
//       status: error.response?.status,
//       url: error.config?.url,
//       message: error.message,
//     });

//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       console.warn('[API] Handling 401 error');
//       originalRequest._retry = true;

//       if (isUsingMicrosoftAuth()) {
//         console.log('[API] Refreshing Microsoft token...');
//         const newToken = await getMicrosoftToken();
//         if (newToken) {
//           console.log('[API] Retrying request with new Microsoft token.');
//           originalRequest.headers.Authorization = `Bearer ${newToken}`;
//           return apiClient(originalRequest);
//         }
//       }

//       // For native login, clear tokens and use handleAuthError for delayed redirect
//       //console.error('[API] Authentication failed. Clearing tokens.');
//       //localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
//       //localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
//       return handleAuthError(error);
//     }

//     return Promise.reject(error);
//   }
// );

// const handleAuthError = (error: any) => {
//   console.error('[Auth] Error occurred:', error);
//   if (error.response?.data) {
//     console.error('[Auth] Error details:', {
//       detail: error.response.data.detail,
//       raw: error.response.data
//     });
//   }
  
//   // Add a 10-minute delay before redirect
//   const lastRedirect = localStorage.getItem('last_auth_redirect');
//   const now = Date.now();
//   const TEN_MINUTES = 10 * 60 * 1000; // 10 minutes in milliseconds
  
//   if (!lastRedirect || (now - parseInt(lastRedirect)) > TEN_MINUTES) {
//     localStorage.setItem('last_auth_redirect', now.toString());
//     setTimeout(() => {
//       window.location.href = '/login';
//     }, 1000);
//   }
  
//   return Promise.reject(error);
// };



import axios from 'axios';
import { refreshAccessToken } from './auth';
import { msalRequest, msalConfig } from '../../config/msal';
import { PublicClientApplication } from '@azure/msal-browser';
import { AUTH_STORAGE_KEYS } from '../../config/auth';
import { getMsalInstance } from '../msal';

const BASE_URL = 'https://framework.2bv.io';

// Track token refresh attempts to prevent infinite loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Determines if Microsoft authentication is active
const isUsingMicrosoftAuth = () => {
  const hasMsalAccount = window.sessionStorage.getItem('msal.account.keys') !== null;
  return hasMsalAccount;
};

// Get Microsoft Token and Exchange with Backend
const getMicrosoftToken = async (forceRefresh = false): Promise<string | null> => {
  try {
    const msalInstance = await getMsalInstance();
    const accounts = msalInstance.getAllAccounts();

    if (accounts.length === 0) {
      console.warn('[Auth] No MSAL accounts found');
      return null;
    }

    let tokenResponse;
    try {
      // Try silent token acquisition first
      tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ['User.Read', 'profile', 'email', 'openid'],
        account: accounts[0],
      });
    } catch (error) {
      if (forceRefresh) {
        console.log('[Auth] Silent token acquisition failed, attempting interactive refresh');
        tokenResponse = await msalInstance.acquireTokenPopup({
          scopes: ['User.Read', 'profile', 'email', 'openid'],
          account: accounts[0],
        });
      } else {
        throw error;
      }
    }

    if (!tokenResponse?.accessToken) {
      console.error('[Auth] No access token in MSAL response');
      return null;
    }

    // Exchange Microsoft token for backend token
    const response = await axios.post(`${BASE_URL}/api/auth/microsoft/callback`, {
      microsoft_token: tokenResponse.accessToken,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (response.data.access_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
      return response.data.access_token;
    }

    return null;
  } catch (error: any) {
    console.error('[Auth] Error in getMicrosoftToken:', error);
    return null;
  }
};

// Axios Client with Token Handling
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor
apiClient.interceptors.request.use(async (config) => {
  // Skip token for login endpoints
  if (config.url?.includes('/api/auth/login/')) {
    return config;
  }

  let token = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token && isUsingMicrosoftAuth()) {
    token = await getMicrosoftToken();
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a token refresh is already in progress, queue this request
        try {
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        let newToken: string | null = null;

        if (isUsingMicrosoftAuth()) {
          newToken = await getMicrosoftToken(true); // Force refresh
        } else {
          newToken = await refreshAccessToken();
        }

        if (newToken) {
          localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, newToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Process any queued requests
          processQueue(null, newToken);
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens and redirect to login
        localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);