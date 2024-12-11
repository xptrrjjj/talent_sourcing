import { APIError } from '../errors';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function createClaudeCompletion(prompt: string) {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }],
        response_format: { type: 'json' }
      })
    });

    if (!response.ok) {
      throw new APIError(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.content[0].text);
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new APIError('Failed to get response from Claude');
  }
}