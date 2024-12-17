import { APIError } from '../../errors';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000   // 5 seconds
} as const;

// Exponential backoff with jitter
export function getRetryDelay(attempt: number): number {
  const baseDelay = Math.min(
    RETRY_CONFIG.maxDelay,
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt)
  );
  return baseDelay + Math.random() * baseDelay * 0.1; // Add 10% jitter
}

// Retry wrapper for API calls
export async function withRetry<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.error(`${context} attempt ${attempt + 1} failed:`, error);
      
      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const delay = getRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new APIError(`${context} failed after ${RETRY_CONFIG.maxRetries} attempts`);
}