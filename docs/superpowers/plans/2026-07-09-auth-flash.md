# Auth Flash Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the flash of wrong auth state — "Sign Up" shown to signed-in users on the landing page, and locked cards shown to premium users on the dashboard/flashcards — while Firebase restores the session.

**Architecture:** A new `useAuthHint()` hook reads the existing `auth-present` cookie (maintained by `AuthProvider`, consumed by `middleware.ts`) as an optimistic "was signed in last time" guess, letting the static landing page render the signed-in variant one frame after hydration instead of ~1s later. App pages gate on the existing `loading` flag from `useAuth()` — which flips to `false` only after both the Firebase user **and** the Firestore profile snapshot arrive — and render shadcn `Skeleton` placeholders until then.

**Tech Stack:** Next.js 15 App Router, React client components, Firebase client SDK, shadcn/ui `Skeleton`, scoped CSS module for the landing page.

**Spec:** `docs/superpowers/specs/2026-07-09-auth-flash-design.md`

## Global Constraints

- No spinner anywhere on the landing page; a static placeholder circle only.
- The landing page must stay fully static: no server-side `cookies()` read; the cookie is read client-side after mount only.
- Landing styles go in `src/components/landing/landing.module.css`, never in `globals.css` and never as Tailwind utilities in landing JSX (CLAUDE.md rule).
- Do not modify `AuthProvider`'s state machine, redirect rules, or `middleware.ts`.
- No `any` in new code.
- Verification per repo convention: `npm run typecheck` (pre-existing errors exist in `challenges/page.tsx`, `drill-ui.tsx`, `scroll-animation.tsx` — grep output for your specific file) + dev-server visual check on `http://localhost:9002`.
- Rules of hooks: every early `return` added in this plan MUST sit after all hook calls in that component. Each task states the exact insertion point.

---

### Task 1: `useAuthHint()` hook

**Files:**
- Modify: `src/components/auth-provider.tsx` (append after `useIsMac`, line 128)

**Interfaces:**
- Consumes: the `auth-present=1` cookie set at `auth-provider.tsx:39` and cleared at `:53` (do not touch those lines).
- Produces: `export const useAuthHint: () => boolean` — `false` on the server and on the first client render (hydration-safe), then reflects the cookie after mount. Tasks 2 and 3 import it as `import { useAuth, useAuthHint } from "@/components/auth-provider"`.

- [ ] **Step 1: Append the hook to `auth-provider.tsx`**

Add at the end of the file (after the `useIsMac` export). `useState`/`useEffect` are already imported at the top of the file.

```tsx
// Optimistic auth hint: was this browser signed in last time? Reads the
// `auth-present` cookie that AuthProvider maintains (also used by
// middleware.ts). Returns false on the server and on the first client
// render so statically rendered pages hydrate cleanly, then reflects the
// cookie one frame after mount — long before Firebase resolves the session.
export const useAuthHint = (): boolean => {
  const [hint, setHint] = useState(false);
  useEffect(() => {
    setHint(document.cookie.split('; ').includes('auth-present=1'));
  }, []);
  return hint;
};
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck 2>&1 | grep auth-provider`
Expected: no output (pre-existing errors are in other files).

- [ ] **Step 3: Commit**

```bash
git add src/components/auth-provider.tsx
git commit -m "feat: add useAuthHint hook reading the auth-present cookie"
```

---

### Task 2: Landing nav — three-state render + placeholder style

**Files:**
- Modify: `src/components/landing/landing-nav.tsx`
- Modify: `src/components/landing/landing.module.css` (add one rule after `.nav-actions`, line 60)

**Interfaces:**
- Consumes: `useAuthHint()` from Task 1; `loading` from `useAuth()`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the placeholder class to the CSS module**

In `landing.module.css`, directly after the `.nav-actions` rule (line 60), add:

```css
.nav-avatar-placeholder { width: 40px; height: 40px; border-radius: 9999px; background: var(--green-50); border: 1.5px solid var(--border); }
```

(40px matches the `h-10 w-10` UserMenu trigger button, so there is no layout shift when it swaps in.)

- [ ] **Step 2: Three-state render in `landing-nav.tsx`**

Replace the `NavContent` function body's auth section. Full new file content of the changed parts:

```tsx
function NavContent() {
  const { user, loading } = useAuth();
  const authHint = useAuthHint();

  return (
    <nav className={styles.nav}>
      <div className={styles["nav-inner"]}>
        <Link className={styles.logo} href="/">
          <Logo />
        </Link>
        <div className={styles["nav-links"]}>
          <a href="#features">Features</a>
          <a href="#benefits">Why it works</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className={styles["nav-actions"]}>
          {user ? (
            <UserMenu />
          ) : loading && authHint ? (
            <div className={styles["nav-avatar-placeholder"]} aria-hidden="true" />
          ) : (
            <>
              <Link href="/login" className={`${styles.btn} ${styles["btn-ghost"]}`}>
                Sign In
              </Link>
              <Link href="/signup" className={`${styles.btn} ${styles["btn-primary"]}`}>
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

Update the import at the top:

```tsx
import { useAuth, useAuthHint } from "@/components/auth-provider";
```

Keep the `Suspense` wrapper in `LandingNav` unchanged.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck 2>&1 | grep landing-nav`
Expected: no output.

