import { getDB } from '../config/db.js';
import { askGroq } from '../config/groq.js';
import { getAllSchemes } from './schemeService.js';

/**
 * Build agent context by fetching live data from MongoDB
 * Returns a formatted string with available equipment, workers, and schemes
 */
export async function buildAgentContext() {
  try {
    const db = getDB();

    // Fetch top 5 available equipment
    const equipment = await db.collection('equipment')
      .find({ status: 'available' })
      .sort({ rating: -1 })
      .limit(5)
      .toArray();

    // Fetch top 5 available workers
    const workers = await db.collection('workers')
      .find({ available: true })
      .sort({ rating: -1 })
      .limit(5)
      .toArray();

    // Get all scheme names
    const schemes = getAllSchemes();
    const schemeNames = schemes.map(s => s.name).slice(0, 10); // Top 10 schemes

    // Format equipment list
    const equipmentList = equipment.map(e => 
      `${e.name} (${e.type}) - ₹${e.price}/${e.priceUnit === 'per_hour' ? 'hour' : 'fixed'} - ${e.location.district}, ${e.location.state}`
    ).join('\n');

    // Format workers list
    const workersList = workers.map(w => 
      `${w.name} - Skills: ${w.skills.join(', ')} - ₹${w.dailyRate}/day - ${w.location.district}, ${w.location.state}`
    ).join('\n');

    // Format schemes list
    const schemesList = schemeNames.join(', ');

    // Build context string
    const context = `
AVAILABLE EQUIPMENT (Top 5):
${equipmentList || 'No equipment currently available'}

AVAILABLE WORKERS (Top 5):
${workersList || 'No workers currently available'}

GOVERNMENT SCHEMES:
${schemesList}

Total Equipment Available: ${equipment.length}
Total Workers Available: ${workers.length}
Total Schemes: ${schemes.length}
`;

    return context;
  } catch (error) {
    console.error('Error building agent context:', error);
    return 'Unable to fetch current data. Please try again.';
  }
}

/**
 * Generate a caller response using Groq AI
 * @param {string} transcript - What the caller said
 * @param {string} context - Live data context from buildAgentContext()
 * @param {string} language - 'hi' or 'en'
 * @returns {Promise<string>} - Short spoken response
 */
export async function generateCallerResponse(transcript, context, language = 'hi') {
  try {
    const systemPrompt = `You are KissanSetu AI Assistant - a helpful phone agent for Indian farmers.
You are speaking on a phone call, so keep responses SHORT (2-3 sentences maximum).
Speak in ${language === 'hi' ? 'simple Hindi (Hinglish is okay)' : 'simple English'}.
Be warm and respectful - use "ji" suffix in Hindi. Address caller as "Kisaan bhai" or "Kisaan ji".

You have access to REAL-TIME data about:
${context}

IMPORTANT RULES:
1. Keep responses under 50 words - this is a phone call
2. Only mention specific items if the caller asks about them
3. If asked about availability, mention 1-2 specific examples from the data
4. For schemes, just mention the scheme name, not full details
5. If you don't have the information, politely say so and suggest they visit the website or call back
6. Always end with a helpful next step or question

Examples:
Caller: "Tractor milega?"
You: "Ji haan, humare paas Mahindra 575 DI aur Swaraj 744 tractor available hai. Kiraye pe 800-900 rupaye per hour. Aapko kaunsa chahiye?"

Caller: "Workers chahiye harvesting ke liye"
You: "Bilkul ji. Ramu Kaka aur Birju ki team available hai harvesting ke liye. 350-400 rupaye per day. Kab chahiye aapko?"`;

    const userMessage = `Caller said: "${transcript}"`;

    const response = await askGroq(systemPrompt, userMessage, { 
      temperature: 0.5, 
      maxTokens: 150 
    });

    return response.trim();
  } catch (error) {
    console.error('Error generating caller response:', error);
    
    // Fallback response
    if (language === 'hi') {
      return 'Maaf kijiye, abhi thodi technical problem hai. Kripya thodi der baad call karein ya website check karein.';
    } else {
      return 'Sorry, we are experiencing technical difficulties. Please call back later or check our website.';
    }
  }
}

/**
 * Detect language from text (Hindi vs English)
 * @param {string} text - Input text
 * @returns {string} - 'hi' or 'en'
 */
export function detectLanguage(text) {
  if (!text || text.trim().length === 0) {
    return 'hi'; // Default to Hindi
  }

  // Count Devanagari characters (Hindi script)
  const devanagariPattern = /[\u0900-\u097F]/g;
  const devanagariMatches = text.match(devanagariPattern);
  const devanagariCount = devanagariMatches ? devanagariMatches.length : 0;

  // Count English letters
  const englishPattern = /[a-zA-Z]/g;
  const englishMatches = text.match(englishPattern);
  const englishCount = englishMatches ? englishMatches.length : 0;

  // If more than 30% of characters are Devanagari, it's Hindi
  const totalChars = text.replace(/\s/g, '').length;
  if (totalChars === 0) return 'hi';

  const devanagariRatio = devanagariCount / totalChars;
  
  if (devanagariRatio > 0.3) {
    return 'hi';
  } else if (englishCount > devanagariCount) {
    return 'en';
  } else {
    // Default to Hindi for Indian context
    return 'hi';
  }
}
