import { APIError } from '../errors';
import type { JobFormData, TalentAnalysis } from '../../types';

export function validateInputData(data: JobFormData) {
  if (!data.jobTitle) {
    throw new APIError('Job title is required');
  }
  if (!data.onshoreLocation) {
    throw new APIError('Location is required');
  }
  if (!data.experienceLevel) {
    throw new APIError('Experience level is required');
  }
  if (!data.requiredSkills) {
    throw new APIError('At least one required skill is needed');
  }
}

export function combineAnalyses(
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