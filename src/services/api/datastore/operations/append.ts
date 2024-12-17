import { apiClient } from '../../client';
import { APIError } from '../../../errors';
import { withRetry } from '../utils/retry';
import { validateRecord } from '../validation';
import { batchProcessor } from '../../client/batch';
import type { DatastoreResponse } from '../../../../types';

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