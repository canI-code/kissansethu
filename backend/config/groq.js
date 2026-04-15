import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askGroq(systemPrompt, userMessage, options = {}) {
  try {
    const completion = await groq.chat.completions.create({
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

export default groq;
