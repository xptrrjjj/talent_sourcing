import type { Company } from '../../types';
import { createRecord, retrieveRecords } from '../api/datastore';

export async function getCompanies(): Promise<Company[]> {
  try {
    console.log('Fetching companies...');
    const response = await retrieveRecords({ type: 'company' });
    console.log('Raw API response:', response);

    if (!Array.isArray(response)) {
      console.error('Invalid response format:', response);
      return [];
    }

    const companies = response
      .filter(record => {
        // Only include records with valid data and not deleted
        return record && record.data && !record.data.deleted;
      })
      .map(record => {
        // Ensure all required fields are present
        const company: Company = {
          id: record.record_id,
          name: record.data.name || '',
          website: record.data.website || '',
          contactName: record.data.contactName || '',
          source: record.data.source || '',
          onshoreLocation: record.data.onshoreLocation || '',
          createdAt: record.data.createdAt || new Date().toISOString(),
          updatedAt: record.data.updatedAt || new Date().toISOString()
        };
        return company;
      });

    console.log('Processed companies:', companies);
    return companies;
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return [];
  }
}

export async function saveCompany(company: Company): Promise<void> {
  try {
    console.log('Saving company:', company);
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
    console.log('Company saved successfully');
  } catch (error) {
    console.error('Failed to save company:', error);
    throw error;
  }
}