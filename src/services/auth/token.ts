import { tokenManager } from '../api/client/token';
import { refreshMicrosoftToken } from './microsoft';
import { refreshAccessToken } from '../api/auth';

export async function refreshToken(): Promise<string | null> {
  const tokenType = tokenManager.getTokenType();
  
  if (tokenType === 'microsoft') {
    return refreshMicrosoftToken();
  } 
  
  if (tokenType === 'native') {
    return refreshAccessToken();
  }

  return null;
}