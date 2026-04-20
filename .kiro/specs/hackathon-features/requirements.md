# Requirements: KissanSetu Hackathon Features

## Introduction

KissanSetu (AgriConnect) is a voice-first farming platform for Indian farmers. For the hackathon, three major features need to be implemented on top of the existing working codebase: an AI-powered phone calling agent, a dual-role user system (service consumers vs. service providers), and full voice control across the website. All features must use real API integrations — no dummy data except for payment UI which is display-only.

**Existing stack:** Node.js/Express backend, MongoDB Atlas, React/Vite frontend, Material-UI, Groq AI, edge-tts for TTS, Web Speech API for STT.

**Available API keys (in `backend/.env`):**
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (+17179310375)
- Retell AI: `RETELL_API_KEY`
- VAPI: `VAPI_API_KEY`
- Firebase Admin: `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`
- Groq: already configured in `backend/config/groq.js`

---

## Requirements

### Requirement 1: AI Calling Agent

**User Story:** As a farmer who cannot use a smartphone app, I want to call a phone number and talk to an AI assistant in Hindi or English, so that I can find available equipment, workers, and government schemes without needing to use the website.

#### Acceptance Criteria

1. The system MUST expose a real, callable phone number (+17179310375 via Twilio) that connects to an AI agent.
2. The AI agent MUST respond in Hindi by default and switch to English if the caller speaks English.
3. The AI agent MUST fetch live data from MongoDB (available equipment, available workers, scheme names) before responding — not use hardcoded data.
4. The AI agent MUST be able to answer questions about: available tractors/equipment for rent, available workers and their skills, government schemes, and how to use the platform.
5. The AI agent MUST use Retell AI as the primary provider (using `RETELL_API_KEY`), with VAPI as fallback (using `VAPI_API_KEY`).
6. The backend MUST expose a webhook endpoint (`POST /api/calling/retell-webhook`) that Retell AI calls during conversations.
7. The backend MUST expose a `GET /api/calling/status` endpoint that returns the phone number and whether the agent is active.
8. The website home page MUST display the phone number prominently with a "Call AI Agent" card so judges and users can see and use it.
9. The AI agent responses MUST be short (2–3 sentences) since they are spoken aloud on a phone call.

---

### Requirement 2: Dual User Login & Signup System

**User Story:** As a new user, I want to sign up either as a farmer (to use services) or as a service provider (worker/equipment owner), so that I see a dashboard and features relevant to my role.

**User Story:** As an existing user with multiple roles, I want to switch between my farmer and worker profiles, so that I can use the platform in different capacities without creating separate accounts.

#### Acceptance Criteria

1. The login flow MUST send a real OTP via Twilio SMS to the user's phone number using the existing Twilio credentials.
2. After OTP verification, new users MUST be shown a role selection screen with two clear options:
   - "I want to use services" → assigns `farmer` role
   - "I want to provide services" → lets user choose `worker`, `equipment_owner`, or both
3. A single phone number MUST be able to hold multiple roles (`farmer`, `worker`, `equipment_owner`) stored in MongoDB.
4. The system MUST store an `activeRole` field per user that determines which dashboard and UI they see.
5. Users MUST be able to switch their active role from the profile page or header without logging out.
6. The home page MUST render different content based on `activeRole`:
   - `farmer`: browse equipment, hire workers, check schemes
   - `worker`: pending job requests, earnings summary, availability toggle
   - `equipment_owner`: my listings, active rentals, earnings
7. The backend MUST provide these auth endpoints: `POST /api/auth/check-phone`, `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`, `POST /api/auth/set-role`, `POST /api/auth/switch-role`, `POST /api/auth/add-role`, `GET /api/auth/me`.
8. OTPs MUST expire after 10 minutes.
9. The system MUST rate-limit OTP sending to a maximum of 3 OTPs per phone number per hour.
10. A worker dashboard page MUST exist showing: pending hire requests with Accept/Reject buttons, current availability status with a toggle, and a summary of earnings.
11. The role switcher MUST be visible in the app header on all pages once the user is logged in.

---

### Requirement 3: Full Voice Control

**User Story:** As a farmer who may be illiterate or unfamiliar with smartphones, I want to control the entire website using my voice in Hindi or English, so that I can navigate, find information, and take actions without reading or typing.

#### Acceptance Criteria

1. The existing VoiceFAB (floating mic button) MUST handle voice navigation commands in both Hindi and English, including:
   - Navigate to home, equipment, workers, schemes, profile, assistant pages
   - Filter equipment by type (e.g., "tractor chahiye" → equipment page filtered to tractors)
   - Filter by action (e.g., "kiraye pe tractor" → equipment filtered to rent)
2. Every equipment card, worker card, and scheme card MUST have a speaker (🔊) icon button that, when tapped, reads the card's content aloud using the existing TTS system.
3. The TTS read-aloud for cards MUST include: name, key details (price/rate/skills), location, and availability status.
4. When a voice command is recognized, a brief visual overlay MUST appear (2 seconds) showing what command was heard and what action is being taken.
5. Workers MUST be able to use voice commands specific to their role:
   - "accept karo" → accepts the top pending job request
   - "available hoon" → sets their availability to true
   - "busy hoon" → sets their availability to false
6. The voice profile fill feature MUST work for worker profiles (asking for name, skills, daily rate, location, bio) in addition to the existing farmer profile fill.
7. The voice system MUST use the existing `useVoice` hook and edge-tts backend — no new TTS/STT services should be introduced.
8. Voice commands MUST work in both Hindi and English, with Hinglish (mixed) also supported.

---

### Requirement 4: Real Data Integrity

**User Story:** As a hackathon judge, I want to see that the platform uses real data and real API integrations, so that I can evaluate the implementation quality.

#### Acceptance Criteria

1. The AI calling agent MUST query live MongoDB data (not hardcoded strings) when building its context for responses.
2. OTP delivery MUST use real Twilio SMS — the OTP must actually arrive on the phone.
3. User roles and profiles MUST be persisted in MongoDB Atlas — data must survive a server restart.
4. Equipment and worker listings shown to the AI calling agent MUST be the same data visible on the website.
5. The `GET /api/calling/status` endpoint MUST reflect the actual state of the Retell/VAPI agent (not always return "online").
6. All existing features (equipment browse, worker browse, schemes, AI assistant chat) MUST continue to work after the new features are added — no regressions.

---

### Requirement 5: Hackathon Demo Readiness

**User Story:** As a presenter at the hackathon, I want the project to be demo-ready with clear entry points for each feature, so that judges can quickly understand and evaluate all three features.

#### Acceptance Criteria

1. The home page MUST prominently display the AI calling agent phone number so judges can call it during the demo.
2. The login page MUST clearly show the two user type options (farmer vs. service provider) so the dual-role system is immediately visible.
3. At least one complete farmer profile and one complete worker profile MUST exist in the database as demo data.
4. The role switcher in the header MUST be visually distinct so judges can see the role-switching feature without being told about it.
5. All three features MUST be accessible within 2 clicks/taps from the home page.
6. The application MUST run without errors in both backend and frontend for the demo.
