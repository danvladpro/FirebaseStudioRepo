# M7 — Move User Document Creation to Server Action

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the direct client-side `setDoc` call in `signup/page.tsx` with a server action, so the initial user document is created by server-controlled code that cannot be tampered with via browser DevTools.

**Note:** If you applied the H2 plan, this is already done — H2 creates the `create-user-profile.ts` server action and updates `signup/page.tsx`. Only follow this plan if you are NOT applying H2.

---

## File Map

| File | Change |
|---|---|
| `src/app/actions/create-user-profile.ts` | Create — server action |
| `src/app/signup/page.tsx` | Call server action instead of `setDoc` |

---

### Task 1: Create the server action

**Files:**
- Create: `src/app/actions/create-user-profile.ts`

- [ ] **Step 1: Create the file**

```ts
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

const CreateUserProfileSchema = z.object({
    uid: z.string().min(1),
    email: z.string().email(),
});

export async function createUserProfile(input: z.infer<typeof CreateUserProfileSchema>) {
    const validation = CreateUserProfileSchema.safeParse(input);
    if (!validation.success) {
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }

    const { uid, email } = validation.data;
    const userDocRef = adminDb.collection('users').doc(uid);
    const existing = await userDocRef.get();

    if (existing.exists) {
        return { success: true };
    }

    await userDocRef.set({
        email,
        name: email.split('@')[0] || 'User',
        // 'preview' and 'subscription' intentionally NOT set
    });

    return { success: true };
}
```

Note: this version takes `uid` directly from Firebase Auth (the user just created it in the same request), so token verification is not strictly necessary here — the `uid` comes from `userCredential.user.uid` which is already authenticated. For extra hardening, apply the pattern from H2 which passes a `firebaseToken` instead.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "create-user-profile"
```

Expected: no errors.

---

### Task 2: Update `signup/page.tsx`

**Files:**
- Modify: `src/app/signup/page.tsx`

- [ ] **Step 1: Add import**

```ts
import { createUserProfile } from '@/app/actions/create-user-profile';
```

- [ ] **Step 2: Replace the `setDoc` block**

Find:
```ts
// Create a user document in Firestore
await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    name: user.email?.split('@')[0] || 'User',
});
```

Replace with:
```ts
await createUserProfile({ uid: user.uid, email: user.email ?? '' });
```

- [ ] **Step 3: Remove unused imports**

Check if `doc`, `setDoc`, and `db` are still used elsewhere in the file. If not, remove:
```ts
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "signup"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/create-user-profile.ts src/app/signup/page.tsx
git commit -m "security(M7): create user profile via server action instead of direct client setDoc"
```

---

### Verification

- [ ] Run `npm run dev`
- [ ] Sign up with a new test email — lands on `/survey`
- [ ] Open Firestore console → `users` collection → new document has `email` and `name` only — no `preview`, no `subscription`
