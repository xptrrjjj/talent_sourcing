import OpenAI from 'openai';
import { APIError } from '../errors';

export async function createOpenAICompletion(prompt: string) {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new APIError('OpenAI API key is missing');
    }

    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    
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

    try {
      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', completion.choices[0].message.content);
      throw new APIError('Invalid JSON response from OpenAI');
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to get response from OpenAI');
  }
}