import type { JobFormData, TalentAnalysis, SkillSuggestionResponse } from '../types';
import { createChatCompletion } from './api/openai';
import { ANALYSIS_PROMPT, SKILLS_SUGGESTION_PROMPT } from './prompts';
import { APIError } from './errors';

export async function analyzePosition(data: JobFormData): Promise<TalentAnalysis> {
  try {
    const cacheKey = JSON.stringify({
      jobTitle: data.jobTitle,
      skills: data.requiredSkills,
      location: data.onshoreLocation,
      experienceLevel: data.experienceLevel,
      educationLevel: data.educationLevel,
      employmentType: data.employmentType,
      timestamp: Date.now()
    });

    const prompt = ANALYSIS_PROMPT
      .replace('{jobTitle}', data.jobTitle)
      .replace('{skills}', data.requiredSkills || '')
      .replace('{location}', data.onshoreLocation)
      .replace('{experienceLevel}', data.experienceLevel)
      .replace('{educationLevel}', data.educationLevel)
      .replace('{employmentType}', data.employmentType);

    const response = await createChatCompletion(prompt, cacheKey);

    if (!response || typeof response !== 'object') {
      throw new APIError('Invalid response format from OpenAI API');
    }

    const { jobDescription, talentPoolSize, onshoreSalaryRange, offshoreSalaryRange, sources } = response;

    if (!jobDescription || !talentPoolSize || !onshoreSalaryRange || !offshoreSalaryRange) {
      throw new APIError('Missing required fields in OpenAI response');
    }

    return {
      jobDescription: {
        overview: jobDescription.overview || '',
        responsibilities: jobDescription.responsibilities || [],
        requirements: jobDescription.requirements || [],
        benefits: jobDescription.benefits || []
      },
      talentPoolSize,
      onshoreSalaryRange,
      offshoreSalaryRange,
      sources: sources || []
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to analyze position');
  }
}

export async function suggestSkills(data: JobFormData): Promise<SkillSuggestionResponse> {
  try {
    const cacheKey = JSON.stringify({
      jobTitle: data.jobTitle,
      currentSkills: data.requiredSkills,
      experienceLevel: data.experienceLevel,
      educationLevel: data.educationLevel,
      timestamp: Date.now()
    });

    const prompt = SKILLS_SUGGESTION_PROMPT
      .replace('{jobTitle}', data.jobTitle)
      .replace('{currentSkills}', data.requiredSkills || '')
      .replace('{experienceLevel}', data.experienceLevel || '')
      .replace('{educationLevel}', data.educationLevel || '');

    const response = await createChatCompletion(prompt, cacheKey);

    if (!response || typeof response !== 'object') {
      throw new APIError('Invalid response format from OpenAI API');
    }

    const { categories, experienceLevels, educationLevels } = response;

    if (!Array.isArray(categories)) {
      throw new APIError('Invalid categories format in OpenAI response');
    }

    return {
      categories: categories.map(category => ({
        name: category.name || '',
        skills: Array.isArray(category.skills) ? category.skills : []
      })),
      experienceLevels: Array.isArray(experienceLevels) ? experienceLevels : [],
      educationLevels: Array.isArray(educationLevels) ? educationLevels : []
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to suggest skills');
  }
}