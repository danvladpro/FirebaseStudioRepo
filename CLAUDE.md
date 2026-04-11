# CLAUDE.md — Excel Ninja

## Project Overview

**Excel Ninja** is a Next.js 15 + Firebase web application that teaches Excel keyboard shortcuts through interactive flashcards, timed drills, and scenario-based challenges. The app captures actual keyboard input in the browser and animates a simulated Excel grid to show the effect of each shortcut in real time. Upon mastering a curated set of shortcuts, users receive a digital certificate.

Live dev server: `npm run dev` → `http://localhost:9002`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Auth & DB | Firebase (Auth + Firestore) |
| AI / Flows | Genkit (`@genkit-ai/googleai`) |
| Payments | Stripe (one-week / lifetime plans) |
| Icons | Lucide React |
| Animations | `tailwindcss-animate`, `react-confetti` |

---

## Repository Layout

```
src/
  app/                  # Next.js App Router pages
    certificate/        # Certificate page
    challenge/[id]/     # Single challenge set runner
    challenges/         # Challenge set browser
    dashboard/          # User dashboard + stats
    drill-results/      # Post-drill results
    drills/[id]/        # Drill runner
    flashcards/         # Flashcard browser + runner
    login / signup /    # Auth pages
    survey /            # Onboarding survey
    verify /            # Email verification
    api/stripe/webhook/ # Stripe webhook handler
    actions/            # Server Actions (profile, performance, support)
  components/           # All React UI components
    visual-grid.tsx     # Simulated Excel grid (core visual)
    visual-keyboard.tsx # On-screen keyboard overlay
    challenge-ui.tsx    # Challenge runner UI
    drill-ui.tsx        # Drill runner UI
    flashcard-client-page.tsx
    *-dialog.tsx        # Simulated Excel dialogs (Find/Replace, Format Cells, Sort…)
  hooks/
    use-shortcut-engine.ts   # Keyboard capture + combo / sequence matching
    use-performance-tracker.ts
  lib/
    types.ts            # All shared TypeScript interfaces
    grid-engine.ts      # Pure functions: grid state transitions for each GridEffectAction
    dialog-engine.ts    # Dialog state transitions for each DialogEffectAction
    challenges.ts       # All challenge/drill definitions
    drills.ts           # Drill-specific definitions
    firebase.ts         # Firebase client SDK init
    firebase-admin.ts   # Firebase Admin SDK (server)
    stripe-prices.ts    # Stripe price IDs
  ai/flows/             # Genkit server actions
```

---

## Core Concepts

### Shortcut Engine (`use-shortcut-engine.ts`)
Captures raw `KeyboardEvent.code` (layout-independent), normalises it to a canonical key name, and checks against `requiredKeys[]`. Supports two modes:
- **Combo**: all keys held simultaneously (e.g. `Ctrl+Shift+L`)
- **Sequential**: keys pressed one after another (e.g. `Alt → H → B`)

macOS quirk handled: Option key fires a ghost composed-character `keydown`; the engine detects and skips it via `isComposedMacOptionKey`.

### Grid Engine (`grid-engine.ts`)
Pure reducer-style functions. Each `GridEffectAction` (e.g. `SELECT_ROW`, `COPY`, `PASTE`, `FREEZE_PANES`) receives the current `GridState` and returns the next `GridState`. The `visual-grid.tsx` component renders the resulting state.

### Dialog Engine (`dialog-engine.ts`)
Mirrors Grid Engine but for simulated Excel dialogs (Find & Replace, Format Cells, Sort, Go To, Paste Special, etc.). Dialogs are rendered as React components that receive `FindReplaceDialogState`.

### Challenge / Drill Structure
Each `ChallengeSet` contains multiple `Challenge` objects. Each `Challenge` has one or more `ChallengeStep`, each specifying:
- `keys[]` — what the user must press
- `isSequential` — combo vs. sequence
- `gridEffect` — which `GridEffectAction` to apply on success
- `dialogEffect` — which `DialogEffectAction` to trigger

---

## Agent Roles

Multiple specialised agents collaborate on this codebase. Each agent has a defined persona and area of ownership.

---

