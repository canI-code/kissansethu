/**
 * One-time setup script: Creates (or updates) the KissanSetu Retell AI agent
 * and links it to the Twilio phone number for inbound calls.
 *
 * Run with: node backend/scripts/setupRetellAgent.js
 *
 * What it does:
 *   1. Creates a Retell LLM with the KissanSetu system prompt
 *   2. Creates a Retell Voice Agent using that LLM
 *   3. Links the agent to the Twilio phone number (+17179310375) for inbound calls
 *   4. Prints the RETELL_AGENT_ID — add it to backend/.env
 *
 * Re-running the script will UPDATE the existing agent if RETELL_AGENT_ID is
 * already set in .env, so it is safe to run multiple times.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Retell from 'retell-sdk';

// Load .env from the backend directory
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER?.replace(/"/g, '') || '+17179310375';
const EXISTING_AGENT_ID = process.env.RETELL_AGENT_ID;
const EXISTING_LLM_ID = process.env.RETELL_LLM_ID;

// The public URL where your backend is deployed (used for the call-event webhook).
// For local dev, use an ngrok URL. For production, use your real domain.
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || 'https://your-backend-domain.com';

if (!RETELL_API_KEY) {
  console.error('❌ RETELL_API_KEY is not set in backend/.env');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// KissanSetu system prompt for the Retell LLM
// ---------------------------------------------------------------------------
const KISSANSETU_SYSTEM_PROMPT = `You are KissanSetu AI Assistant — a helpful phone agent for Indian farmers.

LANGUAGE RULES:
- Speak in simple Hindi by default. Use Hinglish (Hindi + English mix) if it sounds more natural.
- If the caller speaks in English, switch to English for the rest of the call.
- Always use respectful language. Address the caller as "Kisaan ji" or "Bhai ji".

YOUR CAPABILITIES:
You can help farmers with:
1. Finding available tractors and farm equipment for rent or purchase
2. Finding available farm workers (majdoor) for hire
3. Information about government schemes (sarkari yojana) for farmers
4. How to use the KissanSetu website/app

PHONE CALL RULES (VERY IMPORTANT):
- Keep every response SHORT — maximum 2-3 sentences. This is a phone call.
- Do not use bullet points or lists — speak naturally.
- If you don't know something specific, say so politely and suggest they visit the website.
- Always end with a helpful question or next step.

EXAMPLE RESPONSES:
Caller: "Tractor chahiye"
You: "Ji haan, humare paas kai tractors available hain kiraye pe. Aapko kab aur kahan chahiye? Main aapko sahi option bata sakta hoon."

Caller: "Koi worker milega harvesting ke liye?"
You: "Bilkul ji. Humare paas experienced harvesting workers available hain. Aapka khet kahan hai aur kab kaam chahiye?"

Caller: "PM Kisan scheme ke baare mein batao"
You: "PM Kisan Samman Nidhi mein registered farmers ko har saal 6000 rupaye milte hain. Kya aap already registered hain, ya registration mein madad chahiye?"`;

const BEGIN_MESSAGE =
  'Namaste! Main KissanSetu AI assistant hoon. Aap tractor, majdoor, ya sarkari yojana ke baare mein pooch sakte hain. Aapki kya madad kar sakta hoon?';

// ---------------------------------------------------------------------------
// Main setup function
// ---------------------------------------------------------------------------
async function setup() {
  const client = new Retell({ apiKey: RETELL_API_KEY });

  console.log('🌾 KissanSetu — Retell AI Agent Setup');
  console.log('=====================================');
  console.log(`📞 Phone number: ${TWILIO_PHONE_NUMBER}`);
  console.log(`🔑 Retell API key: ${RETELL_API_KEY.slice(0, 12)}...`);
  console.log('');

  // -------------------------------------------------------------------------
  // Step 1: Create or update the Retell LLM
  // -------------------------------------------------------------------------
  let llmId = EXISTING_LLM_ID;

  if (llmId) {
    console.log(`🔄 Updating existing Retell LLM: ${llmId}`);
    try {
      await client.llm.update(llmId, {
        model: 'gpt-4.1-mini',
        general_prompt: KISSANSETU_SYSTEM_PROMPT,
        begin_message: BEGIN_MESSAGE,
      });
      console.log(`✅ LLM updated: ${llmId}`);
    } catch (err) {
      console.warn(`⚠️  Could not update LLM (${err.message}). Will create a new one.`);
      llmId = null;
    }
  }

  if (!llmId) {
    console.log('📝 Creating new Retell LLM...');
    const llm = await client.llm.create({
      model: 'gpt-4.1-mini',
      general_prompt: KISSANSETU_SYSTEM_PROMPT,
      begin_message: BEGIN_MESSAGE,
    });
    llmId = llm.llm_id;
    console.log(`✅ LLM created: ${llmId}`);
  }

  // -------------------------------------------------------------------------
  // Step 2: Create or update the Retell Voice Agent
  // -------------------------------------------------------------------------
  let agentId = EXISTING_AGENT_ID;

  const agentConfig = {
    agent_name: 'KissanSetu AI Assistant',
    response_engine: { type: 'retell-llm', llm_id: llmId },
    // Hindi-capable voice — "11labs-Meera" is a natural Hindi female voice on Retell
    voice_id: '11labs-Meera',
    language: 'hi-IN',
    // Webhook for call lifecycle events (call_started, call_ended, etc.)
    webhook_url: `${WEBHOOK_BASE_URL}/api/calling/retell-webhook`,
    webhook_events: ['call_started', 'call_ended'],
    // Call settings
    responsiveness: 1,
    interruption_sensitivity: 0.8,
    end_call_after_silence_ms: 30000,   // hang up after 30s of silence
    max_call_duration_ms: 600000,        // max 10 minutes per call
    // Boost recognition of farming-related words
    boosted_keywords: [
      'tractor', 'majdoor', 'yojana', 'kisan', 'fasal', 'kiraya',
      'harvesting', 'sowing', 'equipment', 'worker', 'scheme',
    ],
  };

  if (agentId) {
    console.log(`🔄 Updating existing Retell Agent: ${agentId}`);
    try {
      await client.agent.update(agentId, agentConfig);
      console.log(`✅ Agent updated: ${agentId}`);
    } catch (err) {
      console.warn(`⚠️  Could not update agent (${err.message}). Will create a new one.`);
      agentId = null;
    }
  }

  if (!agentId) {
    console.log('🤖 Creating new Retell Voice Agent...');
    const agent = await client.agent.create(agentConfig);
    agentId = agent.agent_id;
    console.log(`✅ Agent created: ${agentId}`);
  }

  // -------------------------------------------------------------------------
  // Step 3: Link the agent to the Twilio phone number for inbound calls
  // -------------------------------------------------------------------------
  console.log(`\n📞 Linking agent to phone number ${TWILIO_PHONE_NUMBER}...`);
  try {
    await client.phoneNumber.update(TWILIO_PHONE_NUMBER, {
      inbound_agent_id: agentId,
      nickname: 'KissanSetu Helpline',
    });
    console.log(`✅ Phone number linked to agent`);
  } catch (err) {
    // The phone number may not be registered in Retell yet (it's a Twilio number).
    // In that case, the user needs to import it in the Retell dashboard first.
    console.warn(`⚠️  Could not link phone number automatically: ${err.message}`);
    console.warn('   → If this is a Twilio number, import it in the Retell dashboard first:');
    console.warn('     https://app.retellai.com/phone-numbers → "Import Twilio Number"');
    console.warn(`   → Then set the inbound agent to: ${agentId}`);
  }

  // -------------------------------------------------------------------------
  // Step 4: Print the IDs to add to .env
  // -------------------------------------------------------------------------
  console.log('\n=====================================');
  console.log('✅ Setup complete! Add these to backend/.env:');
  console.log('=====================================');
  console.log(`RETELL_LLM_ID=${llmId}`);
  console.log(`RETELL_AGENT_ID=${agentId}`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('  1. Add the above lines to backend/.env');
  console.log('  2. If the phone number link failed, import it in the Retell dashboard');
  console.log(`     and set the inbound agent to: ${agentId}`);
  console.log('  3. Make sure WEBHOOK_BASE_URL in .env points to your public backend URL');
  console.log(`     Current webhook URL: ${WEBHOOK_BASE_URL}/api/calling/retell-webhook`);
  console.log('  4. Test by calling: ' + TWILIO_PHONE_NUMBER);
}

setup().catch((err) => {
  console.error('\n❌ Setup failed:', err.message);
  if (err.status) {
    console.error(`   HTTP ${err.status}: ${err.name}`);
  }
  process.exit(1);
});
