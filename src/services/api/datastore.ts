import axios from 'axios';
import { APIError } from '../errors';
import type { SavedPosition, Company } from '../../types';

const API_URL = 'http://44.211.135.244:8000';
const APP_ID = 'talent_sourcing_platform';

interface DatastoreResponse {
  status: 'success' | 'error';
  message: string;
  data?: any[];
}

export async function createRecord(recordId: string, data: any): Promise<DatastoreResponse> {
  try {
    const response = await axios.post(`${API_URL}/api/datastore/create`, {
      identifier: APP_ID,
      action: 'create',
      data: {
        app_id: APP_ID,
        record_id: recordId,
        type: data.type || 'unknown',
        ...data
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new APIError(error.response.data.message || 'Failed to create record');
    }
    throw new APIError('Failed to connect to datastore');
  }
}

export async function updateRecord(recordId: string, data: any): Promise<DatastoreResponse> {
  try {
    const response = await axios.post(`${API_URL}/api/datastore/create`, {
      identifier: APP_ID,
      action: 'update',
      data: {
        record_id: recordId,
        ...data
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new APIError(error.response.data.message || 'Failed to update record');
    }
    throw new APIError('Failed to connect to datastore');
  }
}

export async function retrieveRecords(filters?: Record<string, any>): Promise<DatastoreResponse> {
  try {
    const response = await axios.post(`${API_URL}/api/datastore/retrieve`, {
      identifier: APP_ID,
      filters: {
        app_id: APP_ID,
        ...filters
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new APIError(error.response.data.message || 'Failed to retrieve records');
    }
    throw new APIError('Failed to connect to datastore');
  }
}

export async function savePosition(position: SavedPosition): Promise<void> {
  await createRecord(`position_${position.id}`, {
    type: 'position',
    ...position
  });
}

export async function updatePosition(position: SavedPosition): Promise<void> {
  await updateRecord(`position_${position.id}`, {
    type: 'position',
    ...position
  });
}

export async function getPositions(search?: string): Promise<SavedPosition[]> {
  const filters: Record<string, any> = { type: 'position' };
  if (search) {
    filters.search = search;
  }
  const response = await retrieveRecords(filters);
  return (response.data || []).map((item: any) => ({
    ...item,
    id: item.record_id?.replace('position_', '') || item.id
  }));
}

export async function saveCompany(company: Company): Promise<void> {
  await createRecord(`company_${company.id}`, {
    type: 'company',
    ...company
  });
}

export async function updateCompany(company: Company): Promise<void> {
  await updateRecord(`company_${company.id}`, {
    type: 'company',
    ...company
  });
}

export async function getCompanies(search?: string): Promise<Company[]> {
  const filters: Record<string, any> = { type: 'company' };
  if (search) {
    filters.search = search;
  }
  const response = await retrieveRecords(filters);
  return (response.data || []).map((item: any) => ({
    ...item,
    id: item.record_id?.replace('company_', '') || item.id
  }));
}

export async function searchCompanies(query: string): Promise<Company[]> {
  return getCompanies(query);
}

export async function searchPositions(query: string): Promise<SavedPosition[]> {
  return getPositions(query);
}