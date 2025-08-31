## AlgoEd Quiz MVP

A minimal, functional live quiz platform MVP built with React and Vite. It supports a Solo Quiz mode (local, timed, randomized answers) and an optional Live Quiz mode (host-controlled, real-time via Firebase). Includes a Host Panel with controls to start/pause/resume/stop/reset quizzes and a monitoring dashboard.

### 1) Tech Stack
- React 19 (SPA)
- Vite 7 (dev server/build)
- React Router DOM 7 (routing)
- Firebase Web SDK 12
  - Auth (ready for use via `AuthContext` and `authService`)
  - Firestore (real-time quiz sessions, services)
  - Storage/Analytics (provisioned, optional)
- ESLint 9 (linting)

Code highlights:
- `src/pages/Quiz.jsx`: Solo and Live quiz flows; loads `public/philosophy_questions.json`.
- `src/components/QuizQuestion.jsx`: Single-question UI, timer, feedback, submission window control.
- `src/pages/Host.jsx` + `src/components/HostControls.jsx`: Host experience and dashboard.
- `src/services/liveQuizService.js`: Firestore-backed real-time session state.
- `src/services/firebase.js`, `src/services/authService.js`, `src/services/firestoreService.js`: Firebase initialization and services.
- `src/contexts/AuthContext.jsx`: Global auth provider.

### 2) Installation
Prerequisites:
- Node.js 20.19+ or 22.12+ (recommended) and npm 10+

Clone and install:
```bash
# from your workspace root
cd algoed-quiz-mvp
npm install
```

Run development server:
```bash
npm run dev
# open the printed Local URL, typically http://localhost:5173
```

Optional: Firebase (for Live mode backed by Firestore and Auth)
1. Create a Firebase project
2. Enable Firestore (in Native/Modular mode) and Authentication (Email/Password and/or Google)
3. Copy env template and fill values:
```bash
cp env.example .env.local
# edit .env.local with your Firebase web app credentials
```
4. Restart the dev server after changing env variables

Build for production:
```bash
npm run build
npm run preview
```

### 3) Flow Explanations
#### Participant (Solo Quiz)
- Home → Quiz → "Solo Quiz"
- The app loads questions from `public/philosophy_questions.json`.
- On start, answers for each question are randomized (anti-cheat) and a per-question timer starts.
- The participant selects an option and submits.
- Immediate feedback is shown (correct/incorrect), then the next question appears.
- Score is updated locally and shown in the header and on completion.

#### Participant (Live Quiz)
- Home → Quiz → "Live Quiz" (demo)
- In a full setup, participants join an existing session (created by the host) using a Session ID.
- In this MVP, Live quiz can run as a demo: the UI simulates a synchronized experience using the same single-question component with a shorter timer. With Firebase configured, state is persisted and synced via Firestore.

#### Host
- Home → Host
- Authenticate as host with a simple ID (e.g., `host_demo`).
- Create a session (uses first N questions) or join an existing one by Session ID.
- Host Controls:
  - Start/Pause/Resume/Stop/Reset quiz
  - Force next question
  - View real-time monitoring: participant count, progress, answer status, basic stats
- Session state is stored at `live_quizzes/{sessionId}` in Firestore. Clients subscribe via `onSnapshot`.

How the flows facilitate smooth UX:
- One question per view to reduce cognitive load
- Prominent score, progress, and timer
- Clear primary actions: Submit/Next; Reset is available until submission
- Immediate feedback supports learning and keeps engagement high
- In live mode, the host’s controls keep all clients synchronized

### 4) Feature Rationale
- Single-question screen: Matches test spec; reduces ambiguity and speeds decision-making.
- Strict submission window: Prevents late answers; aligns with fair-play rules for competitions.
- Immediate feedback: Reinforces learning and improves user satisfaction.
- Answer randomization per session/user: Simple anti-cheat measure; reduces answer sharing.
- Firestore for live state: Real-time updates with minimal backend code; scalable and observable.
- Error handling patterns:
  - Data loading failures show actionable messages and retry affordances.
  - Submission validations (no answer selected, duplicate submissions, late submissions) return clear, contextual guidance.

### 5) Future Enhancements
- Authentication & Profiles
  - Sign-in/up UI, profile page, persistent quiz history and achievements
- Full Participant Live Flow
  - Join-by-Session-ID participant UI; lobby/waiting room; reconnect logic
- Rich Host Experience
  - Question bank selection; custom timing; per-question reveal/lock; live leaderboard
- Advanced Anti-Cheat
  - Focus/tab-blur tracking; randomized question order; IP/device heuristics
- Accessibility & i18n
  - ARIA roles/labels, keyboard-first flows, localization
- Mobile/PWA
  - Installable app, offline solo quiz
- Analytics & Insights
  - Per-question difficulty, item analysis, and export
- DevOps
  - Firestore security rules, CI/CD, end-to-end tests (Playwright/Cypress)

### Quick Start (What to click)
- Solo Quiz: Navigate to `Quiz` → "Start Solo Quiz"
- Live Demo: `Quiz` → "Start Live Quiz" (works without Firebase; with Firebase configured, uses Firestore sessions)
- Host Panel: `Host` route → authenticate → create/join session → use controls

### Data
- Sample questions: `public/philosophy_questions.json` (easy to swap for other topics)

---
If you run into issues with hot reload, refresh the browser, or restart the dev server with `Ctrl+C` then `npm run dev`. For Firebase-related errors, verify `.env.local` and your Firebase project configuration.

### Time Spent

- Understand requirements and design tech stack, plan development steps ~0.5h
- Project scaffolding, routing, base structure: ~0.5h
- Core quiz flow (Solo): load JSON, state, navigation: ~1h
- QuizQuestion UI: layout, selection, progress, styling: ~1h
- Timer + feedback + submission window control (anti-cheat): ~0.5h
- Live demo mode + session randomization: ~0.5h
- Host panel + controls + monitoring scaffold: ~0.5h
- Firebase wiring (services, env template) and smoke testing: ~0.3h
- README and documentation: ~0.2h

Total: ~5h (included optional live/host features beyond MVP)
