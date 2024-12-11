import { createOpenAICompletion } from './api/openai';
import type { JobFormData, TalentAnalysis } from '../types';
import { ANALYSIS_PROMPT, SKILLS_SUGGESTION_PROMPT } from './prompts';
import { APIError } from './errors';

export async function analyzePosition(data: JobFormData): Promise<TalentAnalysis> {
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
    console.error('OpenAI Analysis error:', error);
    throw error;
  }
}

export async function suggestSkills(data: JobFormData) {
  try {
    const prompt = SKILLS_SUGGESTION_PROMPT
      .replace('{jobTitle}', data.jobTitle)
      .replace('{currentSkills}', data.requiredSkills || '')
      .replace('{experienceLevel}', data.experienceLevel)
      .replace('{educationLevel}', data.educationLevel);

    const response = await createOpenAICompletion(prompt);
    return response;
  } catch (error) {
    console.error('OpenAI Skills suggestion error:', error);
    throw error;
  }
}