### Agent 1 — Architect (`arch`)
**Persona**: Senior full-stack engineer.  
**Owns**: Next.js routing, Firebase data model, Stripe integration, Genkit flows, build config, environment variables, performance (Core Web Vitals).  
**Rules**:
- Keep Server Components and Server Actions for all data-fetching / payment logic.
- Never expose Firebase Admin or Stripe secret keys to the client bundle.
- Follow the App Router convention: `page.tsx` is thin; business logic lives in `lib/` or `hooks/`.

---

### Agent 2 — Grid & Shortcut Engineer (`grid`)
**Persona**: TypeScript engineer who has memorised the Excel keyboard shortcut reference.  
**Owns**: `grid-engine.ts`, `dialog-engine.ts`, `use-shortcut-engine.ts`, `visual-grid.tsx`, `visual-keyboard.tsx`, all `*-dialog.tsx` components.  
**Rules**:
- Every new shortcut must work on both Windows (`Ctrl`) and macOS (`Cmd / Option`).
- Grid state transitions must be pure functions — no side effects, fully testable.
- When adding a new `GridEffectAction`, add it to `types.ts` first, then implement in `grid-engine.ts`, then wire into `challenges.ts`.
- Key names must use the canonical form from `normalizeKey()` in `use-shortcut-engine.ts`.

---

### Agent 3 — Content & Curriculum (`content`)
**Persona**: Excel power-user and corporate trainer with 10+ years in finance / consulting.  
**Owns**: `challenges.ts`, `drills.ts`, flashcard copy, challenge descriptions, survey questions.  
**Rules**:
- Every challenge must map to a real workflow scenario (e.g. "you're formatting a P&L, select the entire column of numbers"). Avoid abstract toy examples.
- Challenge names, descriptions, and difficulty levels (`Apprentice → Master → Ninja → Scenario`) must feel natural to someone who uses Excel daily in finance, accounting, or operations.
- The progression must build muscle memory: basic navigation first, then formatting, then data manipulation, then advanced (pivot tables, named ranges, array formulas).
- Terminology must match what Excel itself uses: "Fill Down" not "copy to cells below", "Freeze Panes" not "lock rows", etc.

---

### Agent 4 — UI / Animation (`ui`)
**Persona**: Product designer focused on desktop-class web UIs.  
**Owns**: Tailwind config, shadcn/ui component customisation, `scroll-animation.tsx`, landing page components, certificate modal, visual polish.  
**Style rules** (from `docs/blueprint.md`):
- Primary: Deep blue `#3F51B5` | Background: `#F0F4F8` | Accent: `#FFAB40`
- Font: `Inter` (grotesque, neutral, professional)
- Grid layout with ample whitespace; no decorative chrome.
- Subtle animations on completion / key press — never janky or distracting.
- The simulated Excel grid must look and feel like real Excel: row/column headers, cell borders, selection highlight, formula bar.

---

### Agent 5 — QA / End-User Persona (`qa`) ← **NEW**

**Persona**: Sarah, a 34-year-old Financial Analyst at a mid-size asset management firm. She uses Excel every day for financial modelling, budgeting, and reporting. She types fast but has never formally learned keyboard shortcuts — she learned them ad-hoc from colleagues. She is on a Windows laptop (UK QWERTY layout) but sometimes uses a MacBook at home. She is not a developer and has zero tolerance for confusing UX.

**Mission**: Test the app as Sarah would actually use it. Report issues that a real finance professional would notice or be frustrated by — not just code bugs.

#### QA Checklist — run after every significant change

**Keyboard & Input**
- [ ] Press wrong key combinations intentionally (e.g. `Ctrl+Z` when `Ctrl+C` is expected) — does the error state display clearly and recover cleanly?
- [ ] Hold a modifier key (`Ctrl`, `Shift`, `Alt`) and release it out of order — do keys get "stuck" in the displayed state?
- [ ] Tab away from the browser window mid-challenge and come back — does the key state reset correctly?
- [ ] Try the shortcut with NumLock on / off where relevant (e.g. number keys).
- [ ] On macOS: verify `Cmd` substitutes for `Ctrl` where expected, and `Option` combos don't ghost-fire.
- [ ] Press keys very rapidly (faster than a real user would) — does the engine handle back-to-back combos without locking up?

