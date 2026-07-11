# Eliminate the Firebase auth flash (landing + premium-gated pages)

**Date:** 2026-07-09
**Status:** Approved design, pending implementation plan

## Problem

The Firebase client SDK restores the session asynchronously on page load
(IndexedDB read + token validation), so `onAuthStateChanged` fires ~100ms–2s
after first paint. Until then the app renders the wrong state:

1. **Landing page (`/`)**: nav shows "Sign In / Sign Up Free" and the hero
   shows "Start Free" for a signed-in user, then swaps to the avatar /
   "Go to Dashboard" once Firebase resolves.
2. **Dashboard and flashcards**: `isPremium` is `false` until the Firestore
   profile snapshot arrives, so premium users see locked cards that suddenly
   unlock.

`AuthProvider` (`src/components/auth-provider.tsx`) already exposes a correct
`loading` tri-state — `loading` flips to `false` only after **both** the
Firebase user and the Firestore profile snapshot have arrived — but the
affected components ignore it. `AuthProvider` also already maintains an
`auth-present` cookie (used by `src/middleware.ts` for route protection),
which doubles as a "this browser was signed in last time" hint.

## Constraints

- No spinner on the landing page; it must stay fully static (no server-side
  `cookies()` read).
- App pages may show loading UI — skeletons preferred over spinners.
- No changes to `AuthProvider`'s state machine, redirect rules, or middleware.

## Design

### Part 1 — Landing page: optimistic cookie hint

**New `useAuthHint()` hook** exported from `auth-provider.tsx`:

- Returns `boolean`: whether `document.cookie` contains `auth-present=1`.
- Implemented as `useState(false)` + `useEffect` cookie read, so SSR and the
  first client render return `false` (hydration-safe, page stays static).
  One frame after hydration it reflects the cookie.

**`landing-nav.tsx`** — three-state render:

| State | Render |
|---|---|
| `user` resolved | `<UserMenu />` (as today) |
| `loading` && hint | neutral avatar-sized placeholder circle, same footprint as the UserMenu trigger (no spinner, no layout shift) |
| otherwise | Sign In / Sign Up Free (as today) |

**`landing-hero-cta.tsx`** — "Go to Dashboard" when `user` exists **or**
(`loading` && hint); otherwise "Start Free — No Card Needed".

**Stale-cookie edge case** (signed out elsewhere / token revoked): brief
avatar placeholder, then swap to Sign Up when Firebase resolves. Rare and
acceptable. A stale "Go to Dashboard" click is safe — `/dashboard` is
middleware-protected and bounces to `/login`. Sign-out already clears the
cookie.

### Part 2 — App pages: gate on `loading` with skeletons

One gate covers both `user` and `isPremium` (see `loading` semantics above).
Never render the locked state before the answer is known.

- **`home-page-client.tsx`** (dashboard): while `loading`, render a page
  skeleton — banner area plus a few skeleton challenge cards using the shadcn
  `Skeleton` component, no lock badges.
- **`flashcards/page.tsx`** and **`flashcard-client-page.tsx`**: skeleton grid
  while `loading` instead of computing `isLimited` from a not-yet-known
  `isPremium`.
- **`user-menu.tsx`** (polish): hold the premium gradient ring (not the whole
  menu) until `loading` is false, so the ring doesn't pop in late.

### Out of scope

- `checkout/success/page.tsx` already gates on `authLoading` correctly.
- Full server-side auth (Firebase session cookies via `firebase-admin`) was
  considered and rejected as overkill: the app is fully client-driven
  (Firestore `onSnapshot`), and the flash is cosmetic.

## Testing / verification

No test framework in this repo. Verification:

- `npm run typecheck` (grep output for touched files; pre-existing errors in
  `challenges/page.tsx`, `drill-ui.tsx`, `scroll-animation.tsx` are known).
- Dev-server visual check, per case:
  - Signed-in user, hard reload `/`: avatar placeholder → avatar; no
    "Sign Up" flash; hero shows "Go to Dashboard" immediately.
  - Signed-out visitor (cookie absent), `/`: "Sign Up" renders immediately,
    no placeholder.
  - Premium user, hard reload `/dashboard` and `/flashcards`: skeletons →
    unlocked content; locked cards never appear.
  - Free user: skeletons → locked state (locks may appear after skeleton,
    never the reverse).
  - Stale cookie (delete IndexedDB auth entry, keep cookie): placeholder →
    Sign Up swap, no crash.
