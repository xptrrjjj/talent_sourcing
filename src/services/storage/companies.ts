import type { Company } from '../../types';
import { createRecord, retrieveRecords } from '../api/datastore/operations';
import { APIError } from '../errors';

export async function getCompanies(): Promise<Company[]> {
  try {
    const response = await retrieveRecords({ type: 'company' });
    
    if (!Array.isArray(response)) {
      throw new APIError('Invalid response format from datastore');
    }

    return response
      .filter(record => {
        return record && 
               record.data && 
               !record.data.deleted &&
               record.data.name &&
               record.data.contactName;
      })
      .map(record => ({
        id: record.record_id,
        name: record.data.name,
        website: record.data.website || '',
        contactName: record.data.contactName,
        source: record.data.source || '',
        onshoreLocation: record.data.onshoreLocation || '',
        createdAt: record.data.createdAt || record.created_at,
        updatedAt: record.data.updatedAt || record.updated_at
      }));
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return [];
  }
}

export async function saveCompany(company: Company): Promise<void> {
  try {
    await createRecord(company.id, {
      type: 'company',
      data: {
        name: company.name,
        website: company.website || '',
        contactName: company.contactName,
        source: company.source,
        onshoreLocation: company.onshoreLocation,
        createdAt: company.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to save company:', error);
    throw error;
  }
}

export async function deleteCompany(id: string): Promise<void> {
  try {
    await createRecord(id, {
      type: 'company',
      data: {
        deleted: true,
        deletedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to delete company:', error);
    throw error;
  }
}