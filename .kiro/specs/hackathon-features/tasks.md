# Implementation Tasks: KissanSetu Hackathon Features

## Task Overview

Three feature tracks, ordered by dependency and hackathon impact:
1. **Dual User Auth & Roles** (foundation)
2. **AI Calling Agent** (biggest wow factor)
3. **Voice Control Extensions** (polish)

---

## Track 1: Dual User Auth & Role System

- [x] 1. Extend the auth backend to support dual roles
  - [x] 1.1 Update `/api/auth/send-otp` to use real Twilio SMS (not console log) — install `twilio` package, use `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` from `.env`
  - [x] 1.2 Update `/api/auth/verify-otp` to return `roles` array and `activeRole` in the response
  - [x] 1.3 Add `POST /api/auth/set-role` endpoint — sets initial role for new user, saves to MongoDB users collection
  - [x] 1.4 Add `POST /api/auth/switch-role` endpoint — updates `activeRole` field in MongoDB
  - [x] 1.5 Add `POST /api/auth/add-role` endpoint — appends a new role to user's `roles` array
  - [x] 1.6 Add `GET /api/auth/me` endpoint — returns full user profile including all roles and active role
  - [x] 1.7 Update MongoDB user schema to include `roles`, `activeRole`, `farmerProfile`, `workerProfile`, `equipmentProfile` fields

- [x] 2. Build the Role Selector UI component
  - [x] 2.1 Create `frontend/src/components/auth/RoleSelector.jsx` — card-based UI with two options: "I want to use services (Farmer)" and "I want to provide services (Worker/Equipment Owner)"
  - [x] 2.2 Add a third step to the Login stepper in `frontend/src/pages/Login.jsx` — shown only for new users after OTP verification
  - [x] 2.3 Create `frontend/src/pages/Signup.jsx` — dedicated signup page that walks new users through phone → OTP → role selection → basic profile
  - [x] 2.4 Add `/signup` route in `frontend/src/App.jsx`

- [x] 3. Update AuthContext to handle roles
  - [x] 3.1 Add `activeRole`, `allRoles` to AuthContext state
  - [x] 3.2 Add `switchRole(role)` function that calls `/api/auth/switch-role` and updates local state
  - [x] 3.3 Add `addRole(role)` function that calls `/api/auth/add-role`
  - [x] 3.4 Persist `activeRole` in localStorage alongside user data

- [x] 4. Build Role Switcher in the UI
  - [x] 4.1 Create `frontend/src/components/auth/RoleSwitcher.jsx` — a compact dropdown/chip component showing current role with option to switch
  - [x] 4.2 Add RoleSwitcher to the Header component so it's visible on all pages
  - [x] 4.3 When role switches, show a brief toast/snackbar: "Switched to Worker mode"

- [x] 5. Build Worker Dashboard
  - [x] 5.1 Create `frontend/src/pages/WorkerDashboard.jsx` — shows pending job requests, earnings summary, availability toggle, and calendar of worked days
  - [x] 5.2 Add availability toggle button — calls `PUT /api/profile/worker/:userId/availability`
  - [x] 5.3 Add pending requests section — lists incoming hire requests with Accept/Reject buttons
  - [x] 5.4 Add `/worker-dashboard` route in `frontend/src/App.jsx` protected by `activeRole === 'worker'`

