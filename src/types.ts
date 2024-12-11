// API Types
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

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  access_token: string | null;
  refresh_token: string | null;
  user: {
    id: number;
    username: string;
  } | null;
  message: string;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  website?: string;
  contactName: string;
  source: string;
  onshoreLocation: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyFormData {
  companyName: string;
  website?: string;
  contactName: string;
  source: string;
  onshoreLocation: string;
}

// Job and Position Types
export interface JobDescription {
  overview: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

export interface TalentAnalysis {
  jobDescription: JobDescription;
  talentPoolSize: number;
  onshoreSalaryRange: {
    min: number;
    max: number;
  };
  offshoreSalaryRange: {
    min: number;
    max: number;
  };
  sources: Array<{
    name: string;
    url: string;
  }>;
  marketTrends: string[];
  insights?: string[];
}

export interface JobFormData {
  jobTitle: string;
  companyId: string;
  onshoreLocation: string;
  requiredSkills: string;
  experienceLevel: string;
  educationLevel: string;
  employmentType: string;
}

export interface SavedPosition {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  status: 'draft' | 'active' | 'archived';
  companyData: {
    companyName: string;
    website?: string;
    contactName: string;
    source: string;
    onshoreLocation: string;
  };
  formData: JobFormData;
  analysis: TalentAnalysis;
}