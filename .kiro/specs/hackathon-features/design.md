# Design Document: KissanSetu Hackathon Features

## Overview

This design document covers three major features for the KissanSetu (AgriConnect) hackathon project: **AI Calling Agent**, **Dual User Login/Signup System**, and **Full Voice Control**. The platform is a voice-first farming solution built with Node.js/Express backend, MongoDB Atlas, React/Vite frontend, and Material-UI. The design prioritizes real, working implementations with actual API integrations (no dummy data except for payment features which are UI-only demonstrations).

**Hackathon Criteria Focus:**
- **Implementation Quality**: Clean, maintainable code following existing patterns
- **Usefulness**: Solves real farmer problems with practical features
- **Uniqueness**: AI calling agent + dual-role system + full voice control
- **Working with Real Data**: Firebase for calling agent, MongoDB for main data, actual API integrations

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/Vite)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Auth Pages  │  │  Role-Based  │  │   Voice Control Layer  │ │
│  │  (Login/     │  │  Dashboards  │  │   (VoiceFAB + hooks)   │ │
│  │   Signup)    │  │  (Farmer/    │  │   - useVoice           │ │
│  │              │  │   Worker/    │  │   - useVoiceNav        │ │
│  │  Role Select │  │   Equipment) │  │   - TTS on tap         │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express/Node.js)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  /auth   │  │ /profile │  │  /ai     │  │  /calling      │  │
│  │  OTP     │  │  roles   │  │  intent  │  │  Retell/VAPI   │  │
│  │  JWT     │  │  switch  │  │  voice   │  │  webhook       │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                │                        │
    ┌────┴────┐     ┌──────┴──────┐        ┌───────┴───────┐
    │ MongoDB │     │   Firebase  │        │  Retell AI /  │
    │  Atlas  │     │  (Firestore │        │  VAPI + Twilio│
    │  Users  │     │   real-time)│        │  Phone calls  │
    │  Roles  │     │             │        │               │
    └─────────┘     └─────────────┘        └───────────────┘
```

---

## Feature 1: AI Calling Agent

### How It Works

A farmer can call a real phone number (Twilio). The call is handled by **Retell AI** (primary) or **VAPI** (fallback). The AI agent fetches live data from MongoDB/Firebase and responds in Hindi or English.

### Components

**Backend: `backend/routes/calling.js`**
- `POST /api/calling/retell-webhook` — Retell AI webhook to handle call events
- `POST /api/calling/vapi-webhook` — VAPI webhook fallback
- `GET /api/calling/status` — Returns phone number and agent status for display

**Backend: `backend/services/callingAgentService.js`**
- `buildAgentContext()` — Fetches equipment, workers, schemes from MongoDB and formats for AI
- `handleCallerQuery(transcript, language)` — Uses Groq to generate a spoken response
- `detectLanguage(text)` — Detects Hindi vs English from caller speech

**Retell AI Agent Configuration (via API)**
- Agent speaks Hindi by default, switches to English if caller speaks English
- System prompt includes: available equipment, worker count, scheme names, how to book
- LLM: uses Retell's built-in LLM with custom prompt OR connects to custom LLM endpoint

**Frontend: `frontend/src/pages/Home.jsx` (addition)**
- Display a "Call Us" card showing the Twilio phone number
- Show "AI Agent is Live" status badge

### Data Flow

```
Farmer calls +17179310375
    → Twilio receives call
    → Retell AI picks up
    → Retell sends webhook to /api/calling/retell-webhook
    → Backend fetches live data from MongoDB
    → Backend returns context to Retell
    → Retell AI speaks to farmer in Hindi/English
    → Farmer asks "tractor kahan milega?" 
    → AI responds with real listings from DB
