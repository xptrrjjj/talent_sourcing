// import React from 'react';
// import { Login } from './pages/Login';
// import { Dashboard } from './pages/Dashboard';
// import { useUserContext } from './contexts/UserContext';
// import { LoadingOverlay } from './components/LoadingOverlay';

// export default function App() {
//   const { currentUser, isLoading } = useUserContext();

//   if (isLoading) {
//     return <LoadingOverlay message="Loading..." />;
//   }

//   if (!currentUser) {
//     return <Login />;
//   }

//   return <Dashboard />;
// }


import React from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { useUserContext } from './contexts/UserContext';
import { AuthLoader } from './components/auth/AuthLoader';

export default function App() {
  const { currentUser, isInitializing } = useUserContext();

  // Only show loader during initial app load
  if (isInitializing) {
    return <AuthLoader />;
  }

  if (!currentUser) {
    return <Login />;
  }

  return <Dashboard />;
}