- [ ] **Step 4: Visual check**

With the dev server running (`npm run dev`, port 9002):
- Signed in, hard-reload `/`: placeholder circle appears immediately (no "Sign Up Free" flash), then the avatar replaces it. No layout shift.
- Signed out (or incognito), `/`: Sign In / Sign Up Free render immediately, no placeholder.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/landing-nav.tsx src/components/landing/landing.module.css
git commit -m "fix: landing nav no longer flashes signed-out state for returning users"
```

---

### Task 3: Landing hero CTA — optimistic "Go to Dashboard"

**Files:**
- Modify: `src/components/landing/landing-hero-cta.tsx`

**Interfaces:**
- Consumes: `useAuthHint()` from Task 1; `loading` from `useAuth()`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Update `HeroPrimaryCtaInner`**

```tsx
import { useAuth, useAuthHint } from "@/components/auth-provider";
```

```tsx
function HeroPrimaryCtaInner() {
  const { user, loading } = useAuth();
  const authHint = useAuthHint();

  // Optimistic: show the signed-in CTA while Firebase is still resolving if
  // this browser was signed in last time. A stale hint is harmless —
  // /dashboard is middleware-protected and bounces to /login.
  if (user || (loading && authHint)) {
    return (
      <Link href="/dashboard" className={cx("btn", "btn-primary-lg")}>
        Go to Dashboard
      </Link>
    );
  }

  return (
    <Link href="/signup" className={cx("btn", "btn-primary-lg")}>
      Start Free — No Card Needed
    </Link>
  );
}
```

Keep the `Suspense` wrapper and its signed-out fallback unchanged.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck 2>&1 | grep landing-hero`
Expected: no output.

- [ ] **Step 3: Visual check**

- Signed in, hard-reload `/`: hero shows "Go to Dashboard" with no "Start Free" flash.
- Incognito `/`: "Start Free — No Card Needed" immediately.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/landing-hero-cta.tsx
git commit -m "fix: hero CTA shows Go to Dashboard optimistically via auth hint"
```

---

### Task 4: UserMenu — placeholder while profile loads

Fixes two pops in one: the `??` initials (profile name not loaded yet) and the premium gradient ring appearing late. The menu can render while `loading` is still `true` because `user` arrives before the Firestore profile snapshot.

**Files:**
- Modify: `src/components/user-menu.tsx`

**Interfaces:**
- Consumes: `loading` from `useAuth()` (already imported).
- Produces: nothing consumed by later tasks. `UserMenu` is shared by `app-header.tsx` and `landing-nav.tsx` — both get the fix automatically.

- [ ] **Step 1: Destructure `loading` and add the placeholder return**

Change line 32:

```tsx
  const { user, userProfile, isPremium, loading } = useAuth();
```

Directly after the existing `if (!user) return null;` (line 90 — this is already after every hook call in the component), add:

```tsx
  // Profile (name, premium status) hasn't arrived yet — render a neutral
  // circle instead of wrong initials / a missing premium ring popping in.
  if (loading) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" aria-hidden="true" />;
  }
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck 2>&1 | grep user-menu`
Expected: no output.

- [ ] **Step 3: Visual check**

Signed in as a premium user, hard-reload `/dashboard`: the header avatar appears as a neutral pulsing circle, then swaps to initials + gradient ring in one step — no `??` and no late ring pop.

- [ ] **Step 4: Commit**

```bash
git add src/components/user-menu.tsx
git commit -m "fix: UserMenu shows neutral placeholder until profile is loaded"
```

---

### Task 5: Dashboard — skeleton gate

**Files:**
- Modify: `src/components/home-page-client.tsx`

**Interfaces:**
- Consumes: `loading` from `useAuth()`; `Skeleton` from `@/components/ui/skeleton`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Imports and destructuring**

Add the import:

```tsx
import { Skeleton } from "@/components/ui/skeleton";
```

Change line 61 to include `loading`:

```tsx
  const { user, userProfile, isPremium, loading } = useAuth();
