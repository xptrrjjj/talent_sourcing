import type { SavedPosition } from '../../../types';
import { createRecord, retrieveRecords } from '../../api/datastore';
import { APIError } from '../../errors';
import { validatePositionRecord, mapPositionRecord, validatePositionData } from './validation';

export async function getSavedPositions(): Promise<SavedPosition[]> {
  try {
    const response = await retrieveRecords({ type: 'position' });
    
    if (!Array.isArray(response)) {
      throw new APIError('Invalid response format from datastore');
    }

    return response
      .filter(validatePositionRecord)
      .map(mapPositionRecord);
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return [];
  }
}

export async function savePosition(position: SavedPosition): Promise<void> {
  try {
    if (!validatePositionData(position)) {
      throw new APIError('Invalid position data');
    }

    await createRecord(position.id, {
      type: 'position',
      data: {
        ...position,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to save position:', error);
    throw error;
  }
}