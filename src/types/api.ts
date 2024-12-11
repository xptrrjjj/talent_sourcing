export interface DatastoreResponse {
  status: 'success' | 'error';
  message?: string;
  data?: DatastoreRecord[];
}

export interface DatastoreRecord {
  app_id: string;
  record_id: string;
  type: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
}