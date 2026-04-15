# 🌾 AgriConnect - Complete Feature Breakdown (Revised & Final)

---

## 1. 👨‍🌾 FARMER / NORMAL USER MODULE

### 1.1 Profile Creation
- Farmer can fill profile **manually** or via **AI Voice Assistant**
- During profile setup, the system requests **live location**
- Voice assistant asks: *"Are you at your home, field, or somewhere else?"*

#### Location Logic:
| Scenario | Action |
|----------|--------|
| **At Home/Field** | System captures location → Auto-fills address, village, state, country, PIN code |
| **Away from Home/Field** | Treated as **live/temporary location** → Shows workers & equipment within **15 km radius** of current position |

---

### 1.2 Dashboard

#### Monthly Expense Tracker
- View **current month's expenses**
- View **previous months' expenses** using a calendar navigator

#### Calendar View
- Color-coded calendar showing:
  - 🟢 Days items were **purchased**
  - 🔵 Days items were **rented**
  - 🟡 Days **workers were hired**
- Calendar highlights **time slots** for rented items (e.g., 4:00 AM – 6:00 AM highlighted as a block)
- **Only hourly rentals allowed** (no minute-based slots)
- **Expired/completed rentals are automatically removed** from active calendar view by the system and moved to **history**
- Farmer does **NOT** manually remove items — system handles cleanup automatically

#### Item/Rental Detail View
- Farmer can click on each item (rented/purchased/hired worker) and see:
  - Purchase/rental date
  - Duration of rental
  - Time slot
  - Remaining time for active rentals
  - Status badges:
    - `Purchased` | `Rented` | `Request Sent` | `Confirmed` | `Expired` | `Cancelled`
- **Voice assistant** can read out all details instead of farmer reading them

#### Booking Rules
- ⏰ **Minimum booking lead time:** 2 hours ahead of current time
- ❌ **Cancellation window:** Within **2 hours** of booking
- This gives the farmer a **2-hour buffer** to cancel or continue with the order

#### Live Weather
- Displayed in the **center of the website header**
- Auto-refreshes every **5 hours**
- Based on farmer's saved/current location

#### Reporting Feature
- Farmer can **report a worker or equipment/item**
- Before reporting, the **rules/reasons for reporting** are displayed on screen
- Rules are also **read aloud** via voice assistant
- Farmer can only report a **specific worker once** → After reporting, the report button for that worker is **disabled** for that farmer

---

## 2. 👷 WORKER MODULE

### 2.1 Basic Profile
- Name
- Phone number
- Other personal details
- Same profile creation flow as farmer (manual or voice-assisted)

### 2.2 Job Profile
- **Profile picture** — must be **captured live from camera** (upload NOT allowed)
- List of **jobs/skills** the worker can perform
- **Hourly rate** — worker sets his own rate
  - Rate can be changed **only when there are ZERO pending/active jobs**
  - Once fully free → rate change is unlocked
- Complete **job history** — all past jobs listed with details

### 2.3 Worker Dashboard
- **Monthly earnings** summary
- Number of **farmers served** (accepted jobs)
- Number of **farmers/jobs rejected**
- **Calendar view** — showing days worked
- **Monthly working day count**

### 2.4 Accept/Reject System
- When a farmer sends a hire request, the worker can:
  - ✅ **Accept**
  - ❌ **Reject**
- Similar to **Ola/Uber driver** accepting or rejecting a ride

### 2.5 Worker Location for Navigation
- Worker must enter/update his **current working location**
- Farmer/user can then see **Google Maps route** from their current location to the worker's location

### 2.6 Worker Visibility to Farmer
- Farmer can see:
  - Worker's **basic details**
  - **Number of fields worked** (only count, e.g., "20 fields") — **NOT** detailed history of which fields
- This protects worker's and previous clients' privacy

---

## 3. 🔧 EQUIPMENT MODULE

