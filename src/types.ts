import React from 'react';

export interface CompanyFormData {
  companyName: string;
  website?: string;
  contactName: string;
  source: string;
  onshoreLocation: string;
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
}

export interface SavedPosition {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyData: CompanyFormData;
  formData: JobFormData;
  analysis: TalentAnalysis;
  status: 'draft' | 'active' | 'archived';
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface SkillSuggestionResponse {
  categories: SkillCategory[];
  experienceLevels: string[];
  educationLevels: string[];
}

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

export interface ApplicationRole {
  client: string;
  title: string;
  count: number;
}

export interface ApplicationStage {
  stage: string;
  count: number;
  roles: ApplicationRole[];
}