- [x] 6. Update Home page to be role-aware
  - [x] 6.1 In `frontend/src/pages/Home.jsx`, render different content based on `activeRole`:
    - `farmer`: existing home content (browse equipment, hire workers, check schemes)
    - `worker`: quick stats (pending requests, today's earnings, availability status)
    - `equipment_owner`: my listings count, active rentals, earnings

---

## Track 2: AI Calling Agent

- [x] 7. Set up the calling agent backend
  - [x] 7.1 Install `retell-sdk` package in backend: `npm install retell-sdk`
  - [x] 7.2 Create `backend/routes/calling.js` with routes: `POST /retell-webhook`, `POST /vapi-webhook`, `GET /status`
  - [x] 7.3 Register calling routes in `backend/server.js` as `app.use('/api/calling', callingRoutes)`
  - [x] 7.4 Create `backend/services/callingAgentService.js` with:
    - `buildAgentContext()` — queries MongoDB for top 5 available equipment, top 5 available workers, and scheme names, returns formatted string
    - `generateCallerResponse(transcript, context, language)` — calls Groq with a phone-call-optimized prompt, returns short spoken response
    - `detectLanguage(text)` — returns 'hi' or 'en' based on script detection

- [x] 8. Configure Retell AI agent
  - [x] 8.1 Create `backend/scripts/setupRetellAgent.js` — a one-time script that uses Retell API to create/update the agent with the KissanSetu system prompt and links it to the Twilio phone number
  - [x] 8.2 Implement the Retell webhook handler in `calling.js` — receives `call_started`, `transcript`, `call_ended` events and responds with agent messages
  - [x] 8.3 Add `RETELL_AGENT_ID` to `.env` after running the setup script

- [x] 9. Implement VAPI fallback
  - [x] 9.1 Implement the VAPI webhook handler in `calling.js` — handles VAPI's webhook format as a fallback if Retell is unavailable
  - [x] 9.2 Add logic to `GET /api/calling/status` to check which service is active and return the phone number

- [x] 10. Add "Call AI Agent" UI to the website
  - [x] 10.1 Create `frontend/src/components/CallingAgentCard.jsx` — a prominent card showing the phone number (+17179310375), a "Call Now" button (tel: link), and a live status indicator
  - [x] 10.2 Add CallingAgentCard to `frontend/src/pages/Home.jsx` as a featured section
  - [x] 10.3 Fetch agent status from `GET /api/calling/status` and show "🟢 AI Agent Live" or "🔴 Offline" badge
  - [x] 10.4 Add the phone number and a brief description to the Assistant page as well

---

## Track 3: Voice Control Extensions

- [x] 11. Create the Tap-to-Listen (TTS) system
  - [x] 11.1 Create `frontend/src/hooks/useTapToSpeak.js` — hook that takes text content and returns `{ speak, isSpeaking, SpeakerIcon }`. Uses the existing `useVoice` speak function internally
  - [x] 11.2 Create `frontend/src/components/voice/SpeakableCard.jsx` — wrapper component that adds a small 🔊 speaker icon button to any card. On tap, reads the card's text content aloud
  - [x] 11.3 Wrap equipment cards in `frontend/src/pages/Equipment.jsx` with SpeakableCard — reads: name, type, price, owner, location
  - [x] 11.4 Wrap worker cards in `frontend/src/pages/Workers.jsx` with SpeakableCard — reads: name, skills, rate, location, availability
  - [x] 11.5 Wrap scheme cards in `frontend/src/pages/Schemes.jsx` with SpeakableCard — reads: scheme name, benefit, eligibility summary

- [x] 12. Extend voice navigation with more commands
  - [x] 12.1 Create `frontend/src/hooks/useVoiceNav.js` — dedicated hook that wraps intent detection and maps intents to `useNavigate()` calls and filter actions
  - [x] 12.2 Add worker-specific voice commands: "accept karo" triggers accept on top pending request, "available hoon" toggles availability ON, "busy hoon" toggles availability OFF
  - [x] 12.3 Create `frontend/src/components/voice/VoiceCommandOverlay.jsx` — a brief animated overlay (2 seconds) that shows what command was recognized and what action is being taken (e.g., "🎙️ Navigating to Equipment...")
  - [x] 12.4 Integrate VoiceCommandOverlay into the existing VoiceFAB component

- [x] 13. Voice-assisted worker profile setup
  - [x] 13.1 In `frontend/src/pages/Profile.jsx`, add a "Fill with Voice" button for the worker profile section
  - [x] 13.2 Implement voice-guided worker profile fill: asks for name, skills, daily rate, location, bio — same pattern as existing farmer profile voice fill in `aiService.js`
  - [x] 13.3 Add voice fill support for the equipment listing form — asks for equipment type, condition, price per hour

---

## Track 4: Integration & Polish

- [x] 14. Wire up real OTP via Twilio (if not done in Task 1.1)
  - [x] 14.1 Verify Twilio credentials work by checking `backend/services/otpService.js` — update to use actual Twilio client instead of console.log
  - [x] 14.2 Add OTP expiry (10 minutes) and rate limiting (max 3 OTPs per phone per hour) in the auth route

- [x] 15. Add JWT authentication middleware
  - [x] 15.1 Create `backend/middleware/auth.js` — verifies JWT token from `Authorization: Bearer <token>` header
  - [x] 15.2 Apply auth middleware to protected routes: `/api/profile`, `/api/bookings`
  - [x] 15.3 Update frontend API calls to include `Authorization` header using token from AuthContext

- [x] 16. Final demo preparation
  - [x] 16.1 Ensure the Retell/VAPI phone number is displayed prominently on the home page
  - [x] 16.2 Create at least 2 test user accounts — one farmer, one worker — with complete profiles in MongoDB for demo
  - [x] 16.3 Verify the full flow works end-to-end: signup → role select → browse → voice navigate → call AI agent
  - [x] 16.4 Add a "Demo Mode" banner or tooltip on the home page explaining the 3 key features to judges
