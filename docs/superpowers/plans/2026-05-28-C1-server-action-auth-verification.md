# C1 — Server Action Auth Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure every server action verifies the caller's Firebase identity before touching Firestore, so no user can write to another user's data.

**Architecture:** Each server action will accept a `firebaseToken` string argument from the client. The server calls `adminAuth.verifyIdToken(firebaseToken)` to get the authoritative UID — the caller-supplied `uid` is then removed from the schema entirely. Client components get the token via `auth.currentUser.getIdToken()` and pass it alongside the action payload.

**Tech Stack:** `firebase-admin/auth`, `next/headers` pattern not used (server actions don't receive custom headers from RPC calls), Firebase Client SDK `getIdToken()`.

**Depends on:** C2 plan must be applied first (it exports `adminAuth`).

---

## File Map

| File | Change |
|---|---|
| `src/lib/firebase-admin.ts` | Export `adminAuth` (done in C2 plan) |
| `src/app/actions/update-user-profile.ts` | Remove `uid` from schema, add `firebaseToken`, verify |
| `src/app/actions/update-user-performance.ts` | Remove `uid` from schema, add `firebaseToken`, verify |
| `src/app/actions/submit-support-ticket.ts` | Remove `uid` from schema, add `firebaseToken`, verify |
| `src/ai/flows/create-checkout-session.ts` | Remove `userId` from schema, add `firebaseToken`, verify |
| `src/components/premium-modal.tsx` | Pass `firebaseToken` instead of `userId` |
| Any component calling the other 3 actions | Pass `firebaseToken` instead of `uid` |

---

### Task 1: Audit all callers of the three server actions

**Files:**
- Read: `src/components/` — grep for `updateUserProfile`, `updateUserPerformance`, `submitSupportTicket`

- [ ] **Step 1: Find all call sites**

```bash
grep -rn "updateUserProfile\|updateUserPerformance\|submitSupportTicket" src/ --include="*.tsx" --include="*.ts"
```

Note every file + line number. You will update each caller in later tasks.

- [ ] **Step 2: Find create-checkout-session caller**

```bash
grep -rn "createCheckoutSession" src/ --include="*.tsx" --include="*.ts"
```

Expected: `src/components/premium-modal.tsx`.

---

### Task 2: Update `update-user-profile.ts`

**Files:**
- Modify: `src/app/actions/update-user-profile.ts`

- [ ] **Step 1: Replace the entire file**

```ts
'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { z } from 'zod';

const UpdateUserProfileSchema = z.object({
    firebaseToken: z.string().min(1),
    name: z.string().min(1, "Name cannot be empty."),
    missingKeys: z.array(z.string()).optional(),
});

export async function updateUserProfile(input: z.infer<typeof UpdateUserProfileSchema>) {
    const validation = UpdateUserProfileSchema.safeParse(input);

    if (!validation.success) {
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }

    const { firebaseToken, name, missingKeys } = validation.data;

    let uid: string;
    try {
        const decoded = await adminAuth.verifyIdToken(firebaseToken);
        uid = decoded.uid;
    } catch {
        throw new Error('Unauthorized');
    }

    try {
        const userDocRef = adminDb.collection('users').doc(uid);
        
        const dataToUpdate: { name: string; missingKeys?: string[] } = { name };
        if (missingKeys !== undefined) {
            dataToUpdate.missingKeys = missingKeys;
        }
        
        await userDocRef.update(dataToUpdate);
        return { success: true };
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw new Error("Could not update your profile. Please try again.");
    }
}
```

- [ ] **Step 2: Typecheck this file**

```bash
npx tsc --noEmit 2>&1 | grep "update-user-profile"
```

Expected: no errors for this file.

---

### Task 3: Update `update-user-performance.ts`

**Files:**
- Modify: `src/app/actions/update-user-performance.ts`

- [ ] **Step 1: Replace the entire file**

```ts
'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { PerformanceRecord } from '@/lib/types';
import { z } from 'zod';
import { CHALLENGE_SETS } from '@/lib/challenges';
import { DRILL_SET } from '@/lib/drills';

const UpdateUserPerformanceSchema = z.object({
    firebaseToken: z.string().min(1),
    setId: z.string(),
    time: z.number(),
    score: z.number().min(0).max(100),
});

const generateCertificateId = () => {
    return `cert-${crypto.randomUUID()}-${new Date().getTime()}`;
};

export async function updateUserPerformance(input: z.infer<typeof UpdateUserPerformanceSchema>) {
    const validation = UpdateUserPerformanceSchema.safeParse(input);

    if (!validation.success) {
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }

    const { firebaseToken, setId, time, score } = validation.data;

    let uid: string;
    try {
        const decoded = await adminAuth.verifyIdToken(firebaseToken);
        uid = decoded.uid;
    } catch {
        throw new Error('Unauthorized');
    }

    const userDocRef = adminDb.collection('users').doc(uid);

    try {
        let isNewBest = false;
        
        await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userDocRef);

            if (!userDoc.exists) {
                throw new Error("User document does not exist.");
            }

            const userData = userDoc.data();
            const currentPerformance = userData?.performance?.[setId] as PerformanceRecord | undefined;
            
            const newBestScore = Math.max(currentPerformance?.bestScore ?? 0, score);

            let newBestTime = currentPerformance?.bestTime ?? null;
            if (score === 100) {
                if (newBestTime === null || time < newBestTime) {
                    newBestTime = time;
                    isNewBest = true;
                }
            }
            
            const newPerformanceRecord: PerformanceRecord = {
                bestTime: newBestTime,
                bestScore: newBestScore,
                lastTrained: new Date().toISOString(),
            };

            transaction.update(userDocRef, {
                [`performance.${setId}`]: newPerformanceRecord
            });
            
            const updatedPerformance = { ...userData?.performance, [setId]: newPerformanceRecord };
                
            const allChallengeIds = CHALLENGE_SETS.map(c => c.id);
            const allDrillIds = DRILL_SET.drills.map(d => d.id);
            const allRequiredIds = [...allChallengeIds, ...allDrillIds];

            const allItemsPassed = allRequiredIds.every(id => {
                return updatedPerformance[id]?.bestScore === 100;
            });

            if (allItemsPassed && !userData?.masteryCertificateId) {
                const certificateId = generateCertificateId();
                transaction.update(userDocRef, {
                    masteryCertificateId: certificateId
                });
            }
        });
        
        return { success: true, newBest: isNewBest };

    } catch (error) {
        console.error("Error updating user performance:", error);
        throw new Error("Could not save your results. Please try again.");
    }
}
```

Note: `generateCertificateId` now uses `crypto.randomUUID()` — this also resolves **L4** (certificate ID no longer embeds the user's UID).

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "update-user-performance"
```

Expected: no errors for this file.

---

### Task 4: Update `submit-support-ticket.ts`

**Files:**
- Modify: `src/app/actions/submit-support-ticket.ts`

- [ ] **Step 1: Replace the entire file**

```ts
'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';

const SubmitSupportTicketSchema = z.object({
    firebaseToken: z.string().min(1),
    email: z.string().email(),
    category: z.string().min(1).max(100),
    topic: z.string().min(1).max(200),
    body: z.string().min(1).max(5000),
});

export async function submitSupportTicket(input: z.infer<typeof SubmitSupportTicketSchema>) {
    const validation = SubmitSupportTicketSchema.safeParse(input);

    if (!validation.success) {
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }

    const { firebaseToken, email, category, topic, body } = validation.data;

    let uid: string;
    try {
        const decoded = await adminAuth.verifyIdToken(firebaseToken);
        uid = decoded.uid;
    } catch {
        throw new Error('Unauthorized');
    }

    try {
        const ticketRef = adminDb.collection('supportTickets').doc();
        
        await ticketRef.set({
            uid,
            email,
            category,
            topic,
            body,
            status: 'open',
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { success: true, ticketId: ticketRef.id };
    } catch (error) {
        console.error("Error submitting support ticket:", error);
        throw new Error("Could not submit your support ticket. Please try again.");
    }
}
```

Note: max lengths also resolve **M2** for this action.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "submit-support-ticket"
```

Expected: no errors for this file.

---

### Task 5: Update `create-checkout-session.ts`

**Files:**
- Modify: `src/ai/flows/create-checkout-session.ts`

- [ ] **Step 1: Replace schema and implementation**

Remove `userId` and `userEmail` from the input schema. Get them from the verified token instead.

```ts
'use server';

import { z } from 'zod';
import Stripe from 'stripe';
import { adminAuth } from '@/lib/firebase-admin';

const CreateCheckoutSessionInputSchema = z.object({
  firebaseToken: z.string().min(1),
  plan: z.enum(['one-week', 'lifetime']),
});

export type CreateCheckoutSessionInput = z.infer<
  typeof CreateCheckoutSessionInputSchema
>;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-05-19.basil',
});

const STRIPE_PRICES: Record<string, string> = {
  'one-week': process.env.STRIPE_ONE_WEEK_PRICE_ID || '',
  'lifetime': process.env.STRIPE_LIFETIME_PRICE_ID || '',
};

export async function createCheckoutSession(input: CreateCheckoutSessionInput) {
  try {
    const validatedInput = CreateCheckoutSessionInputSchema.safeParse(input);

    if (!validatedInput.success) {
      throw new Error('Invalid input for creating checkout session.');
    }

    const { firebaseToken, plan } = validatedInput.data;

    let userId: string;
    let userEmail: string | undefined;
    try {
      const decoded = await adminAuth.verifyIdToken(firebaseToken);
      userId = decoded.uid;
      userEmail = decoded.email;
    } catch {
      throw new Error('Unauthorized');
    }

    const priceId = STRIPE_PRICES[plan];
    if (!priceId) {
      throw new Error(`Stripe price ID for plan "${plan}" is not configured.`);
    }

    const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    let customer;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customer = customers.data[0];
      }
    }
    if (!customer) {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { firebaseUID: userId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card', 'ideal'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/checkout/cancel`,
      metadata: {
        firebaseUID: userId,
        plan: plan,
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error: any) {
    console.error("Error creating checkout session:", error.message);
    return { error: error.message };
  }
}
```

Note: the Stripe API version string `2025-09-30.clover` was a future/beta version. Replace it with the latest stable version supported by your installed `stripe` package. Run `node -e "const s=require('stripe'); console.log(Object.keys(s.LATEST_API_VERSION||{}))"` or check `node_modules/stripe/types/index.d.ts` for the `ApiVersion` type to find the correct string. A safe default is `'2025-05-19.basil'` — adjust if your `stripe@16` exports a different constant.

Also: this removes `NEXT_PUBLIC_` from the Stripe price env vars — resolving **H1**. Update your `.env.local`:
```
# Rename these two env vars (remove NEXT_PUBLIC_ prefix):
STRIPE_ONE_WEEK_PRICE_ID=price_xxx
STRIPE_LIFETIME_PRICE_ID=price_yyy
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "create-checkout-session"
```

Expected: no errors for this file.

---

### Task 6: Update `premium-modal.tsx` caller

**Files:**
- Modify: `src/components/premium-modal.tsx`

- [ ] **Step 1: Get Firebase token before calling the action**

Replace the `handleCheckout` function body:

```ts
const handleCheckout = async () => {
    if (!user) {
        toast({
            title: "Authentication Error",
            description: "You must be logged in to make a purchase.",
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);

    try {
        const firebaseToken = await user.getIdToken();

        const result = await createCheckoutSession({
            firebaseToken,
            plan: selectedPlan,
        });

        if (result.error) {
            throw new Error(result.error);
        }

        if (!result.url) {
            throw new Error("Could not create a checkout session URL.");
        }

        if (!result.url.startsWith('https://checkout.stripe.com')) {
            throw new Error("Unexpected redirect URL.");
        }

        window.location.href = result.url;

    } catch (error: any) {
        toast({
            title: "Checkout Error",
            description: error.message || "An unexpected error occurred. Please try again.",
            variant: "destructive",
        });
        setIsLoading(false);
    }
};
```

Note: the `result.url.startsWith('https://checkout.stripe.com')` check also resolves **L6**.

Also remove the now-unused `STRIPE_PRICES` import:
```ts
// DELETE this line:
import { STRIPE_PRICES } from "@/lib/stripe-prices";
```

And remove the now-unused `priceId` logic:
```ts
// DELETE these lines:
const priceId = selectedPlan === 'one-week' 
    ? STRIPE_PRICES.oneWeek 
    : STRIPE_PRICES.lifetime;

if (!priceId) {
    throw new Error("Stripe price ID is not configured.");
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "premium-modal"
```

Expected: no errors.

---

### Task 7: Update all other callers found in Task 1

**Files:**
- Modify: each component that calls `updateUserProfile`, `updateUserPerformance`, or `submitSupportTicket`

- [ ] **Step 1: For each caller, add token retrieval**

The pattern is the same in every caller. Find the component that has `const { user } = useAuth()` and already calls the action with a `uid`. Change it to:

```ts
// Before calling the action:
const firebaseToken = await user.getIdToken();

// Pass firebaseToken instead of uid:
await updateUserProfile({ firebaseToken, name, missingKeys });
// or
await updateUserPerformance({ firebaseToken, setId, time, score });
// or  
await submitSupportTicket({ firebaseToken, email, category, topic, body });
```

The `uid` argument is removed from each call.

- [ ] **Step 2: Full typecheck**

```bash
npm run typecheck 2>&1 | grep -v "challenges/page\|drill-ui\|scroll-animation"
```

Expected: no new errors beyond the pre-existing ones in the three files listed.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/ src/ai/flows/create-checkout-session.ts src/components/premium-modal.tsx
git add $(git diff --name-only)  # any other modified callers
git commit -m "security(C1/H1/L4/L6): verify Firebase identity in all server actions; remove client-supplied uid/priceId"
```

---

### Verification

- [ ] Run dev server: `npm run dev`
- [ ] Sign in, open Premium modal, click Upgrade — Stripe checkout should open
- [ ] Complete a challenge — performance should save correctly
- [ ] Update profile name in settings — should save correctly
- [ ] Submit a support ticket — should succeed
- [ ] Open browser DevTools → Network → inspect the server action request body — confirm no `uid` field is sent
