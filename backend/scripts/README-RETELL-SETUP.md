# Retell AI Agent Setup Guide

This guide explains how to set up the KissanSetu AI calling agent using Retell AI.

## Prerequisites

1. **Retell AI Account**: Sign up at [https://app.retellai.com](https://app.retellai.com)
2. **API Key**: Get your Retell API key from the dashboard (already in `backend/.env` as `RETELL_API_KEY`)
3. **Twilio Phone Number**: The phone number `+17179310375` is already configured in `.env`

## Setup Steps

### 1. Run the Setup Script

From the project root, run:

```bash
node backend/scripts/setupRetellAgent.js
```

This script will:
- Create a Retell LLM with the KissanSetu system prompt (Hindi/English support)
- Create a Retell Voice Agent using that LLM
- Attempt to link the agent to your Twilio phone number
- Print the `RETELL_LLM_ID` and `RETELL_AGENT_ID` to add to `.env`

### 2. Update `.env`

Copy the IDs printed by the script and add them to `backend/.env`:

```env
RETELL_LLM_ID=llm_xxxxxxxxxxxxx
RETELL_AGENT_ID=agent_xxxxxxxxxxxxx
```

### 3. Import Phone Number (if needed)

If the script says "Could not link phone number automatically", you need to import your Twilio number into Retell:

1. Go to [https://app.retellai.com/phone-numbers](https://app.retellai.com/phone-numbers)
2. Click **"Import Twilio Number"**
3. Follow the prompts to connect your Twilio account
4. Select the phone number `+17179310375`
5. Set the **Inbound Agent** to the `RETELL_AGENT_ID` from step 2

### 4. Configure Webhook URL

For production, update `WEBHOOK_BASE_URL` in `backend/.env` to your public backend URL:

```env
WEBHOOK_BASE_URL=https://your-backend-domain.com
```

For local development, use ngrok:

```bash
ngrok http 5000
```

Then set:

```env
WEBHOOK_BASE_URL=https://abc123.ngrok-free.app
```

The webhook endpoint is: `{WEBHOOK_BASE_URL}/api/calling/retell-webhook`

### 5. Test the Agent

Call the phone number: **+1 (717) 931-0375**

The AI agent should:
- Answer in Hindi by default
- Switch to English if you speak English
- Help with finding tractors, workers, and government schemes
- Use live data from the MongoDB database

## Updating the Agent

To update the system prompt or agent settings, just run the setup script again:

```bash
node backend/scripts/setupRetellAgent.js
```

The script detects existing IDs in `.env` and updates them instead of creating new ones.

## Troubleshooting

### "Could not link phone number"
- Import the Twilio number in the Retell dashboard first (see step 3 above)

### "Agent not responding"
- Check that `RETELL_AGENT_ID` is set in `.env`
- Verify the phone number is linked to the agent in the Retell dashboard
- Check that the webhook URL is publicly accessible (use ngrok for local dev)

### "Webhook not receiving events"
- Verify `WEBHOOK_BASE_URL` is correct and publicly accessible
- Check the Retell dashboard → Agent → Webhook URL matches your backend URL
- Look for webhook logs in your backend console

### "Agent speaks English instead of Hindi"
- The agent detects language from the caller's first words
- Start with a Hindi greeting like "Namaste" or "Tractor chahiye"
- The system prompt prioritizes Hindi by default

## API Documentation

- [Retell API Docs](https://docs.retellai.com)
- [Create Agent API](https://docs.retellai.com/api-references/create-agent)
- [Create LLM API](https://docs.retellai.com/api-references/create-retell-llm)
- [Webhook Events](https://docs.retellai.com/features/register-webhook)
