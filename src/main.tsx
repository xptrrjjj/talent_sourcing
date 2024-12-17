import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import './index.css';
import { getMsalInstance } from './services/msal';

// Initialize MSAL instance
const msalInstance = await getMsalInstance();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MsalProvider instance={msalInstance}>
        <UserProvider>
          <App />
        </UserProvider>
      </MsalProvider>
    </BrowserRouter>
  </StrictMode>
);