# C2 — Firebase Admin Safe Initialization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `firebase-admin.ts` crash-safe and export `adminAuth` so server actions can call `verifyIdToken()`.

**Architecture:** Move the `JSON.parse` call inside the existing `try/catch`, add a guard for the missing env var, and export `admin.auth()` as `adminAuth`. If initialization fails, rethrow so the process fails fast with a clear message instead of silently exporting `undefined`.

**Tech Stack:** `firebase-admin`, Node.js `process.env`.

**Note:** This plan must be applied **before** C1, because C1 imports `adminAuth`.

---

## File Map

| File | Change |
|---|---|
| `src/lib/firebase-admin.ts` | Move parse inside try/catch, guard env var, export `adminAuth` |

---

### Task 1: Rewrite `firebase-admin.ts`

**Files:**
- Modify: `src/lib/firebase-admin.ts`

- [ ] **Step 1: Replace the entire file**

```ts
import 'server-only';
import admin from 'firebase-admin';

let adminDb: ReturnType<typeof admin.firestore>;
let adminAuth: ReturnType<typeof admin.auth>;

try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    adminDb = admin.firestore();
    adminAuth = admin.auth();
} catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw error;
}

export { adminDb, adminAuth };
```

Note: the `import 'server-only'` line at the top also resolves **M6** (server-only guard). Install the package first in Task 2.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "firebase-admin"
```

Expected: no errors. If you see `Cannot find module 'server-only'`, complete Task 2 first.

---

### Task 2: Install `server-only` package

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install**

```bash
npm install server-only
```

- [ ] **Step 2: Confirm it's installed**

```bash
node -e "require('server-only'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Typecheck again**

```bash
npx tsc --noEmit 2>&1 | grep "firebase-admin"
```

Expected: no errors for this file.

---

### Task 3: Commit

- [ ] **Step 1: Commit**

```bash
git add src/lib/firebase-admin.ts package.json package-lock.json
git commit -m "security(C2/M6): safe Firebase Admin init; guard missing env var; export adminAuth; add server-only"
```

---

### Verification

- [ ] Run dev server: `npm run dev`
- [ ] Visit `/dashboard` — page should load normally (admin SDK is used indirectly via actions)
- [ ] Temporarily unset `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env.local`, restart dev server — expect a clear error in the terminal, not a cryptic `undefined` crash downstream
