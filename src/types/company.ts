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