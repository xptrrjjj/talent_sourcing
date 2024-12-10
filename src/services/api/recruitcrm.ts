import axios from 'axios';
import { APIError } from '../errors';
import type { JobDescription } from '../../types';

const BASE_URL = 'https://api.recruitcrm.io/v1';

interface RecruitCRMJob {
  name: string;
  description: string;
  status: 'active' | 'inactive';
  type: 'full_time' | 'part_time' | 'contract';
  experience: string;
  education: string;
  skills: string;
  currency: string;
  salary_from: number;
  salary_to: number;
  country: string;
  city: string;
  remote_type: 'remote' | 'office' | 'hybrid';
  is_published: boolean;
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

axiosInstance.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_RECRUITCRM_API_KEY;
  if (!apiKey) {
    throw new APIError('RecruitCRM API key is missing');
  }
  config.headers.Authorization = `Bearer ${apiKey}`;
  return config;
});

function formatJobDescription(jobData: JobDescription): string {
  return `
${jobData.overview}

Key Responsibilities:
${jobData.responsibilities.map(r => `• ${r}`).join('\n')}

Requirements:
${jobData.requirements.map(r => `• ${r}`).join('\n')}

Benefits:
${jobData.benefits.map(b => `• ${b}`).join('\n')}
  `.trim();
}

export async function createJob(
  jobData: JobDescription & {
    title: string;
    experienceLevel: string;
    educationLevel: string;
    skills: string[];
    salaryRange: { min: number; max: number };
    location: string;
  }
): Promise<{ jobId: string }> {
  try {
    const [country, city] = jobData.location.split(',').map(s => s.trim());
    
    const payload: RecruitCRMJob = {
      name: jobData.title,
      description: formatJobDescription(jobData),
      status: 'active',
      type: 'full_time',
      experience: jobData.experienceLevel,
      education: jobData.educationLevel,
      skills: jobData.skills.join(', '),
      currency: 'USD',
      salary_from: jobData.salaryRange.min,
      salary_to: jobData.salaryRange.max,
      country: country || 'United States',
      city: city || '',
      remote_type: 'remote',
      is_published: true
    };

    const response = await axiosInstance.post('/jobs', payload);
    
    if (!response.data?.data?.id) {
      throw new APIError('Invalid response from RecruitCRM API');
    }

    return { jobId: response.data.data.id };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to create job in RecruitCRM');
  }
}