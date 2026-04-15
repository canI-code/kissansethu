import { askGroq } from '../config/groq.js';

// Analyze farmer profile and categorize
export async function analyzeProfile(rawProfile) {
  const systemPrompt = `You are an Indian agricultural expert AI. Analyze the farmer's profile data and return a structured JSON response.

Categorize the farmer based on land holding:
- "marginal": ≤ 1 hectare (2.47 acres)
- "small": 1-2 hectares (2.47-4.94 acres)
- "medium": 2-4 hectares (4.94-9.88 acres)
- "large": > 4 hectares (9.88 acres)

Return JSON with this structure:
{
  "profile": {
    "name": "string",
    "age": number,
    "gender": "string",
    "location": { "village": "", "district": "", "state": "", "pincode": "" },
    "landHolding": { "sizeAcres": number, "sizeHectares": number, "type": "irrigated|rainfed|mixed" },
    "category": "marginal|small|medium|large",
    "crops": ["string"],
    "annualIncome": number,
    "hasAadhaar": boolean,
    "hasBankAccount": boolean,
    "familyMembers": number,
    "irrigationType": "string",
    "existingSchemes": ["string"],
    "hasLivestock": boolean,
    "education": "string"
  },
  "insights": {
    "strengths": ["string"],
    "challenges": ["string"],
    "recommendations": ["string"]
  }
}`;

  const userMessage = `Analyze this farmer profile data:\n${JSON.stringify(rawProfile, null, 2)}`;
  
  const response = await askGroq(systemPrompt, userMessage, { json: true, temperature: 0.2 });
  return JSON.parse(response);
}

// Detect voice command intent
export async function detectIntent(transcript, language = 'hi') {
  const systemPrompt = `You are a voice command interpreter for KissanSetu, an Indian farmer platform. 
The user speaks in Hindi or English (or Hinglish mix). Detect their intent and extract ALL possible search parameters.

Available intents:
- "search_equipment": User wants specific equipment (use this when they mention ANY equipment type, price preference, or action like rent/buy). Keywords: tractor, harvester, rotavator, sprayer, pump, thresher, seeder, equipment, kiraya, rent, khareedna, buy, machine, sasta (cheap), mehnga, dikhao.
- "search_workers": User wants specific workers. Keywords: majdoor, worker, labour, khet, operator, spraying, harvesting, sowing, ploughing.
- "navigate_equipment": User just wants to browse equipment generally without specific type.
- "navigate_workers": User just wants to browse workers.
- "navigate_schemes": User wants government schemes (yojana, scheme, sarkari, government).
- "check_eligibility": User asks about eligibility for schemes.
- "navigate_profile": User wants profile page (profile, mera, apna).
- "fill_profile": User wants to create/fill/update profile.
- "navigate_home": User wants home page.
- "ask_question": General farming question NOT about equipment/workers/schemes navigation.
- "greeting": Just saying hello/namaste.
- "unknown": Cannot determine intent.

CRITICAL RULES:
1. If user mentions ANY specific equipment (tractor, harvester etc.) → ALWAYS use "search_equipment", NEVER "navigate_equipment"
2. If user says "sasta" (cheap) → set maxPrice to a reasonable low value for that equipment type
3. If user mentions a location → extract it into params.location
4. If user says "kiraye pe" or "rent" → set params.action = "rent". If "khareedna" or "buy" → params.action = "buy"
5. Extract worker count if mentioned (e.g., "5 majdoor" → params.count = 5)

Return JSON:
{
  "intent": "string",
  "confidence": 0.0-1.0,
  "params": {
    "type": "tractor|harvester|rotavator|sprayer|seeder|pump|thresher|null",
    "action": "rent|buy|null",
    "maxPrice": number_or_null,
    "location": "string_or_null",
    "skill": "string_or_null",
    "count": number_or_null,
    "duration": "string_or_null",
    "keywords": ["extracted", "search", "terms"]
  },
  "responseHi": "Short Hindi response about what you found/will do (2 sentences max)",
  "responseEn": "Short English response (2 sentences max)"
}`;

  const response = await askGroq(systemPrompt, `User said (${language === 'hi' ? 'Hindi' : 'English'}): "${transcript}"`, { json: true, temperature: 0.1 });
  return JSON.parse(response);
}