```

- [ ] **Step 2: Add the early return**

Insert immediately before the main `return (` (line 272, after the `getDashboardSubtitle` definition — all hooks in this component are above this point):

```tsx
  // Auth/profile still resolving — render skeletons instead of guessing at
  // the locked/unlocked state (premium users must never see locked cards).
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <AppHeader />
        <main className="flex-1 container py-10 md:py-14 mt-16">
          <header className="mb-8 md:mb-10">
            <Skeleton className="h-9 w-96 max-w-full mb-2" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
            <aside>
              <Skeleton className="h-[420px] rounded-xl" />
            </aside>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-44 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck 2>&1 | grep home-page-client`
Expected: no output.

- [ ] **Step 4: Visual check**

- Premium user, hard-reload `/dashboard`: skeleton layout (matching the sidebar + content grid), then unlocked content. Locked cards / "Go Premium" badges never appear.
- Free user, hard-reload `/dashboard`: skeletons, then the locked state. Locks may appear after skeletons — never unlocked-then-locked or locked-then-unlocked.

- [ ] **Step 5: Commit**

```bash
git add src/components/home-page-client.tsx
git commit -m "fix: dashboard renders skeletons until auth+profile resolve"
```

---

### Task 6: Flashcards browser — skeleton gate

**Files:**
- Modify: `src/app/flashcards/page.tsx`

**Interfaces:**
- Consumes: `loading` from `useAuth()`; `Skeleton` from `@/components/ui/skeleton`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Imports and destructuring**

Add the import:

```tsx
import { Skeleton } from '@/components/ui/skeleton';
```

Change line 40:

```tsx
    const { isPremium, loading } = useAuth();
```

- [ ] **Step 2: Add the early return**

Insert directly after the `useState` on line 41 (both hooks are above; `isLimited`/`setsToDisplay`/`getSubtitle` below are plain expressions, so returning before them is safe):

```tsx
    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <AppHeader />
                <main className="flex-1 container py-8 md:py-12 mt-16">
                    <header className="mb-8 md:mb-12 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Flashcard Decks</h1>
                            <Skeleton className="h-4 w-80 max-w-full mt-2" />
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/dashboard">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Link>
                        </Button>
                    </header>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-56 rounded-xl" />
                        ))}
                    </div>
                </main>
            </div>
        );
    }
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck 2>&1 | grep "flashcards/page"`
Expected: no output.

- [ ] **Step 4: Visual check**

Premium user, hard-reload `/flashcards`: skeleton cards, then all decks unlocked — no locked-deck flash and no "Try 'Formatting Basics'" subtitle flash.

- [ ] **Step 5: Commit**

```bash
git add src/app/flashcards/page.tsx
git commit -m "fix: flashcards browser renders skeletons until auth resolves"
```

---

### Task 7: Flashcard runner — skeleton gate

While `loading`, `isLimited` is `true` and the deck is sliced to 5 cards; when premium resolves the deck silently grows. Gate the runner the same way.

**Files:**
- Modify: `src/components/flashcard-client-page.tsx`

**Interfaces:**
- Consumes: `loading` from `useAuth()`; `Skeleton` from `@/components/ui/skeleton`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Imports and destructuring**

Add the import:

```tsx
import { Skeleton } from "@/components/ui/skeleton";
```

Change line 44:

```tsx
    const { isPremium, loading } = useAuth();
```

- [ ] **Step 2: Add the early return**

Insert directly after the `flashcards` `useMemo` closes (line 66) and before `const currentFlashcard = ...` (line 69). All hooks in this component (2× `useState`, `useAuth`, `useIsMac`, `useMemo`) are above this point:

```tsx
    if (loading) {
        return (
            <div className="w-full max-w-4xl flex flex-col items-center gap-4">
                <Skeleton className="h-[420px] w-full rounded-xl" />
                <Skeleton className="h-10 w-64" />
            </div>
        );
    }
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck 2>&1 | grep flashcard-client-page`
Expected: no output.

- [ ] **Step 4: Visual check**

Premium user, hard-reload `/flashcards/formatting-basics` (or any deck): skeleton card area, then the full deck — the card counter must not jump from a 5-card total to the full total.

- [ ] **Step 5: Commit**

```bash
git add src/components/flashcard-client-page.tsx
git commit -m "fix: flashcard runner waits for auth before sizing the deck"
```

---

### Task 8: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Full typecheck**

Run: `npm run typecheck 2>&1 | grep -E "auth-provider|landing-nav|landing-hero|user-menu|home-page-client|flashcards/page|flashcard-client-page"`
Expected: no output.

- [ ] **Step 2: Run the spec's verification matrix on the dev server**

From the spec (`docs/superpowers/specs/2026-07-09-auth-flash-design.md`):

1. Signed-in user, hard reload `/`: avatar placeholder → avatar; no "Sign Up" flash; hero shows "Go to Dashboard" immediately.
2. Signed-out visitor (incognito), `/`: "Sign Up" renders immediately, no placeholder.
3. Premium user, hard reload `/dashboard` and `/flashcards`: skeletons → unlocked content; locked cards never appear.
4. Free user: skeletons → locked state (never the reverse).
5. Stale cookie: in DevTools → Application, delete the `firebaseLocalStorageDb` IndexedDB database but keep the `auth-present` cookie, reload `/`: placeholder → Sign Up swap, no crash, no redirect loop.

- [ ] **Step 3: Report results**

Report each scenario's pass/fail to the user with any console errors observed.
