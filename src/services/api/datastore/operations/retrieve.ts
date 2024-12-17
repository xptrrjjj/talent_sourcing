import { apiClient } from '../../client';
import { APIError } from '../../../errors';
import { withRetry } from '../utils/retry';
import { validateRecordData } from '../validation';
import { batchProcessor } from '../../client/batch';
import type { DatastoreResponse, DatastoreRecord } from '../../../../types';

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