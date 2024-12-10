import OpenAI from 'openai';
import { APIError } from '../errors';

const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const OPENAI_API_KEY = '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'; // Replace with actual API key

export function createOpenAIClient() {
  if (!OPENAI_API_KEY) {
    throw new APIError('OpenAI API key is missing');
  }

  return new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });
}

export async function createChatCompletion(prompt: string, cacheKey?: string) {
  try {
    // Check cache if cacheKey is provided
    if (cacheKey) {
      const cached = responseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    }

    const openai = createOpenAIClient();
    
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a technical recruiter specializing in IT roles. Analyze positions and provide market insights.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'gpt-4-turbo-preview',
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    if (!completion.choices[0]?.message?.content) {
      throw new APIError('Invalid response from OpenAI API');
    }

    let responseData;
    try {
      responseData = JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      throw new APIError('Invalid JSON response from OpenAI API');
    }

    // Cache the response if cacheKey is provided
    if (cacheKey) {
      responseCache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });
    }

    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      throw new APIError(`OpenAI API Error: ${error.message}`);
    }
    throw new APIError('An unexpected error occurred while calling OpenAI API');
  }
}