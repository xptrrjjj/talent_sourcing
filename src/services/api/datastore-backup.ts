import { apiClient } from './client';
import { APIError } from '../errors';
import type { DatastoreResponse, DatastoreRecord } from '../types';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000   // 5 seconds
};

// Exponential backoff with jitter
function getRetryDelay(attempt: number): number {
  const baseDelay = Math.min(
    RETRY_CONFIG.maxDelay,
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt)
  );
  return baseDelay + Math.random() * baseDelay * 0.1; // Add 10% jitter
}

// Retry wrapper for API calls
async function withRetry<T>(
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
  
  throw lastError || new Error(`${context} failed after ${RETRY_CONFIG.maxRetries} attempts`);
}

// Validate record data
function validateRecord(data: any): boolean {
  return data && typeof data === 'object' && !Array.isArray(data);
}

export async function createRecord(recordId: string, data: Record<string, any>): Promise<void> {
  if (!validateRecord(data)) {
    throw new APIError('Invalid record data format');
  }

  await withRetry(async () => {
    const response = await apiClient.post<DatastoreResponse>('/api/datastore/create', {
      identifier: 'talent_sourcing_platform',
      action: 'create',
      data: {
        app_id: 'talent_sourcing_platform',
        record_id: recordId,
        ...data
      }
    }, {
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (response.data.status === 'error') {
      throw new APIError(response.data.message || 'Failed to create record');
    }
  }, 'Create record');
}

export async function appendToRecord(recordId: string, data: Record<string, any>): Promise<void> {
  if (!validateRecord(data)) {
    throw new APIError('Invalid record data format');
  }

  await withRetry(async () => {
    const response = await apiClient.post<DatastoreResponse>('/api/datastore/create', {
      identifier: 'talent_sourcing_platform',
      action: 'append',
      data: {
        record_id: recordId,
        ...data
      }
    }, {
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (response.data.status === 'error') {
      throw new APIError(response.data.message || 'Failed to append to record');
    }
  }, 'Append to record');
}

export async function retrieveRecords(filters?: Record<string, any>): Promise<DatastoreRecord[]> {
  return withRetry(async () => {
    const response = await apiClient.post<DatastoreResponse>('/api/datastore/retrieve', {
      identifier: 'talent_sourcing_platform',
      filters: filters || {}
    }, {
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (response.data.status === 'error') {
      throw new APIError(response.data.message || 'Failed to retrieve records');
    }

    // Validate and filter out invalid records
    const validRecords = (response.data.data || []).filter(record => 
      record && 
      record.record_id && 
      validateRecord(record.data)
    );

    return validRecords;
  }, 'Retrieve records');
}