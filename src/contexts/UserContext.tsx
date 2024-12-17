// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useAuth } from '../hooks/useAuth';
// import type { User } from '../types';

// interface UserContextType {
//   currentUser: User | null;
//   isLoading: boolean;
//   error: string | null;
//   login: (username: string, password: string) => Promise<void>;
//   loginWithMicrosoft: () => Promise<void>;
//   logout: () => Promise<void>;
// }

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export function UserProvider({ children }: { children: React.ReactNode }) {
//   const auth = useAuth();
//   const [currentUser, setCurrentUser] = useState<User | null>(null);

//   useEffect(() => {
//     const userData = localStorage.getItem('user_data');
//     if (userData) {
//       try {
//         setCurrentUser(JSON.parse(userData));
//       } catch (err) {
//         console.error('Failed to parse user data:', err);
//         localStorage.removeItem('user_data');
//       }
//     }
//   }, []);

//   const handleLogin = async (username: string, password: string) => {
//     const user = await auth.login(username, password);
//     setCurrentUser(user);
//   };

//   const handleMicrosoftLogin = async () => {
//     const user = await auth.loginWithMicrosoft();
//     setCurrentUser(user);
//   };

//   const handleLogout = async () => {
//     await auth.logout();
//     setCurrentUser(null);
//   };

//   return (
//     <UserContext.Provider
//       value={{
//         currentUser,
//         isLoading: auth.isLoading,
//         error: auth.error,
//         login: handleLogin,
//         loginWithMicrosoft: handleMicrosoftLogin,
//         logout: handleLogout
//       }}
//     >
//       {children}
//     </UserContext.Provider>
//   );
// }

// export function useUserContext() {
//   const context = useContext(UserContext);
//   if (context === undefined) {
//     throw new Error('useUserContext must be used within a UserProvider');
//   }
//   return context;
// }


import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getStoredUser, clearAuthData } from '../services/auth/storage';
import { AUTH_ROUTES } from '../services/auth/constants';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';

interface UserContextType {
  currentUser: User | null;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeUser = () => {
      try {
        const user = getStoredUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    // Small delay to prevent flash of loading state
    const timer = setTimeout(initializeUser, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const user = await auth.login(username, password);
    setCurrentUser(user);
  };

  const handleMicrosoftLogin = async () => {
    await auth.loginWithMicrosoft();
  };

  const handleLogout = async () => {
    clearAuthData();
    setCurrentUser(null);
    navigate(AUTH_ROUTES.LOGIN, { replace: true });
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isInitializing,
        isLoading: auth.isProcessingAuth,
        error: null,
        login: handleLogin,
        loginWithMicrosoft: handleMicrosoftLogin,
        logout: handleLogout
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}