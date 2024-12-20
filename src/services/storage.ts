import { SavedPosition, Company } from '../types';
import { createRecord, appendToRecord, retrieveRecords } from './api/datastore';

// Position-related functions
export async function getSavedPositions(): Promise<SavedPosition[]> {
  try {
    const records = await retrieveRecords({ type: 'position' });
    return Array.isArray(records) ? records.map(record => ({
      ...record.data,
      id: record.record_id
    })) : [];
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    return [];
  }
}

export async function savePosition(position: SavedPosition): Promise<void> {
  try {
    await createRecord(position.id, {
      type: 'position',
      data: position
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
      data: { deleted: true }
    });
  } catch (error) {
    console.error('Failed to delete position:', error);
    throw error;
  }
}

export async function updatePositionStatus(id: string, status: 'draft' | 'active' | 'archived'): Promise<void> {
  try {
    await appendToRecord(id, {
      type: 'position',
      data: { status }
    });
  } catch (error) {
    console.error('Failed to update position status:', error);
    throw error;
  }
}

// Company-related functions
export async function getCompanies(): Promise<Company[]> {
  try {
    const records = await retrieveRecords({ type: 'company' });
    return Array.isArray(records) ? records.map(record => ({
      ...record.data,
      id: record.record_id
    })) : [];
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return [];
  }
}

export async function saveCompany(company: Company): Promise<void> {
  try {
    await createRecord(company.id, {
      type: 'company',
      data: company
    });
  } catch (error) {
    console.error('Failed to save company:', error);
    throw error;
  }
}

export async function deleteCompany(id: string | undefined): Promise<void> {
  // Handle case where an object is mistakenly passed instead of an id
  if (id && typeof id === 'object' && 'id' in id) {
    console.error('Object passed instead of ID. Extracting the ID field.');
    id = id['id']; // Attempt to extract `id` field if object is passed
  }

  // Validate id
  if (!id || typeof id !== 'string') {
    console.error('Invalid id passed to deleteCompany:', id);
    throw new Error('Invalid id: Expected a string');
  }

  try {
    console.log('Deleting company with id:', id);

    await createRecord(id, {
      type: 'company',
      data: {
        deleted: true,
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to delete company:', error);
    throw error;
  }
}



export async function updateCompanyDetails(id: string, updates: Partial<Company>): Promise<void> {
  try {
    await appendToRecord(id, {
      type: 'company',
      data: updates
    });
  } catch (error) {
    console.error('Failed to update company details:', error);
    throw error;
  }
}

// Utility functions for data validation
function validatePosition(position: SavedPosition): boolean {
  return !!(
    position.id &&
    position.formData?.jobTitle &&
    position.companyData?.companyName &&
    position.userId &&
    position.userName
  );
}

function validateCompany(company: Company): boolean {
  return !!(
    company.id &&
    company.name &&
    company.contactName &&
    company.onshoreLocation
  );
}

// Error handling wrapper
async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw error;
  }
}