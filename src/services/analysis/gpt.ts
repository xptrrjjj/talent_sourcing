import { createOpenAICompletion } from '../api/openai';
import { ANALYSIS_PROMPT } from '../prompts';
import type { JobFormData, TalentAnalysis } from '../../types';

export async function analyzeWithGPT(data: JobFormData): Promise<TalentAnalysis> {
  try {
    const prompt = ANALYSIS_PROMPT
      .replace('{jobTitle}', data.jobTitle)
      .replace('{skills}', data.requiredSkills || '')
      .replace('{location}', data.onshoreLocation)
      .replace('{experienceLevel}', data.experienceLevel)
      .replace('{educationLevel}', data.educationLevel)
      .replace('{employmentType}', data.employmentType);

    const response = await createOpenAICompletion(prompt);
    return response;
  } catch (error) {
    console.error('GPT Analysis error:', error);
    throw error;
  }
}