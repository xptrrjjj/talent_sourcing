import type { Company } from '../../../types';

export function validateCompanyData(record: any): boolean {
  return record && 
         record.data && 
         !record.data.deleted &&
         record.data.name &&
         record.data.contactName;
}

export function mapCompanyRecord(record: any): Company {
  return {
    id: record.record_id,
    name: record.data.name,
    website: record.data.website || '',
    contactName: record.data.contactName,
    source: record.data.source || '',
    onshoreLocation: record.data.onshoreLocation || '',
    createdAt: record.data.createdAt || record.created_at,
    updatedAt: record.data.updatedAt || record.updated_at
  };
}