```

### Retell Agent System Prompt Template

```
You are KissanSetu AI assistant for Indian farmers. 
Speak in simple Hindi. Switch to English if the caller speaks English.
You have access to real-time data:
- Available equipment: {equipment_list}
- Available workers: {worker_list}  
- Government schemes: {scheme_names}
Help farmers find equipment to rent, workers to hire, and schemes they qualify for.
Keep responses short (2-3 sentences) since this is a phone call.
```

---

## Feature 2: Dual User Login/Signup System

### User Roles

| Role | Description | Can Do |
|------|-------------|--------|
| `farmer` | Normal user / service consumer | Browse, book equipment, hire workers, check schemes |
| `worker` | Service provider (labor) | Accept/reject job requests, manage availability, set rates |
| `equipment_owner` | Service provider (equipment) | List equipment, manage rentals, set pricing |

A single phone number can have multiple roles. After OTP verification, the user selects their active role. They can switch roles from the profile page.

### Auth Flow

```
Step 1: Enter phone number
    → POST /api/auth/check-phone
    → Returns: { exists, roles: ['farmer', 'worker'] }

Step 2: Send OTP (Twilio SMS)
    → POST /api/auth/send-otp
    → Twilio sends SMS with 6-digit OTP

Step 3: Verify OTP
    → POST /api/auth/verify-otp
    → Returns: { user, token, roles, activeRole }

Step 4: Role Selection (new users only)
    → User picks: "I want to use services" (farmer) 
                  OR "I want to provide services" (worker/equipment)
    → POST /api/auth/set-role

Step 5: Role Switch (existing multi-role users)
    → Profile page shows role switcher
    → POST /api/auth/switch-role
    → Frontend re-renders with role-specific UI
```

### MongoDB User Schema

```javascript
{
  _id: ObjectId,
  phoneNumber: String,          // "+919876543210"
  isVerified: Boolean,
  roles: ['farmer', 'worker'],  // all roles this user has
  activeRole: 'farmer',         // currently active role
  
  // Farmer profile (populated when role = farmer)
  farmerProfile: {
    name, age, gender, location, landAcres, crops,
    annualIncome, hasAadhaar, hasBankAccount, ...
  },
  
  // Worker profile (populated when role = worker)
  workerProfile: {
    name, skills, dailyRate, experience, available,
    profilePicUrl, bio, location, ...
  },
  
  // Equipment owner profile
  equipmentProfile: {
    name, businessName, location, ...
  },
  
  createdAt, updatedAt, lastLogin,
  reportCount: 0,
  suspendedUntil: null,
  isDeleted: false,
  deletionRequestedAt: null
}
```

### Frontend Components

**New/Modified Files:**
- `frontend/src/pages/Login.jsx` — Add role selection step (Step 3 in stepper)
- `frontend/src/pages/Signup.jsx` — New page for first-time users with role choice
- `frontend/src/components/auth/RoleSelector.jsx` — Card-based role picker UI
- `frontend/src/components/auth/RoleSwitcher.jsx` — Dropdown in profile/header for switching
- `frontend/src/context/AuthContext.jsx` — Add `activeRole`, `switchRole()`, `addRole()`
- `frontend/src/pages/WorkerDashboard.jsx` — Worker-specific dashboard
- `frontend/src/App.jsx` — Add `/signup`, `/worker-dashboard` routes

### Role-Based UI Rendering

```javascript
// In App.jsx / protected routes
const { user, activeRole } = useAuth();

