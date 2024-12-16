import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import './index.css';
import { getMsalInstance } from './services/msal';

// Initialize MSAL instance
const msalInstance = await getMsalInstance();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <UserProvider>
        <App />
      </UserProvider>
    </MsalProvider>
  </StrictMode>
);