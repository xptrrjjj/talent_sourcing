import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './config/msal';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import './index.css';

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

const Main = () => {
  useEffect(() => {
    const handleRedirectResponse = async () => {
      try {
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          console.log('MSAL Redirect Response:', response);
        }
      } catch (err) {
        console.error('Failed to handle redirect response:', err);
      }
    };

    handleRedirectResponse();
  }, []);

  return (
    <MsalProvider instance={msalInstance}>
      <UserProvider>
        <App />
      </UserProvider>
    </MsalProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Main />
  </StrictMode>
);
