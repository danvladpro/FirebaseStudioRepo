# H2 — Preview Flag Protection

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the `preview: true` admin/bypass flag on user documents can never be set by a client — only by the Firebase Admin SDK or the Firebase console.

**Architecture:** This is primarily achieved by the Firestore security rules in C3 — the `update` rule on `users/{userId}` already blocks any write that touches the `preview` field. This plan covers the one remaining gap: the signup flow creates the initial user document using the **client SDK** (`setDoc`), which means a crafty user could call `setDoc` with `preview: true` in the payload before the document exists. The fix wraps signup document creation in a server action (also resolving M7).

**Depends on:** C3 plan must be applied (Firestore rules deployed) for the full protection.

---

## File Map

| File | Change |
|---|---|
| `src/app/actions/create-user-profile.ts` | Create — new server action for initial doc creation |
| `src/app/signup/page.tsx` | Call server action instead of direct `setDoc` |

---

### Task 1: Create `create-user-profile.ts` server action

**Files:**
- Create: `src/app/actions/create-user-profile.ts`

- [ ] **Step 1: Create the file**

```ts
'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function createUserProfile(firebaseToken: string, email: string) {
    let uid: string;
    try {
        const decoded = await adminAuth.verifyIdToken(firebaseToken);
        uid = decoded.uid;
    } catch {
        throw new Error('Unauthorized');
    }

    const userDocRef = adminDb.collection('users').doc(uid);
    const existing = await userDocRef.get();

    if (existing.exists) {
        // Profile already created (e.g. double-submit), not an error
        return { success: true };
    }

    await userDocRef.set({
        email,
        name: email.split('@')[0] || 'User',
        // 'preview' and 'subscription' are NOT set here — admin sets them manually if needed
    });

    return { success: true };
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "create-user-profile"
```

Expected: no errors.

---

### Task 2: Update `signup/page.tsx` to use the server action

**Files:**
- Modify: `src/app/signup/page.tsx`

- [ ] **Step 1: Add the import**

Add to existing imports:
```ts
import { createUserProfile } from '@/app/actions/create-user-profile';
```

- [ ] **Step 2: Replace the `setDoc` block in `handleSignup`**

Find this block:
```ts
// Create a user document in Firestore
await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    name: user.email?.split('@')[0] || 'User',
});
```

Replace it with:
```ts
// Create user profile via server action (prevents client from setting admin fields)
const token = await user.getIdToken();
await createUserProfile(token, user.email ?? '');
```

- [ ] **Step 3: Remove now-unused imports**

Remove `doc`, `setDoc`, and `db` from imports if they are no longer used elsewhere in the file:
```ts
// REMOVE from import:
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
```

Verify by searching the rest of the file for other uses before deleting.

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "signup"
```

Expected: no errors.

---

### Task 3: Commit

- [ ] **Step 1: Commit**

```bash
git add src/app/actions/create-user-profile.ts src/app/signup/page.tsx
git commit -m "security(H2/M7): create user profile via server action; prevent client setting preview/subscription on signup"
```

---

### Verification

- [ ] Run `npm run dev`
- [ ] Sign up with a new test email — should succeed and land on `/survey`
- [ ] Open Firestore console → `users` collection → find the new document. Confirm:
  - `email` and `name` are set
  - `preview` field does NOT exist
  - `subscription` field does NOT exist
- [ ] Try adding `preview: true` to the `setDoc` call in DevTools (this is now a server action so it can't be tampered with client-side — confirm the signup flow still works normally)
