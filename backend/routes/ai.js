import { Router } from 'express';
import { detectIntent, generateVoiceResponse } from '../services/aiService.js';
import { getDB } from '../config/db.js';
import { askGroq } from '../config/groq.js';

const router = Router();

// Smart voice command — detects intent, queries DB, returns specific results
router.post('/smart-voice', async (req, res) => {
  try {
    const { transcript, language } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Transcript is required' });

    const db = getDB();
    const lang = language || 'hi';

    // Step 1: Detect intent + extract search params via AI
    const intentResult = await detectIntent(transcript, lang);
    const { intent, params, confidence } = intentResult;

    let results = null;
    let action = 'navigate';
    let route = null;
    let responseHi = intentResult.responseHi;
    let responseEn = intentResult.responseEn;

    // Step 2: Based on intent, query database smartly
    if (intent === 'search_equipment' || intent === 'navigate_equipment') {
      const query = { status: 'available' };

      // Build query ONLY from non-null params
      if (params?.type && params.type !== 'null' && params.type !== null) {
        query.type = { $regex: params.type, $options: 'i' };
      }
      if (params?.action && params.action !== 'null' && params.action !== null) {
        query.action = params.action;
      }
      if (params?.maxPrice && params.maxPrice !== null) {
        query.price = { $lte: Number(params.maxPrice) };
      }
      if (params?.location && params.location !== 'null' && params.location !== null) {
        query['location.district'] = { $regex: params.location, $options: 'i' };
      }

      // If only status filter (no specific params), search by keywords from transcript
      const hasSpecificFilters = Object.keys(query).length > 1; // more than just 'status'
      if (!hasSpecificFilters) {
        // Extract meaningful words from transcript for text search
        const keywords = (params?.keywords || []).filter(k => k && k !== 'null');
        if (keywords.length > 0) {
          const searchPattern = keywords.join('|');
          query.$or = [
            { name: { $regex: searchPattern, $options: 'i' } },
            { nameHi: { $regex: searchPattern, $options: 'i' } },
            { type: { $regex: searchPattern, $options: 'i' } },
            { description: { $regex: searchPattern, $options: 'i' } }
          ];
        }
      }

      const items = await db.collection('equipment')
        .find(query)
        .sort({ rating: -1 })
        .limit(5)
        .toArray();

      if (items.length > 0) {
        action = 'show_results';
        results = items;
        route = '/equipment';

        const cheapest = items.reduce((min, it) => (it.price || Infinity) < (min.price || Infinity) ? it : min, items[0]);
        const bestRated = items.reduce((max, it) => (it.rating || 0) > (max.rating || 0) ? it : max, items[0]);

        responseHi = `मुझे ${items.length} उपकरण मिले। सबसे सस्ता "${cheapest.nameHi || cheapest.name}" है ₹${cheapest.price} में। सब नीचे दिख रहे हैं।`;
        responseEn = `Found ${items.length} equipment. Cheapest is "${cheapest.name}" at ₹${cheapest.price}. See all results below.`;
      } else {
        // Fall back: show ALL available equipment
        const allItems = await db.collection('equipment')
          .find({ status: 'available' })
          .sort({ rating: -1 })
          .limit(8)
          .toArray();

        if (allItems.length > 0) {
          action = 'show_results';
          results = allItems;
          route = '/equipment';
          responseHi = `आपकी खोज से सीधा नतीजा नहीं मिला, लेकिन ${allItems.length} उपकरण उपलब्ध हैं। देखिये।`;
          responseEn = `No exact match, but ${allItems.length} equipment items are available. Take a look.`;
        } else {
          action = 'navigate';
          route = '/equipment';
          responseHi = 'अभी कोई उपकरण उपलब्ध नहीं है।';
          responseEn = 'No equipment available right now.';
        }
      }
    }
    else if (intent === 'search_workers' || intent === 'navigate_workers') {
      const query = { available: true };

      if (params?.skill && params.skill !== 'null' && params.skill !== null) {
        query.skills = { $regex: params.skill, $options: 'i' };
      }
      if (params?.location && params.location !== 'null' && params.location !== null) {
        query['location.district'] = { $regex: params.location, $options: 'i' };
      }
      if (params?.maxRate && params.maxRate !== null) {
        query.dailyRate = { $lte: Number(params.maxRate) };
      }

      const hasSpecificFilters = Object.keys(query).length > 1;
      if (!hasSpecificFilters) {
        const keywords = (params?.keywords || []).filter(k => k && k !== 'null');
        if (keywords.length > 0) {
          const searchPattern = keywords.join('|');
          query.$or = [
            { name: { $regex: searchPattern, $options: 'i' } },
            { nameHi: { $regex: searchPattern, $options: 'i' } },
            { skills: { $regex: searchPattern, $options: 'i' } },
            { skillsHi: { $regex: searchPattern, $options: 'i' } }
          ];
        }
      }

      const workers = await db.collection('workers')
        .find(query)
        .sort({ rating: -1 })
        .limit(5)
        .toArray();

      if (workers.length > 0) {
        action = 'show_results';
        results = workers;
        route = '/workers';

        const cheapest = workers.reduce((min, w) => (w.dailyRate || Infinity) < (min.dailyRate || Infinity) ? w : min, workers[0]);
        responseHi = `मुझे ${workers.length} मजदूर मिले। सबसे सस्ते "${cheapest.nameHi || cheapest.name}" हैं ₹${cheapest.dailyRate}/दिन। सब नीचे दिख रहे हैं।`;
        responseEn = `Found ${workers.length} workers. Most affordable is "${cheapest.name}" at ₹${cheapest.dailyRate}/day. See all below.`;
      } else {
        action = 'navigate';
        route = '/workers';
        responseHi = 'इस तरह का मजदूर अभी उपलब्ध नहीं। सभी मजदूर पेज पर देखें।';
        responseEn = 'This type of worker is not available now. Check all workers on the page.';
      }
    }
    else if (intent === 'navigate_schemes' || intent === 'check_eligibility') {
      action = 'navigate';
      route = '/schemes';
    }
    else if (intent === 'navigate_profile' || intent === 'fill_profile') {
      action = 'navigate';
      route = '/profile';
    }
    else if (intent === 'navigate_home') {
      action = 'navigate';
      route = '/';
    }
    else if (intent === 'ask_question') {
      action = 'chat';
      route = '/assistant';
      responseHi = 'मैं आपको AI चैट में ले जा रहा हूँ। वहां अपना सवाल पूछें।';
      responseEn = 'Taking you to AI chat. Ask your question there.';
    }
    else if (intent === 'greeting') {
      action = 'greeting';
    }
    else {
      action = 'chat';
      route = '/assistant';
      responseHi = 'मैं पूरी तरह समझ नहीं पाया। AI चैट में दोबारा पूछें।';
      responseEn = 'I didn\'t fully understand. Please ask again in AI chat.';
    }

    res.json({
      intent, confidence, params, action, route, results,
      responseHi, responseEn,
      resultCount: results?.length || 0
    });
  } catch (error) {
    console.error('Smart voice error:', error);
    res.status(500).json({ error: 'Smart voice failed', details: error.message });
  }
});