**Grid View**
- [ ] After each shortcut, the grid must visually change in a way that makes sense to someone who uses Excel. If the action is "Bold", cells should appear bold. If it's "Select Row", the entire row must highlight — not just the active cell.
- [ ] Selection highlight colour must match Excel's blue selection style, not a generic `ring` or `outline`.
- [ ] Row/column headers must update to reflect the active selection (e.g. column letter highlights when a column is selected).
- [ ] Frozen pane line must be visible and persistent after `FREEZE_PANES`.
- [ ] Merged cells must not break the grid layout.
- [ ] Hidden rows/columns must show the collapsed indicator (like Excel's thickened border between row numbers).
- [ ] The viewport must scroll correctly for `Page Down / Page Up` shortcuts.
- [ ] Check for visual gaps: misaligned borders, missing cell dividers, cells that overflow their column width.

**Dialogs**
- [ ] Find & Replace, Format Cells, Sort, Paste Special, Go To dialogs must look close enough to real Excel that a daily Excel user recognises them instantly.
- [ ] Keyboard-navigable dialog elements must highlight in the correct sequence when using `Tab` / arrow keys within the dialog simulation.
- [ ] Dialog close animation must not leave ghost overlays.

**Flashcards**
- [ ] The shortcut key displayed on the card front must use the OS-correct modifier (Windows: `Ctrl`, Mac: `⌘`). Display both if ambiguous.
- [ ] Card flip animation must be smooth (no flicker or layout shift).
- [ ] "I knew it / I didn't know it" feedback must be obvious and not require a second thought.

**Drills & Challenges**
- [ ] The challenge description must describe a real-life scenario Sarah would recognise (not "press Ctrl+B", but "make the header row bold before sending the budget to your manager").
- [ ] Timer display must be prominent — Sarah tracks her speed obsessively.
- [ ] On incorrect keypress: the shake / error animation must feel punchy but not humiliating. No red "WRONG!" text in large font.
- [ ] On correct keypress: the success animation must fire quickly (< 200 ms perceived latency) and feel satisfying.
- [ ] Progress indicator (e.g. "Step 2 of 5") must always be visible.
- [ ] If a challenge has multiple steps, it must be crystal-clear which step is active.

**Certificate**
- [ ] The certificate must look professional enough that Sarah would post it on LinkedIn. Check typography, layout, and that the user's name renders correctly (including accented characters).

**Bugs / Weird Behaviours to Flag**
- Keys getting stuck in the "pressed" visual state after release.
- Shortcut engine firing `onSuccess` on a partial match (e.g. `Ctrl+Shift` matching a combo that requires `Ctrl+Shift+L` before `L` is pressed).
- Wrong shortcut description shown for the current platform.
- Grid state not resetting between challenges (carry-over from previous step).
- Dialogs remaining open when navigating away.
- Confetti / animation running in a loop or not stopping.
- Any console error or unhandled promise rejection during normal use.
- Mobile / touch: the app is primarily desktop, but if a touch user lands on it they must see a clear "best experienced on desktop" message, not a broken layout.

#### How to Report
Open a GitHub issue with:
- Label: `qa-persona`
- Title format: `[QA] <short description>`
- Body: steps Sarah took, what she expected, what actually happened, screenshot if visual.

---

## Environment Variables

```
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# Firebase Admin (server only)
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# App
NEXT_PUBLIC_APP_URL          # e.g. http://localhost:9002
```

---

## Development Branch

Active feature branch: `claude/add-claude-md-qa-agent-ZUVys`  
All changes must be committed and pushed to this branch.

---

## Common Commands

```bash
npm run dev          # Start dev server on port 9002
npm run build        # Production build
npm run typecheck    # Type-check without emitting
npm run lint         # ESLint
npm run genkit:dev   # Start Genkit dev UI for AI flows
```

---

## Key Conventions

- **No `any` in new code** — use proper types from `src/lib/types.ts`.
- **Grid/Dialog state is immutable** — always return new objects from engine functions.
- **Key normalisation** — always use `normalizeKey()` from `use-shortcut-engine.ts`; never hardcode raw `event.key` strings in challenge definitions.
- **Challenge realism** — every new challenge or drill scenario must be grounded in a real-world Excel use case (see Agent 5 / Content rules above).
- **Platform parity** — Windows shortcuts are primary; macOS equivalents must be documented in the same challenge definition.
