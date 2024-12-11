import type { SavedPosition } from '../../types';
import { createRecord, appendToRecord, retrieveRecords } from '../api/datastore';

export async function getSavedPositions(): Promise<SavedPosition[]> {
  try {
    const records = await retrieveRecords({ type: 'position' });
    return records
      .filter(record => record.data && !record.data.deleted)
      .map(record => ({
        ...record.data,
        id: record.record_id
      }));
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return [];
  }
}

export async function savePosition(position: SavedPosition): Promise<void> {
  try {
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

export async function deletePosition(id: string): Promise<void> {
  try {
    await createRecord(id, {
      type: 'position',
      data: {
        deleted: true,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to delete position:', error);
    throw error;
  }
}

export async function updatePositionStatus(id: string, status: SavedPosition['status']): Promise<void> {
  try {
    await appendToRecord(id, {
      type: 'position',
      data: {
        status,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to update position status:', error);
    throw error;
  }
}