// Parse single voice dump into complete profile JSON
router.post('/parse-profile-dump', async (req, res) => {
  try {
    const { transcript, language } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Transcript is required' });

    const systemPrompt = `You are parsing a farmer's voice recording into a structured profile. The farmer speaks in Hindi, English, or Hinglish (mix). They may ramble, repeat things, or include filler words — ignore all that and extract ONLY factual information.

CRITICAL EXTRACTION RULES:
1. **Name**: Extract full name, capitalize properly. Ignore "mera naam", "I am", etc.
2. **Age**: Extract from "X saal", "X years old", "X age", "umra X".
3. **Location**: Extract village, district, state, pincode separately. Handle Hindi place names.
4. **Land**: Convert ALL units to ACRES:
   - 1 bigha = 0.619 acres (UP, Bihar, Rajasthan)
   - 1 bigha = 0.331 acres (MP, Gujarat)
   - 1 hectare = 2.471 acres
   - 1 killa = 1 acre (Punjab, Haryana)
   - If unclear region, use 1 bigha = 0.619 acres
5. **Crops**: Extract ALL crop names, translate to English. Common: gehu=wheat, chawal/dhan=rice, bajra=pearl millet, makka=corn/maize, sarso=mustard, chana=chickpea, aaalu=potato, tamatar=tomato, pyaz=onion, ragi=finger millet, soyabean=soybean.
6. **Family**: Count total members. Extract relationships if mentioned. Count self as member.
7. **Income**: Extract annual income. If monthly mentioned, multiply by 12. Handle lakh (100000), hazaar (1000).
8. **Irrigation**: borewell, nahar=canal, baarish=rainfed, tubewell, drip.
9. **Gender**: purush/ladka/mard=male, stri/mahila/aurat=female.

IMPORTANT: Only extract what the farmer actually said. Do NOT make up values. Leave fields as null if not mentioned.

Return JSON (no markdown, no backticks):
{
  "name": "string or null",
  "age": number_or_null,
  "gender": "male|female|other|null",
  "location": {
    "village": "string or null",
    "district": "string or null",
    "state": "string or null",
    "pincode": "string or null"
  },
  "landAcres": number_or_null,
  "landOriginal": "original value and unit mentioned, e.g. '5 bigha'",
  "irrigationType": "string or null",
  "crops": ["array", "of", "crop", "names"] or [],
  "annualIncome": number_or_null,
  "familyMembers": number_or_null,
  "familyDetails": {"key": "value pairs of relationships"} or null,
  "extractedFields": ["list of field names that were successfully extracted"],
  "missingFields": ["list of important fields NOT mentioned"]
}`;

    const response = await askGroq(systemPrompt, `Farmer's recording (${language === 'hi' ? 'Hindi' : 'English'}): "${transcript}"`, { json: true, temperature: 0.1 });
    
    const parsed = JSON.parse(response);
    res.json(parsed);
  } catch (error) {
    console.error('Profile dump parse error:', error);
    res.status(500).json({ error: 'Profile parsing failed', details: error.message });
  }
});

