export interface Candidate {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  status: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStage {
  id: string;
  name: string;
  candidates: Candidate[];
}

export interface Pipeline {
  id: string;
  name: string;
  stages: ApplicationStage[];
  createdAt: string;
  updatedAt: string;
}