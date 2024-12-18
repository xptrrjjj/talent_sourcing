import type { SavedPosition } from '../../../types';

export function validatePositionData(position: SavedPosition): boolean {
  return !!(
    position.id &&
    position.formData?.jobTitle &&
    position.companyData?.companyName &&
    position.userId &&
    position.userName &&
    position.status
  );
}

export function validatePositionRecord(record: any): boolean {
  return record && 
         record.data && 
         !record.data.deleted &&
         record.data.formData?.jobTitle &&
         record.data.companyData?.companyName &&
         record.data.userId &&
         record.data.userName;
}

export function mapPositionRecord(record: any): SavedPosition {
  return {
    id: record.record_id,
    createdAt: record.data.createdAt || record.created_at,
    updatedAt: record.data.updatedAt || record.updated_at,
    userId: record.data.userId,
    userName: record.data.userName,
    status: record.data.status || 'draft',
    companyData: record.data.companyData,
    formData: record.data.formData,
    analysis: record.data.analysis
  };
}