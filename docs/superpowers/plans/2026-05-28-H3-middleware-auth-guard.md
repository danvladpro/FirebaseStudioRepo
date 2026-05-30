# H3 — Middleware Auth Guard (Feasibility Check + Implementation)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Edge middleware layer that redirects unauthenticated requests to `/login` before the page renders, eliminating the current client-side-only flash-and-redirect behaviour.

**Architecture:** Firebase uses short-lived JWTs that can't be verified at the Edge without a full crypto library. The pragmatic approach for this app is a **lightweight presence check**: store a simple `auth-present` cookie (set on login, cleared on logout) and check it in middleware. This prevents unauthenticated page renders and content flashing. Full cryptographic verification of the token happens inside server actions (C1 plan) — the middleware is the first line of defence for UX, not a cryptographic gate.

**Important trade-off:** The `auth-present` cookie is not cryptographically signed — a user could manually set it in DevTools and see protected page HTML briefly. The page won't load real data without a valid Firebase token (server actions reject it), so the practical risk is low. If you want strong server-side verification, the full solution is Firebase Session Cookies (see note at end).

---

## File Map

| File | Change |
|---|---|
| `src/middleware.ts` | Create — Edge middleware |
| `src/components/auth-provider.tsx` | Set/clear `auth-present` cookie on auth state change |

---

### Task 1: Update `auth-provider.tsx` to set a cookie

**Files:**
- Modify: `src/components/auth-provider.tsx`

- [ ] **Step 1: Add cookie helpers inside the auth state effect**

Find the `onAuthStateChanged` callback and add cookie management:

```ts
useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        setLoading(true);
        if (user) {
            // Signal to middleware that a session exists
            document.cookie = 'auth-present=1; path=/; SameSite=Strict';

            setUser(user);
            const userDocRef = doc(db, 'users', user.uid);
            const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const profileData = docSnap.data() as UserProfile;
                    setUserProfile(profileData);
                } else {
                    setUserProfile(null);
                }
                setLoading(false);
            });
            return () => unsubscribeSnapshot();
        } else {
            // Clear the cookie on sign-out
            document.cookie = 'auth-present=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';

            setUser(null);
            setUserProfile(null);
            setLoading(false);
        }
    });

    return () => unsubscribeAuth();
}, []);
```

The only additions are the two `document.cookie` lines — everything else stays the same.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "auth-provider"
```

Expected: no errors.

---

### Task 2: Create `src/middleware.ts`

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create the file**

```ts
import { NextRequest, NextResponse } from 'next/server';

// Pages that do NOT require authentication
const PUBLIC_PATHS = ['/', '/login', '/signup', '/verify', '/certificate'];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public paths through unconditionally
    if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
        return NextResponse.next();
    }

    // Allow Next.js internal paths, static files, and API routes through
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')  // static files (images, fonts, etc.)
    ) {
        return NextResponse.next();
    }

    // Check for the auth presence cookie
    const authCookie = req.cookies.get('auth-present');

    if (!authCookie?.value) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all paths except Next.js internals
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "middleware"
```

Expected: no errors.

---

### Task 3: Commit

- [ ] **Step 1: Commit**

```bash
git add src/middleware.ts src/components/auth-provider.tsx
git commit -m "security(H3): add Edge middleware auth guard; set auth-present cookie on login/logout"
```

---

### Verification

- [ ] Run `npm run dev`
- [ ] Open an incognito window, navigate to `http://localhost:9002/dashboard` — should redirect to `/login` immediately (no flash of dashboard content)
- [ ] Log in — should be on `/dashboard`
- [ ] Log out — cookie should be cleared; navigating to `/dashboard` should redirect to `/login`
- [ ] Navigate to `/` (landing page) — should work without login
- [ ] Navigate to `/verify?id=test` — should work without login

---

### Note: Stronger alternative (Firebase Session Cookies)

If you want the middleware to cryptographically verify the user, implement Firebase Session Cookies:
1. Create a `POST /api/session` route that accepts a Firebase ID token, calls `adminAuth.createSessionCookie(idToken, { expiresIn })`, and sets it as an `HttpOnly` cookie.
2. On login success (in `auth-provider.tsx`), call this API endpoint with `user.getIdToken()`.
3. In `middleware.ts`, verify the session cookie with `adminAuth.verifySessionCookie()`.

This is a larger change and requires the Firebase Admin SDK to be available in an API route — the current architecture already supports it. Defer this if the lightweight cookie approach above is sufficient for your launch.
