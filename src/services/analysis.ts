import { createOpenAICompletion } from './api/openai';
import { createGeminiCompletion } from './api/gemini';
import { APIError } from './errors';
import type { JobFormData, TalentAnalysis } from '../types';
import { ANALYSIS_PROMPT } from './prompts';

function validateInputData(data: JobFormData) {
  if (!data.jobTitle) {
    throw new APIError('Job title is required');
  }
  if (!data.onshoreLocation) {
    throw new APIError('Location is required');
  }
  if (!data.experienceLevel) {
    throw new APIError('Experience level is required');
  }
}

async function analyzeWithGPT(data: JobFormData): Promise<TalentAnalysis> {
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

async function analyzeWithGemini(data: JobFormData) {
  try {
    const prompt = `Analyze this position and provide market insights in JSON format:
    
Position: ${data.jobTitle}
Required Skills: ${data.requiredSkills || 'Not specified'}
Experience Level: ${data.experienceLevel}
Location: ${data.onshoreLocation}

Provide:
1. Estimated talent pool size in the Philippines
2. Salary ranges (both onshore and offshore)
3. Key market trends
4. Additional insights

Format as JSON:
{
  "talentPoolSize": number,
  "salaryRanges": {
    "onshore": { "min": number, "max": number },
    "offshore": { "min": number, "max": number }
  },
  "marketTrends": ["string"],
  "insights": ["string"]
}`;

    return await createGeminiCompletion(prompt);
  } catch (error) {
    console.error('Gemini Analysis error:', error);
    throw error;
  }
}

function combineAnalyses(
  gptAnalysis: TalentAnalysis | null,
  geminiAnalysis: any | null
): TalentAnalysis {
  if (!gptAnalysis && !geminiAnalysis) {
    throw new APIError('Both analyses failed');
  }

  // Prefer GPT analysis as base if available
  if (gptAnalysis) {
    return {
      ...gptAnalysis,
      marketTrends: geminiAnalysis?.marketTrends || [],
      insights: geminiAnalysis?.insights || []
    };
  }

  // Fallback to Gemini analysis if GPT fails
  if (geminiAnalysis) {
    return {
      jobDescription: {
        overview: 'Analysis based on market data',
        responsibilities: [],
        requirements: [],
        benefits: []
      },
      talentPoolSize: geminiAnalysis.talentPoolSize,
      onshoreSalaryRange: geminiAnalysis.salaryRanges.onshore,
      offshoreSalaryRange: geminiAnalysis.salaryRanges.offshore,
      sources: [],
      marketTrends: geminiAnalysis.marketTrends || [],
      insights: geminiAnalysis.insights || []
    };
  }

  throw new APIError('Unable to generate analysis');
}

export async function analyzePosition(data: JobFormData): Promise<{
  analysis: TalentAnalysis;
  rawGeminiAnalysis: any;
}> {
  try {
    validateInputData(data);

    const [gptAnalysis, geminiAnalysis] = await Promise.allSettled([
      analyzeWithGPT(data),
      analyzeWithGemini(data)
    ]);

    if (gptAnalysis.status === 'rejected' && geminiAnalysis.status === 'rejected') {
      throw new APIError('Analysis failed. Please try again.');
    }

    const finalAnalysis = combineAnalyses(
      gptAnalysis.status === 'fulfilled' ? gptAnalysis.value : null,
      geminiAnalysis.status === 'fulfilled' ? geminiAnalysis.value : null
    );

    return {
      analysis: finalAnalysis,
      rawGeminiAnalysis: geminiAnalysis.status === 'fulfilled' ? geminiAnalysis.value : null
    };
  } catch (error) {
    console.error('Analysis error:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to complete analysis. Please try again.');
  }
}