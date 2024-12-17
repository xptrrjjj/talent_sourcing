import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getStoredUser, isAuthenticated } from '../services/auth/storage';
import { AUTH_ROUTES } from '../services/auth/constants';
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
  const navigate = useNavigate();
  const auth = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user state
  useEffect(() => {
    const initUser = () => {
      try {
        if (isAuthenticated()) {
          const user = getStoredUser();
          setCurrentUser(user);
          if (window.location.pathname === AUTH_ROUTES.LOGIN) {
            navigate(AUTH_ROUTES.HOME, { replace: true });
          }
        }
      } catch (err) {
        console.error('Failed to initialize user:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initUser();
  }, [navigate]);

  const handleLogin = async (username: string, password: string) => {
    try {
      setError(null);
      await auth.login(username, password);
      const user = getStoredUser();
      setCurrentUser(user);
      navigate(AUTH_ROUTES.HOME, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setError(null);
      await auth.loginWithMicrosoft();
      const user = getStoredUser();
      setCurrentUser(user);
      navigate(AUTH_ROUTES.HOME, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microsoft login failed');
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isInitializing,
        isLoading: auth.isLoading,
        error,
        login: handleLogin,
        loginWithMicrosoft: handleMicrosoftLogin,
        logout: auth.logout
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