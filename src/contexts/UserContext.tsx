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
import type { User } from '../types';

interface UserContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeUser = () => {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          setCurrentUser(JSON.parse(userData));
        } catch (err) {
          console.error('Failed to parse user data:', err);
          localStorage.removeItem('user_data');
        }
      }
      setIsInitialized(true);
    };

    initializeUser();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const user = await auth.login(username, password);
    setCurrentUser(user);
  };

  const handleMicrosoftLogin = async () => {
    await auth.loginWithMicrosoft();
  };

  const handleLogout = async () => {
    localStorage.removeItem('user_data');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
    window.location.replace('/login');
  };

  // Don't render children until we've checked for existing user data
  if (!isInitialized) {
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
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