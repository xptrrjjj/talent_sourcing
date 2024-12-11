import { GoogleGenerativeAI } from '@google/generative-ai';
import { APIError } from '../errors';

export async function createGeminiCompletion(prompt: string) {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new APIError('Gemini API key is missing');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Add JSON format instruction to the prompt
    const promptWithFormat = `${prompt}\n\nIMPORTANT: Respond with valid JSON only, no additional text or formatting.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promptWithFormat }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    if (!result.response) {
      throw new APIError('Empty response from Gemini');
    }

    const text = result.response.text();
    
    try {
      // Extract JSON from the response if it's wrapped in code blocks
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1] : text;
      
      // Clean the response text to ensure valid JSON
      const cleanedText = jsonString
        .replace(/[\u0000-\u001F]+/g, '')
        .trim();
      
      const parsedResponse = JSON.parse(cleanedText);
      
      // Validate response structure
      if (!parsedResponse.talentPoolSize || !parsedResponse.salaryRanges) {
        throw new APIError('Invalid response structure from Gemini');
      }

      return parsedResponse;
    } catch (error) {
      console.error('Failed to parse Gemini response:', text);
      throw new APIError('Invalid JSON response from Gemini');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to get response from Gemini');
  }
}