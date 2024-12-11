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