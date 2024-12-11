import { createGeminiCompletion } from '../api/gemini';
import type { JobFormData } from '../../types';

export async function analyzeWithGemini(data: JobFormData) {
  try {
    const prompt = `Analyze this position and provide market insights:

Position: ${data.jobTitle}
Required Skills: ${data.requiredSkills || 'Not specified'}
Experience Level: ${data.experienceLevel}
Location: ${data.onshoreLocation}

Provide the following information in JSON format:

{
  "talentPoolSize": (number) Estimated available talent in Philippines,
  "salaryRanges": {
    "onshore": {
      "min": (number) Minimum annual salary in USD for ${data.onshoreLocation},
      "max": (number) Maximum annual salary in USD for ${data.onshoreLocation}
    },
    "offshore": {
      "min": (number) Minimum annual salary in USD for Philippines,
      "max": (number) Maximum annual salary in USD for Philippines
    }
  },
  "marketTrends": [
    (string) 3-4 current market trends relevant to this role
  ],
  "insights": [
    (string) 2-3 key insights about hiring for this role
  ]
}`;

    return await createGeminiCompletion(prompt);
  } catch (error) {
    console.error('Gemini Analysis error:', error);
    throw error;
  }
}