import { PublicClientApplication, IPublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/msal';

let msalInstance: IPublicClientApplication | null = null;

/**
 * Get or initialize the MSAL instance.
 * Ensures proper handling of hash fragments and initializes the MSAL instance if not already initialized.
 */
export const getMsalInstance = async (): Promise<IPublicClientApplication> => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);

    // Handle the redirect promise to process authentication responses.
    try {
      const response = await msalInstance.handleRedirectPromise();
      if (response) {
        console.log('Redirect login response:', response);
      }
    } catch (error) {
      console.error('Error processing redirect:', error);
    }
  }
  return msalInstance;
};
