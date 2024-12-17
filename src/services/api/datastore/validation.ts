export function validateRecord(data: any): boolean {
    return data && typeof data === 'object' && !Array.isArray(data);
  }
  
  export function validateRecordData(record: any): boolean {
    return record && 
           record.record_id && 
           validateRecord(record.data);
  }