// Generate conversational response for voice assistant
export async function generateVoiceResponse(context, question, language = 'hi') {
  const systemPrompt = `You are KissanSetu AI Assistant - a friendly, helpful farming assistant for Indian farmers.
You speak ${language === 'hi' ? 'simple Hindi (Hinglish is okay)' : 'simple English'}.
Keep responses SHORT (2-3 sentences max) since they will be spoken aloud via TTS.
Be warm, respectful - use "ji" suffix. Address farmer as "Kisaan bhai" or by name if known.
Focus on practical, actionable advice.

Context about the farmer: ${JSON.stringify(context)}`;

  return await askGroq(systemPrompt, question, { temperature: 0.5, maxTokens: 200 });
}

// Match schemes for a farmer profile
export async function matchSchemesAI(profile, schemes) {
  const systemPrompt = `You are an expert on Indian government agricultural schemes.
Compare the farmer's profile against the provided schemes and determine eligibility.

For each scheme, return:
- "eligible": true/false (meets ALL mandatory criteria)
- "score": 0-100 (percentage of criteria met)
- "missingCriteria": list of criteria not met (for near-eligible)
- "actionRequired": what farmer needs to do to become eligible

Return JSON:
{
  "matches": [
    {
      "schemeId": "string",
      "eligible": boolean,
      "score": number,
      "missingCriteria": ["string"],
      "actionRequired": ["string"],
      "priorityReason": "string"
    }
  ]
}`;

  const userMessage = `Farmer Profile:\n${JSON.stringify(profile, null, 2)}\n\nSchemes to check:\n${JSON.stringify(schemes.map(s => ({ id: s.id, name: s.name, eligibility: s.eligibility })), null, 2)}`;

  const response = await askGroq(systemPrompt, userMessage, { json: true, temperature: 0.1, maxTokens: 4096 });
  return JSON.parse(response);
}

// Profile form questions for voice filling
export const profileQuestions = [
  { field: 'name', questionHi: 'आपका नाम क्या है?', questionEn: 'What is your name?', type: 'text' },
  { field: 'age', questionHi: 'आपकी उम्र क्या है?', questionEn: 'What is your age?', type: 'number' },
  { field: 'gender', questionHi: 'आप पुरुष हैं या महिला?', questionEn: 'Are you male or female?', type: 'select', options: ['male', 'female', 'other'] },
  { field: 'village', questionHi: 'आपके गाँव का नाम बताइये?', questionEn: 'What is your village name?', type: 'text' },
  { field: 'district', questionHi: 'आपके जिले का नाम?', questionEn: 'What is your district?', type: 'text' },
  { field: 'state', questionHi: 'आपके राज्य का नाम?', questionEn: 'Which state do you live in?', type: 'text' },
  { field: 'pincode', questionHi: 'आपका पिन कोड क्या है?', questionEn: 'What is your pin code?', type: 'number' },
  { field: 'landAcres', questionHi: 'आपके पास कितनी जमीन है? एकड़ में बताइये।', questionEn: 'How much land do you have? Tell in acres.', type: 'number' },
  { field: 'irrigationType', questionHi: 'आपकी सिंचाई कैसे होती है? बोरवेल, नहर, या बारिश से?', questionEn: 'What is your irrigation type? Borewell, canal, or rainfed?', type: 'text' },
  { field: 'crops', questionHi: 'आप कौन-कौन सी फसल उगाते हैं?', questionEn: 'What crops do you grow?', type: 'text' },
  { field: 'annualIncome', questionHi: 'आपकी सालाना आमदनी लगभग कितनी है?', questionEn: 'What is your approximate annual income?', type: 'number' },
  { field: 'familyMembers', questionHi: 'आपके परिवार में कितने सदस्य हैं?', questionEn: 'How many family members do you have?', type: 'number' },
  { field: 'hasAadhaar', questionHi: 'क्या आपके पास आधार कार्ड है?', questionEn: 'Do you have an Aadhaar card?', type: 'boolean' },
  { field: 'hasBankAccount', questionHi: 'क्या आपका बैंक खाता है?', questionEn: 'Do you have a bank account?', type: 'boolean' },
  { field: 'hasLivestock', questionHi: 'क्या आपके पास पशु हैं? गाय, भैंस, बकरी?', questionEn: 'Do you have livestock? Cow, buffalo, goat?', type: 'boolean' },
  { field: 'existingSchemes', questionHi: 'क्या आप किसी सरकारी योजना का लाभ ले रहे हैं? कौन सी?', questionEn: 'Are you benefiting from any government scheme? Which ones?', type: 'text' }
];