// Update missing profile details using voice dump + existing profile
router.post('/parse-profile-update', async (req, res) => {
  try {
    const { transcript, language, existingProfile } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Transcript is required' });

    const systemPrompt = `You are an AI assistant updating a farmer's profile.
The farmer has spoken a new recording to fill missing details.

You are provided with their CURRENT profile:
${JSON.stringify(existingProfile || {}, null, 2)}

RULE 1: ONLY extract information from the new recording that fills in BLANK or NULL fields in the current profile.
RULE 2: If the farmer mentions something that is ALREADY filled in the current profile (e.g., they say their name again, but the name is already in the profile), DO NOT extract it. Preserve the existing profile values!
RULE 3: Return the FULL merged JSON profile containing BOTH the old retained data and the newly extracted data. Keep the exact same JSON schema.

Return ONLY pure JSON (no markdown). Same schema:
{
  "name": "string",
  "age": number,
  "gender": "male|female|other",
  "location": { "village": "...", "district": "...", "state": "...", "pincode": "..." },
  "landAcres": number,
  "irrigationType": "...",
  "crops": [],
  "annualIncome": number,
  "familyMembers": number
}`;

    const response = await askGroq(systemPrompt, `New Recording (${language === 'hi' ? 'Hindi' : 'English'}): "${transcript}"`, { json: true, temperature: 0.1 });
    let parsed = JSON.parse(response);
    
    // Strict merge: Do not let AI overwrite fields that already exist with truthy values in existingProfile
    if (existingProfile) {
       for (const key in existingProfile) {
         if (existingProfile[key] !== null && existingProfile[key] !== undefined && existingProfile[key] !== '') {
           parsed[key] = existingProfile[key];
         }
       }
    }

    res.json(parsed);
  } catch (error) {
    console.error('Profile update parse error:', error);
    res.status(500).json({ error: 'Profile update parsing failed', details: error.message });
  }
});

// Convert activity details to natural language
router.post('/describe-activity', async (req, res) => {
  try {
    const { activity, language } = req.body;
    const langString = language === 'en' ? 'English' : 'Hindi';
    
    const systemPrompt = `You are an AI assistant for a farming app. 
You will be provided with a JSON object of a recent activity (booking/renting).
Convert this data into ONE simple, natural, polite sentence in ${langString} explaining what the farmer did. 
Use numbers directly. If action is rent, say rented (किराये पर लिया), if buy, say bought (खरीदा).

Return ONLY the sentence, no other text, no quotes.`;

    const response = await askGroq(systemPrompt, JSON.stringify(activity, null, 2), { temperature: 0.3 });
    res.json({ description: response.trim() });
  } catch(error) {
    console.error('Activity describe error:', error);
    res.status(500).json({ error: 'Failed to describe activity' });
  }
});

// Detect voice command intent (backward compatibility)
router.post('/intent', async (req, res) => {
  try {
    const { transcript, language } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Transcript is required' });
    const result = await detectIntent(transcript, language || 'hi');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Intent detection failed', details: error.message });
  }
});

// Generate voice assistant response
router.post('/chat', async (req, res) => {
  try {
    const { message, context, language } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const response = await generateVoiceResponse(context || {}, message, language || 'hi');
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Chat response failed', details: error.message });
  }
});

export default router;
