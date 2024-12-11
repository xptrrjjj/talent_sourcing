import type { TalentAnalysis } from './analysis';

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