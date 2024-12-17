import { apiClient } from '../client';
import { APIError } from '../../errors';
import { withRetry } from './retry';
import { validateRecord, validateRecordData } from './validation';
import { batchProcessor } from '../client/batch';
import type { DatastoreResponse, DatastoreRecord } from '../../../types';

export async function createRecord(recordId: string, data: Record<string, any>): Promise<void> {
  if (!validateRecord(data)) {
    throw new APIError('Invalid record data format');
  }

  await withRetry(async () => {
    const operation = () => apiClient.post<DatastoreResponse>('/api/datastore/create', {
      identifier: 'talent_sourcing_platform',
      action: 'create',
      data: {
        app_id: 'talent_sourcing_platform',
        record_id: recordId,
        ...data
      }
    });

    const response = await batchProcessor.add(operation);

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
    const operation = () => apiClient.post<DatastoreResponse>('/api/datastore/create', {
      identifier: 'talent_sourcing_platform',
      action: 'append',
      data: {
        record_id: recordId,
        ...data
      }
    });

    const response = await batchProcessor.add(operation);

    if (response.data.status === 'error') {
      throw new APIError(response.data.message || 'Failed to append to record');
    }
  }, 'Append to record');
}

export async function retrieveRecords(filters?: Record<string, any>): Promise<DatastoreRecord[]> {
  return withRetry(async () => {
    const operation = () => apiClient.post<DatastoreResponse>('/api/datastore/retrieve', {
      identifier: 'talent_sourcing_platform',
      filters: filters || {}
    });

    const response = await batchProcessor.add(operation);

    if (response.data.status === 'error') {
      throw new APIError(response.data.message || 'Failed to retrieve records');
    }

    return (response.data.data || []).filter(validateRecordData);
  }, 'Retrieve records');
}