import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

// Lazy client — only instantiated when actually used so a missing key
// doesn't crash the server at startup (other routes still work).
let _groq = null;
function getGroqClient() {
  if (!_groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set in .env — AI features will not work.');
    }
    _groq = new Groq({ apiKey });
  }
  return _groq;
}

export async function askGroq(systemPrompt, userMessage, options = {}) {
  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: options.model || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: options.temperature || 0.3,
      max_tokens: options.maxTokens || 2048,
      response_format: options.json ? { type: 'json_object' } : undefined
    });
    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API Error:', error.message);
    throw error;
  }
}

export default { askGroq };
