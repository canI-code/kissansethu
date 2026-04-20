import { Router } from 'express';
import { buildAgentContext, generateCallerResponse, detectLanguage } from '../services/callingAgentService.js';

const router = Router();

// ---------------------------------------------------------------------------
// In-memory call tracking
// Updated by Retell and VAPI webhooks so /status can reflect real activity.
// ---------------------------------------------------------------------------
let agentStatus = {
  retell: { active: false, lastActivity: null, activeCalls: 0 },
  vapi:   { active: false, lastActivity: null, activeCalls: 0 },
};

// ---------------------------------------------------------------------------
// POST /api/calling/retell-webhook
//
// Retell sends call lifecycle events here (configured via setupRetellAgent.js
// or the Retell dashboard → Agent → Webhook URL).
//
// Event types we handle:
//   call_started  — a new inbound call has connected to the agent
//   call_ended    — the call has finished (user hung up or silence timeout)
//
// NOTE: Retell's built-in LLM handles all real-time conversation turns
// automatically using the system prompt set in setupRetellAgent.js.
// This webhook is for logging, analytics, and status tracking only.
// Retell expects a 200 OK with an empty body (or { received: true }).
// ---------------------------------------------------------------------------
router.post('/retell-webhook', async (req, res) => {
  try {
    const payload = req.body;
    const eventType = payload?.event;
    const call = payload?.call || {};

    console.log(`📞 Retell webhook — event: ${eventType}, call_id: ${call.call_id || 'n/a'}`);

    // Always mark Retell as recently active when we receive any webhook
    agentStatus.retell.lastActivity = new Date();
    agentStatus.retell.active = true;

    switch (eventType) {
      case 'call_started': {
        agentStatus.retell.activeCalls += 1;
        console.log(
          `📞 Call started — from: ${call.from_number || 'unknown'}, ` +
          `call_id: ${call.call_id}, active calls: ${agentStatus.retell.activeCalls}`
        );
        break;
      }

      case 'call_ended': {
        agentStatus.retell.activeCalls = Math.max(0, agentStatus.retell.activeCalls - 1);
        const durationSec = call.end_timestamp && call.start_timestamp
          ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
          : null;
        console.log(
          `📞 Call ended — call_id: ${call.call_id}, ` +
          `duration: ${durationSec != null ? durationSec + 's' : 'unknown'}, ` +
          `reason: ${call.disconnection_reason || 'unknown'}, ` +
          `active calls remaining: ${agentStatus.retell.activeCalls}`
        );
        // Log a brief transcript summary if available
        if (call.transcript) {
          const lines = call.transcript.split('\n').slice(0, 4).join(' | ');
          console.log(`   Transcript preview: ${lines}`);
        }
        break;
      }

      default:
        // Retell may send other events (e.g. call_analyzed) — acknowledge them
        console.log(`📞 Retell webhook — unhandled event type: ${eventType}`);
    }

    // Retell expects a 200 response; body content is ignored
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Retell webhook error:', error);
    // Still return 200 so Retell does not retry indefinitely
    res.status(200).json({ received: true, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/calling/retell-dynamic-vars
//
// Retell calls this webhook right before the call connects to fetch live DB data
// and injects it into the LLM system prompt where {{mongodb_context}} is placed.
// ---------------------------------------------------------------------------
router.post('/retell-dynamic-vars', async (req, res) => {
  try {
    const context = await buildAgentContext();
    res.json({
      mongodb_context: context || "No live data available."
    });
  } catch (error) {
    console.error('Retell dynamic vars error:', error);
    res.status(500).json({ error: 'Failed to fetch dynamic variables' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/calling/vapi-webhook
//
// VAPI fallback webhook (if Retell is unavailable or for testing).
// VAPI has a different webhook format than Retell.
// ---------------------------------------------------------------------------
router.post('/vapi-webhook', async (req, res) => {
  try {
    const payload = req.body;
    const messageType = payload?.message?.type;

    console.log(`📞 VAPI webhook — message type: ${messageType}`);

    // Mark VAPI as recently active
    agentStatus.vapi.lastActivity = new Date();
    agentStatus.vapi.active = true;

    switch (messageType) {
      case 'assistant-request': {
        // VAPI is requesting the assistant configuration at call start
        const context = await buildAgentContext();
        agentStatus.vapi.activeCalls += 1;

        return res.json({
          assistant: {
            firstMessage:
              'Namaste! Main KhetSetu AI assistant hoon. Tractor, majdoor, ya sarkari yojana ke baare mein poochein.',
            model: {
              provider: 'groq',
              model: 'llama-3.3-70b-versatile',
              systemPrompt: `You are KhetSetu AI Assistant for Indian farmers. Speak in simple Hindi. Switch to English if caller speaks English. Keep responses SHORT (2-3 sentences) since this is a phone call. Current data:\n${context}`,
            },
            voice: {
              provider: 'playht',
              voiceId: 'hindi-female',
            },
          },
        });
      }

      case 'transcript': {
        // VAPI sends real-time transcript updates (for logging/analytics)
        const callerText = payload?.message?.transcript || '';
        console.log(`   Transcript: ${callerText.slice(0, 80)}...`);
        return res.json({ received: true });
      }

      case 'end-of-call-report': {
        agentStatus.vapi.activeCalls = Math.max(0, agentStatus.vapi.activeCalls - 1);
        console.log(
          `📞 VAPI call ended. Summary: ${payload?.message?.summary || 'n/a'}, ` +
          `active calls: ${agentStatus.vapi.activeCalls}`
        );
        return res.json({ received: true });
      }

      default:
        // Acknowledge unknown VAPI events
        console.log(`📞 VAPI webhook — unhandled message type: ${messageType}`);
        return res.json({ received: true });
    }
  } catch (error) {
    console.error('VAPI webhook error:', error);
    // Return 200 to prevent retries
    res.status(200).json({ received: true, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/calling/status
//
// Returns the phone number and whether the AI agent is active.
// Used by the frontend CallingAgentCard to show "🟢 AI Agent Live" or "🔴 Offline".
// ---------------------------------------------------------------------------
router.get('/status', async (req, res) => {
  try {
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER?.replace(/"/g, '') || '+17179310375';
    const retellConfigured = !!process.env.RETELL_API_KEY;
    const vapiConfigured   = !!process.env.VAPI_API_KEY;
    const agentId          = process.env.RETELL_AGENT_ID || null;

    // "Recently active" = received a webhook in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const retellRecentlyActive =
      agentStatus.retell.lastActivity && agentStatus.retell.lastActivity > fiveMinutesAgo;
    const vapiRecentlyActive =
      agentStatus.vapi.lastActivity && agentStatus.vapi.lastActivity > fiveMinutesAgo;

    // The agent is "online" if Retell is fully configured (key + agent ID),
    // OR if VAPI is configured as a fallback when Retell is not set up.
    const retellOnline = retellConfigured && !!agentId;
    const vapiOnline   = vapiConfigured && !retellOnline; // VAPI is fallback only
    const isOnline     = retellOnline || vapiOnline;
    const activeService = retellOnline ? 'retell' : vapiOnline ? 'vapi' : null;

    res.json({
      phoneNumber,
      isOnline,
      activeService,
      agentId,
      services: {
        retell: {
          configured: retellConfigured,
          agentConfigured: !!agentId,
          recentlyActive: retellRecentlyActive,
          activeCalls: agentStatus.retell.activeCalls,
          lastActivity: agentStatus.retell.lastActivity,
        },
        vapi: {
          configured: vapiConfigured,
          recentlyActive: vapiRecentlyActive,
          activeCalls: agentStatus.vapi.activeCalls,
          lastActivity: agentStatus.vapi.lastActivity,
        },
      },
      message: isOnline
        ? `AI Agent is live on ${phoneNumber}. Call now to get help in Hindi or English!`
        : retellConfigured && !agentId
          ? `Retell API key found but agent not configured. Run: node backend/scripts/setupRetellAgent.js`
          : !retellConfigured && !vapiConfigured
            ? `No AI calling service configured. Add RETELL_API_KEY or VAPI_API_KEY to .env`
            : `AI Agent configuration incomplete.`,
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Status check failed', details: error.message });
  }
});

export default router;
