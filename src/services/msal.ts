import { PublicClientApplication, IPublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/msal';

let msalInstance: IPublicClientApplication | null = null;

export const getMsalInstance = async (): Promise<IPublicClientApplication> => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
  }
  return msalInstance;
}; 