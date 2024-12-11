import { apiClient } from './client';
import { APIError } from '../errors';
import type { DatastoreResponse, DatastoreRecord } from '../../types';

export async function createRecord(recordId: string, data: Record<string, any>): Promise<void> {
  try {
    console.log('Creating record:', { recordId, data });
    const response = await apiClient.post<DatastoreResponse>('/api/datastore/create', {
      identifier: 'talent_sourcing_platform',
      action: 'create',
      data: {
        app_id: 'talent_sourcing_platform',
        record_id: recordId,
        ...data
      }
    });
    console.log('Create record response:', response.data);

    if (response.data.status === 'error') {
      throw new APIError(response.data.message || 'Failed to create record');
    }
  } catch (error) {
    console.error('Create record error:', error);
    throw error;
  }
}

export async function appendToRecord(recordId: string, data: Record<string, any>): Promise<void> {
  try {
    console.log('Appending to record:', { recordId, data });
    const response = await apiClient.post<DatastoreResponse>('/api/datastore/create', {
      identifier: 'talent_sourcing_platform',
      action: 'append',
      data: {
        record_id: recordId,
        ...data
      }
    });
    console.log('Append record response:', response.data);

    if (response.data.status === 'error') {
      throw new APIError(response.data.message || 'Failed to append to record');
    }
  } catch (error) {
    console.error('Append record error:', error);
    throw error;
  }
}

export async function retrieveRecords(filters?: Record<string, any>): Promise<DatastoreRecord[]> {
  try {
    console.log('Retrieving records with filters:', filters);
    const response = await apiClient.post<DatastoreResponse>('/api/datastore/retrieve', {
      identifier: 'talent_sourcing_platform',
      filters: filters || {}
    });
    console.log('Retrieved records:', response.data);

    if (response.data.status === 'error') {
      throw new APIError(response.data.message || 'Failed to retrieve records');
    }

    return response.data.data || [];
  } catch (error) {
    console.error('Retrieve records error:', error);
    throw error;
  }
}