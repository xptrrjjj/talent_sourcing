import { analyzeWithGPT } from './gpt';
import { analyzeWithGemini } from './gemini';
import { validateInputData, combineAnalyses } from './utils';
import { APIError } from '../errors';
import type { JobFormData, TalentAnalysis } from '../../types';

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