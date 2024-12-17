import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../storage';
import { AUTH_ROUTES } from '../constants';

export function useAuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated and on login page
    if (isAuthenticated() && location.pathname === AUTH_ROUTES.LOGIN) {
      navigate(AUTH_ROUTES.HOME, { replace: true });
    }
    // Check if user is not authenticated and not on login page
    else if (!isAuthenticated() && location.pathname !== AUTH_ROUTES.LOGIN) {
      navigate(AUTH_ROUTES.LOGIN, { replace: true });
    }
  }, [navigate, location.pathname]);
}