// Header shows role badge + switcher
// Home page shows different content based on role:
//   farmer → Browse equipment, hire workers, check schemes
//   worker → Pending requests, earnings, availability toggle
//   equipment_owner → My listings, rental requests, earnings
```

---

## Feature 3: Full Voice Control

### Voice Control Layers

The existing `useVoice` hook handles STT/TTS. We extend it with:

**Layer 1: Global Voice Navigation (VoiceFAB)**
- Already exists — extend to handle more intents
- Farmer says "workers dikhao" → navigate to /workers
- Farmer says "mera profile" → navigate to /profile
- Farmer says "tractor kiraye pe chahiye" → navigate to /equipment?type=tractor&action=rent

**Layer 2: Tap-to-Listen (TTS on any card)**
- New hook: `useTapToSpeak()`
- Any card/section gets a speaker icon
- Tap → reads the card content aloud in current language
- Works on: equipment cards, worker cards, scheme cards, booking details

**Layer 3: Voice Profile Fill**
- Already partially exists in AI service
- Extend: voice fills worker profile fields too
- Voice fills equipment listing form

**Layer 4: Voice for Worker Actions**
- Worker can say "accept karo" → accepts pending job request
- Worker can say "available hoon" → toggles availability

### New Files

- `frontend/src/hooks/useTapToSpeak.js` — Hook for tap-to-listen on any element
- `frontend/src/components/voice/SpeakableCard.jsx` — Wrapper component that adds speaker icon + tap-to-speak to any card
- `frontend/src/components/voice/VoiceCommandOverlay.jsx` — Visual overlay showing recognized command + action being taken
- `frontend/src/hooks/useVoiceNav.js` — Dedicated hook for voice navigation (extends intent detection)

### Voice Command Reference (Hindi + English)

| Command | Action |
|---------|--------|
| "home / ghar" | Navigate to home |
| "equipment / yantra dikhao" | Navigate to equipment |
| "workers / majdoor dikhao" | Navigate to workers |
| "yojana / schemes" | Navigate to schemes |
| "mera profile" | Navigate to profile |
| "AI se baat karo / assistant" | Navigate to assistant |
| "tractor chahiye" | Equipment page filtered to tractor |
| "sasta tractor" | Equipment filtered, sorted by price |
| "available workers" | Workers page, available only |
| "accept karo" (worker) | Accept top pending request |
| "available hoon" (worker) | Toggle worker availability ON |
| "busy hoon" (worker) | Toggle worker availability OFF |

---

## Component Interaction Map

```
AuthContext
  ├── user (phone, roles, activeRole, profiles)
  ├── sendOtp() → /api/auth/send-otp
  ├── verifyOtp() → /api/auth/verify-otp
  ├── setRole() → /api/auth/set-role
  └── switchRole() → /api/auth/switch-role

VoiceContext (new)
  ├── useVoice (STT + TTS)
  ├── useVoiceNav (intent → navigation)
  └── useTapToSpeak (card TTS)

CallingAgent
  ├── Retell AI ← /api/calling/retell-webhook
  ├── buildAgentContext() ← MongoDB live data
  └── Phone: +17179310375 (displayed on site)
```

---

## API Endpoints Summary

### Auth Routes (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/check-phone` | Check if phone exists, return roles |
| POST | `/send-otp` | Send OTP via Twilio SMS |
| POST | `/verify-otp` | Verify OTP, return user + token |
| POST | `/set-role` | Set role for new user |
| POST | `/switch-role` | Switch active role |
| POST | `/add-role` | Add a new role to existing user |
| GET | `/me` | Get current user profile |
| POST | `/logout` | Clear session |

### Calling Routes (`/api/calling`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/retell-webhook` | Retell AI call webhook |
| POST | `/vapi-webhook` | VAPI fallback webhook |
| GET | `/status` | Agent status + phone number |
| POST | `/test-call` | Trigger test call (dev only) |

### Profile Routes (extend existing `/api/profile`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/worker/:userId` | Get worker profile |
| PUT | `/worker/:userId` | Update worker profile |
| PUT | `/worker/:userId/availability` | Toggle availability |
| GET | `/equipment-owner/:userId` | Get equipment owner profile |

---

## Technology Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| AI Calling | Retell AI (primary) + VAPI (fallback) | Both keys available; Retell has better Hindi support |
| OTP SMS | Twilio (existing key) | Already in .env, proven for India |
| Auth tokens | JWT stored in localStorage | Simple, works with existing pattern |
| Role storage | MongoDB (single users collection) | Keeps all user data in one place |
| Voice STT | Web Speech API (existing) | Already working, no extra cost |
| Voice TTS | edge-tts backend (existing) | Already working, natural Hindi voice |
| Real-time data for AI | MongoDB direct query | Simpler than Firebase for this use case |

---

## Implementation Priority (Hackathon Order)

1. **Dual User Auth** — Foundation everything else depends on
2. **Role-Based UI** — Makes the demo visually impressive
3. **AI Calling Agent** — Most unique feature, biggest wow factor
4. **Voice Control Extensions** — Polish and accessibility