### 3.1 Who Can List Equipment
- **Any registered user** can create an equipment profile
- A user can have:
  - **Only Normal User** profile
  - **Only Worker** profile
  - **Only Equipment** profile
  - **Worker + Equipment** profile combined
  - **Any combination** of the above

### 3.2 Equipment Listing Requirements

#### Images
- **Minimum 4 images** required per item

#### Equipment Details
| Field | Details |
|-------|---------|
| **Equipment type** | Add-on / Vehicle / Tool / etc. |
| **Item name** | Name of the equipment |
| **Condition** | Good / Bad / New / Old |
| **Purpose** | For Rent / For Sale |

#### If Vehicle:
- Model name
- Type (e.g., Tractor, Harvester)
- Year of purchase
- Age of vehicle
- Number plate

#### If Add-on:
- Type of add-on
- Compatible with which vehicle/equipment
- Condition of add-on

#### Pricing
- **Separate hourly rate** can be set for equipment (independent of worker's hourly rate)

### 3.3 Equipment Work History
- Separate **rental/usage history** for each piece of equipment

---

## 4. 🔄 UNIVERSAL USER FEATURES (All User Types)

### 4.1 Profile Switching (Multi-Role System)
- A single user can hold **multiple profiles**:
  - 👨‍🌾 Normal User / Farmer
  - 👷 Worker
  - 🔧 Equipment Lender
- User can **switch between profiles** using a toggle/dropdown
- On switching:
  - User is **signed out** of current profile
  - User is **logged into** the selected profile
  - Dashboard, features, and UI adapt to the **active role**

### 4.2 Browsing
- **Every user** regardless of active role can browse:
  - Other people's equipment
  - Other workers' profiles
  - Act as a **normal user** regardless of their role

### 4.3 Profile Enable/Disable/Delete

| Action | Behavior |
|--------|----------|
| **Temporarily Disable** | Profile hidden from listings; can re-enable anytime |
| **Permanently Disable** | Profile hidden indefinitely; can re-enable anytime |
| **Delete Account** | Account enters **30-day grace period** before permanent deletion |

#### Deletion Logic (Instagram/Facebook style):
- After requesting deletion → **30-day countdown** starts
- If user logs back in within 30 days → account is **restored** and counter **resets**
- If user deletes/deactivates again later → a **new 30-day counter** starts fresh
- After 30 days with no login → account is **permanently deleted**

### 4.4 Hiring Additional Features
- User can set **time using an analogue clock** UI (easier for users unfamiliar with digital time)
- User can add **additional comments** while hiring:
  - Type manually, OR
  - Use **voice-to-text** (speak → converted to text as comment)

---

## 5. 💰 PAYMENT & ESCROW SYSTEM

### 5.1 Escrow / Payment Holding
- When a farmer books a worker or rents equipment:
  - Payment is **held by the system** (escrow)
  - Money is **NOT released to the worker/equipment owner** until the job is verified as complete
- After successful job completion (verified via proximity check) → payment is **released**

### 5.2 Cancellation & Refund
- If cancelled within **2-hour window** → **full refund** to farmer
- If cancelled after 2 hours → refund policy applies (to be defined)

---

## 6. 📍 PROOF OF WORK - PROXIMITY VERIFICATION SYSTEM

### 6.1 How It Works
- This system ensures **both farmer and worker actually met** and the work was performed
- Uses **live GPS location** of both parties

### 6.2 Verification Flow

#### Step 1: Start of Work
| Check | Requirement |
|-------|-------------|
| **Both parties** must be present | Within **100–300 meters** of each other |
| **Live location snapshot** taken | From both farmer's and worker's devices |
| **System validates** | If both locations are within 100–300m proximity → ✅ **Check-in confirmed** |

#### Step 2: End of Work (After Time Slot is Over)
| Check | Requirement |
|-------|-------------|
| **Second live location snapshot** taken | From both farmer's and worker's devices |
| **System validates** | If both locations are again within 100–300m proximity → ✅ **Check-out confirmed** |

### 6.3 Why Two Snapshots?
- **Snapshot 1 (Start):** Proves both parties met at the beginning
- **Snapshot 2 (End):** Proves the worker **stayed and completed** the work, didn't run away after first check-in

### 6.4 After Verification
- Both snapshots verified → **Proof of work confirmed** → **Payment released** from escrow to worker/equipment owner
- If either snapshot fails → **Dispute flagged** for admin review

---

## 7. 🚨 REPORTING & SUSPENSION SYSTEM

### 7.1 Reporting Rules
- A user can report a **specific worker/equipment lender only once**
- After reporting once → the **report button is disabled** for that specific person
- Reporting reasons/rules are **displayed** and **read aloud** before submission

### 7.2 Suspension Tiers (Cumulative & Continuous)

| Total Cumulative Reports | Penalty |
|--------------------------|---------|
| **10 reports** | Account **suspended for 1 week** |
| **20 reports** | Account **suspended for 1 month** |
| **30 reports** | Account **suspended for 1 year** |
| **50 reports** | Account **permanently suspended** (NOT deleted) |

### 7.3 Important Rules
- Report counter is **cumulative** — it continues from previous count after reactivation
- Counter progression from **10 → 20 only begins after account reactivation** from previous suspension
- The same applies for **20 → 30** and **30 → 50**

### 7.4 Reactivation After 50+ Reports
- User can **request reactivation**
- Company team will:
  1. **Review** the profile and report history
  2. **Contact** the user directly
  3. If everything is satisfactory → **reactivate** the account
- Account is **never fully deleted** — always suspended, allowing future review and reactivation

---

## 8. 🎙️ AI VOICE ASSISTANT (Heart of the Project)

> **Core Philosophy:** Make the website usable for **illiterate farmers** as well as **educated farmers**

### 8.1 What It Is
- A **voice-based navigation and interaction layer** across the entire website
- Called "AI" because it **uses AI selectively** for:
  - Understanding spoken input during **profile filling**
  - Understanding spoken commands for **page navigation**
- It is **NOT a full AI chatbot** — it is a **voice-powered UI assistant**

### 8.2 Features

| Feature | Description |
|---------|-------------|
| **Voice-to-Profile Fill** | Farmer speaks answers → AI understands and fills profile fields automatically |
| **Voice Navigation** | Farmer speaks commands like "Go to dashboard" or "Show me workers" → AI understands and navigates to correct page |
| **Tap-to-Listen (TTS)** | Tap/click **any card, box, or detail section** on the website → Text-to-Speech reads it aloud |
| **Voice for Reporting** | Reporting rules read aloud before submission |
| **Voice for Dashboard** | All item details, statuses, calendar info can be **listened to** instead of read |
| **Voice for Comments** | Speak additional comments while hiring → converted to text |

### 8.3 Difference from AI Chat
| Aspect | AI Voice Assistant | AI Chat |
|--------|--------------------|---------|
| **Purpose** | Website navigation & interaction | Free-form Q&A with AI |
| **AI Usage** | Partial (for understanding speech commands) | Fully AI-powered |
| **Output** | Actions (navigate, fill, read aloud) | Formatted text/UI responses |
| **Location** | Available globally across all pages | Dedicated chat page/section |

---

## 9. 🤖 AI CHAT MODULE

### 9.1 What It Is
- A **dedicated, fully AI-powered chat interface**
- Farmer can ask **anything** — farming advice, platform help, general queries, weather, crop info, etc.

### 9.2 How It Works
1. Farmer opens the **AI Chat section**
2. Clicks the **mic button** → mic activates 🎙️
3. Farmer **speaks** his question/query
4. Clicks the **mic button again** → mic deactivates 🔇
5. Speech is **automatically converted to text**
6. Text is **sent to AI** for processing
7. AI **responds** with a formatted answer

### 9.3 Output Design
- AI responses are **NOT plain text**
- Responses are **formatted in UI style** for easy understanding:
  - Cards, bullet points, tables, highlighted sections
  - Visual formatting that even non-readers can interpret with color coding and icons
- Designed to be understandable for:
  - ✅ The **least educated** farmer
  - ✅ The **most tech-savvy** farmer

### 9.4 Voice Input Details
- Only **one mic button** — acts as toggle (tap to start, tap to stop)
- After stopping → automatic send (no separate send button needed for voice)
- Text input also available for those who prefer typing

---

## 10. 📋 GOVERNMENT SCHEMES MODULE

### 10.1 How It Works
- System **auto-fetches schemes** from **government databases/APIs**
- AI **analyzes the farmer's profile** (location, land size, crops, income, caste, age, etc.)
- Based on profile data → AI **matches and suggests eligible schemes**

### 10.2 Features
- ✅ **Personalized scheme recommendations** based on profile
- ✅ **AI-driven eligibility check** — instant matching
- ✅ **Profile completion prompts** — AI suggests adding more details to unlock eligibility for additional schemes
  - Example: *"Add your land size to check eligibility for PM-KISAN scheme"*
- ✅ **Auto-updated** — As government adds/removes schemes, the system reflects changes automatically

---

## 11. 🔐 SUGGESTED ADDITIONS — SECURITY & FEATURES

### Security & Authentication
| # | Feature | Why It's Needed |
|---|---------|-----------------|
| 1 | **OTP-based phone verification** | Prevents fake accounts; essential for rural India |
| 2 | **Role-based access control** | Different permissions for Farmer, Worker, Equipment Lender, Admin |
| 3 | **Session timeout / auto-logout** | Shared devices common in rural areas |
| 4 | **Data encryption (AES-256)** | Protect personal data, location, financial info |
| 5 | **PIN/Biometric lock for payments** | Extra security before money transactions |
| 6 | **Device binding / trusted devices** | Alert if account accessed from new device |

### Payment & Financial
| # | Feature | Why It's Needed |
|---|---------|-----------------|
| 7 | **UPI / Wallet integration** | Primary payment method in rural India |
| 8 | **Auto-generated invoices/receipts** | For every transaction (rental, purchase, hire) |
| 9 | **Payment history** | Separate section showing all transactions |
| 10 | **Tax/GST compliance** | If equipment rental crosses thresholds |

### Communication
| # | Feature | Why It's Needed |
|---|---------|-----------------|
| 11 | **In-app messaging** between farmer & worker | Direct communication without sharing phone numbers |
| 12 | **Call masking** | Protect phone numbers like Ola/Uber |
| 13 | **SMS/WhatsApp notifications** | Not all farmers check websites — push critical updates via SMS |
| 14 | **Push notifications** | Booking confirmations, rental expiry, payment received |

### Platform & Accessibility
| # | Feature | Why It's Needed |
|---|---------|-----------------|
| 15 | **Multi-language support** | Hindi, Marathi, Telugu, Tamil, Kannada, etc. — critical for adoption |
| 16 | **Offline mode / low-bandwidth mode** | Rural areas have poor internet |
| 17 | **PWA (Progressive Web App)** | Install on phone without app store |
| 18 | **Large buttons & high contrast UI** | Accessibility for older farmers |

### Trust & Quality
| # | Feature | Why It's Needed |
|---|---------|-----------------|
| 19 | **Rating & review system (1-5 stars)** | After job completion, both parties rate each other |
| 20 | **Verified badge** | Workers who complete ID verification get a trust badge |
| 21 | **Equipment verification** | Admin verifies number plates, images before listing goes live |
| 22 | **Fraud detection AI** | Flag suspicious accounts, fake images, report abuse patterns |

### Admin Panel
| # | Feature | Why It's Needed |
|---|---------|-----------------|
| 23 | **Admin dashboard** | Manage reports, suspensions, reactivation requests |
| 24 | **Analytics dashboard** | Total users, rentals, revenue, active regions |
| 25 | **Content moderation queue** | Review equipment images, profile pictures before approval |
| 26 | **Manual override** | Admin can manually suspend/reactivate/flag accounts |
| 27 | **Dispute resolution panel** | Handle cases where proximity check fails or parties disagree |

### Smart Features
| # | Feature | Why It's Needed |
|---|---------|-----------------|
| 28 | **Geofencing alerts** | Notify farmer when new worker/equipment available nearby |
| 29 | **Rental expiry reminders** | Alert 1 hour and 30 mins before rental ends |
| 30 | **AI crop advisory** | Based on location, season, weather → suggest best crops |
| 31 | **AI price comparison** | Compare rental rates of similar workers/equipment in area |
| 32 | **Export expense reports** | Download as PDF/Excel for record keeping |
| 33 | **Emergency helpline / SOS** | For urgent disputes or safety concerns |

### Legal & Compliance
| # | Feature | Why It's Needed |
|---|---------|-----------------|
| 34 | **Terms of service & privacy policy** | Legal requirement |
| 35 | **Explicit consent prompts** | For camera, location, microphone access |
| 36 | **Data retention policy** | Define how long deleted user data is stored |
| 37 | **GDPR/Indian Data Protection compliance** | Legal requirement for handling user data |

# 📱 **AgriConnect Subscription Plans**

---

## 🌱 **Why Subscription?**
To provide **premium features**, **priority access**, and **enhanced security** for serious farmers, workers, and equipment owners who want to grow their business on the platform.

---

## 💎 **Subscription Tiers**

| Plan | Price (Monthly) | Price (Annual) | Best For | Key Features |
|------|------------------|----------------|---------|-------------|
| 🟢 **Basic** | **FREE** | — | Casual users, small farmers | ✅ Profile creation<br>✅ Browse workers & equipment<br>✅ Voice assistant<br>✅ AI chat<br>✅ 2 rental request per day<br>✅ 5 equipment listings<br>✅ 10 reports/month |
| 🟡 **Pro Farmer** | **₹49/month** | **₹499/year** (~₹42/month) | Serious farmers, landowners | ✅ **All Basic features**<br>✅ **Unlimited rental requests**<br>✅ **Unlimited equipment listings**<br>✅ **Priority placement** in search results<br>✅ **Advanced analytics** (expense trends, crop suggestions)<br>✅ **Schemes dashboard** with AI recommendations<br>✅ **24/7 priority support**<br>✅ **Verified badge** on profile |
| 🔵 **Pro Worker** | **₹99/month** | **₹999/year** (~₹83/month) | Skilled workers, tractor owners | ✅ **All Basic features**<br>✅ **Unlimited job acceptances**<br>✅ **Priority job visibility** in farmer searches<br>✅ **Equipment rental boost** (top 3 in results)<br>✅ **AI-powered rate suggestions** based on market<br>✅ **24/7 priority support**<br>✅ **Verified badge** on profile |
| 🟣 **Pro Equipment** | **₹149/month** | **₹1,499/year** (~₹125/month) | Equipment owners, rental businesses | ✅ **All Basic features**<br>✅ **Unlimited equipment listings**<br>✅ **Top placement in equipment search**<br>✅ **AI price optimization** suggestions<br>✅ **Advanced analytics** (rental trends, demand forecasting)<br>✅ **Bulk upload** (upload 50+ items at once)<br>✅ **24/7 priority support**<br>✅ **Verified badge** on profile |
| 🏆 **AgriConnect Elite** | **₹299/month** | **₹2,999/year** (~₹250/month) | Large farmers, equipment fleets, businesses | ✅ **All Pro features** (Farmer + Worker + Equipment)<br>✅ **Unlimited everything**<br>✅ **Dedicated account manager**<br>✅ **Exclusive access to new features**<br>✅ **Priority feature requests**<br>✅ **Custom analytics dashboard**<br>✅ **24/7 VIP support**<br>✅ **Verified + Premium badge**<br>✅ **Early access to government schemes** |

---

## 🎁 **Annual Discounts**
- **10–15% savings** on annual plans
- Encourages long-term commitment and reduces churn

---

## 🔒 **Payment Methods**
- **UPI** (Google Pay, PhonePe, Paytm)
- **Debit/Credit Card**
- **Net Banking**
- **Wallet Integration** (Paytm, PhonePe, etc.)
- **Bank Transfer** (for bulk/enterprise plans)

---

## 📅 **Billing & Renewal**
- **Auto-renewal** (can be turned off anytime)
- **Grace period**: 7 days after expiry to renew without losing features
- **Cancellation**: Can cancel anytime; no hidden charges

---

## 🏆 **Bonus Features for All Paid Plans**
| Feature | Description |
|--------|-------------|
| **Ad-Free Experience** | No ads on your dashboard or search results |
| **Priority Customer Support** | Faster response via chat, call, or email |
| **Exclusive Webinars** | Monthly sessions on farming techniques, equipment maintenance, etc. |
| **AI Crop Advisory Pro** | Advanced AI suggestions based on soil, weather, and market trends |
| **Schemes Pro** | AI suggests **all possible schemes** you qualify for, including private ones |
| **Analytics Dashboard** | See trends in your expenses, rentals, and earnings |

---

## 🚀 **Upgrade Path**
- Users can **upgrade/downgrade anytime**
- **Prorated billing** — pay only for the time used in the new plan
- **Free trial** (7 days) for **Pro Farmer** and **Pro Worker** plans

---

## 🛑 **Cancellation Policy**
- **No cancellation fees**
- **Access continues until the end of the billing cycle**
- **Can reactivate anytime** without losing history

---

## 💡 **Why These Plans?**
- **Affordable entry** (₹49/month for serious farmers)
- **Scalable** — grow from Basic to Elite as your needs grow
- **Value-driven** — features directly help users **earn more or save time**
- **Encourages trust** — verified badges and priority placement
- **Supports rural economy** — keeps costs low but offers real value

---
### 📌 **Next Steps**
- Integrate **Razorpay/Paytm Payment Gateway**
- Set up **subscription management dashboard**
- Add **trial period** and **upgrade/downgrade flows**
- Promote **annual plans** with marketing campaigns

---

## 12. 📊 COMPLETE SYSTEM FLOW DIAGRAM

```
┌─────────────────────────────────────────────┐
│              USER REGISTRATION               │
│   (Manual or Voice Assistant Assisted)       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│           LOCATION CHECK                     │
│  "Are you at Home/Field or Away?"           │
├──────────────────┬──────────────────────────┤
│ HOME/FIELD       │ AWAY                     │
│ → Save as        │ → Use as live location   │
│   permanent      │ → Show workers/equipment │
│   address        │   within 15km radius     │
└──────────────────┴──────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│          CHOOSE/SWITCH PROFILE               │
├─────────┬───────────┬───────────┬───────────┤
│ Normal  │  Worker   │ Equipment │  Worker + │
│  User   │  Profile  │  Profile  │ Equipment │
└────┬────┴─────┬─────┴─────┬─────┴─────┬─────┘
     │          │           │           │
     ▼          ▼           ▼           ▼
┌─────────┐ ┌────────┐ ┌─────────┐ ┌─────────┐
│ Browse  │ │ Set    │ │ List    │ │  Both   │
│ Workers │ │ Skills │ │ Items   │ │ Features│
│ & Equip │ │ & Rate │ │ & Rate  │ │         │
└────┬────┘ └───┬────┘ └────┬────┘ └────┬────┘
     │          │           │           │
     ▼          ▼           ▼           ▼
┌─────────────────────────────────────────────┐
│            BOOKING / HIRING FLOW             │
│  1. Farmer searches workers/equipment       │
│  2. Sets time (analogue clock)              │
│  3. Adds comments (voice/text)              │
│  4. Sends request                           │
│  5. Worker accepts/rejects (Ola style)      │
│  6. Payment held in ESCROW                  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│       PROXIMITY VERIFICATION (Proof)         │
│                                             │
│  📍 Snapshot 1 (Start of work)              │
│     Both within 100-300m → ✅ Check-in      │
│                                             │
│  📍 Snapshot 2 (End of time slot)           │
│     Both within 100-300m → ✅ Check-out     │
│                                             │
│  Both ✅ → Payment Released from Escrow     │
│  Any ❌ → Dispute Flagged for Admin Review  │
└─────────────────────────────────────────────┘
```

---

## 13. 📋 FEATURE CHECKLIST SUMMARY

| Module | Feature | Status |
|--------|---------|--------|
| 👨‍🌾 Farmer | Profile creation (manual + voice) | ✅ Defined |
| 👨‍🌾 Farmer | Location-based auto-fill | ✅ Defined |
| 👨‍🌾 Farmer | Dashboard with expenses | ✅ Defined |
| 👨‍🌾 Farmer | Color-coded calendar | ✅ Defined |
| 👨‍🌾 Farmer | Auto-remove expired items from calendar | ✅ Clarified |
| 👨‍🌾 Farmer | 2-hour booking buffer & cancellation | ✅ Defined |
| 👨‍🌾 Farmer | Hourly-only rentals | ✅ Defined |
| 🌤️ Weather | Live weather in header (refresh every 5 hrs) | ✅ Clarified |
| 👷 Worker | Basic + Job profile | ✅ Defined |
| 👷 Worker | Live camera profile pic only | ✅ Defined |
| 👷 Worker | Accept/Reject like Ola/Uber | ✅ Defined |
| 👷 Worker | Rate change only when free | ✅ Defined |
| 👷 Worker | Dashboard with earnings & calendar | ✅ Defined |
| 🔧 Equipment | Min 4 images, vehicle/addon details | ✅ Defined |
| 🔧 Equipment | Separate hourly rate | ✅ Defined |
| 🔧 Equipment | Work history per equipment | ✅ Defined |
| 🔄 Multi-Role | Switch between Normal/Worker/Equipment | ✅ Clarified |
| 🔄 Multi-Role | Sign out & re-login on switch | ✅ Clarified |
| 💰 Payment | Escrow — hold until work verified | ✅ Clarified |
| 📍 Proof of Work | Dual proximity check (start + end) | ✅ Clarified |
| 📍 Proof of Work | 100-300m range validation | ✅ Clarified |
| 🚨 Reporting | One report per user per worker | ✅ Defined |
| 🚨 Suspension | 10/20/30/50 tier system | ✅ Defined |
| 🚨 Reactivation | Manual review after 50+ reports | ✅ Defined |
| 🗑️ Account Deletion | 30-day grace period | ✅ Defined |
| 🎙️ Voice Assistant | Voice profile fill + navigation + TTS | ✅ Defined |
| 🤖 AI Chat | Full AI chat with voice input | ✅ Defined |
| 🤖 AI Chat | UI-formatted responses | ✅ Clarified |
| 📋 Schemes | Auto-fetch from govt API | ✅ Clarified |
| 📋 Schemes | AI-matched to farmer profile | ✅ Defined |
| 🗺️ Maps | Google Maps route to worker | ✅ Defined |
| ⏰ Time Picker | Analogue clock UI | ✅ Defined |
| 🔒 Enable/Disable | Toggle profile visibility | ✅ Defined |

---

This document now covers **every feature you described** with all **8 clarifications incorporated**. You can use this as your **Product Requirements Document (PRD)** for development. Break this down further into **technical architecture**, **database schema**, **API endpoints**, and **sprint-wise development plan**? 🚀 We will do this step by step. Doing full project in one go will be overwhelming and may lead to errors. NOTE: ALL PAYMNET RELATED THINGS WILL BE DUMMY AND WILL BE SHOWN AS IF IT IS INTEGRATED IN REAL. SUBSCRIPTION PAGE WILL BE JUST TO SHOW THE PLANS AND WILL NOT HAVE ANY FUNCTIONALITY TO SUBSCRIBE. THESE SUBSCRIPTIONS ARE JUST FUTURE PLANS.