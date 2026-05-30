# H1 — Stripe Price IDs Server-Side Only

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Stripe Price IDs from the client JS bundle and stop accepting `priceId` from the browser — the server resolves the price from the `plan` enum instead.

**Architecture:** `stripe-prices.ts` reads `STRIPE_*` env vars without `NEXT_PUBLIC_` prefix so they are never bundled. The `createCheckoutSession` server action drops `priceId` from its input schema and does the plan→price lookup server-side.

**Note:** If you applied the C1 plan, this is already done. The C1 plan rewrites `create-checkout-session.ts` to eliminate `priceId` from the input and removes the NEXT_PUBLIC_ prefix. **Only follow this plan if you are NOT applying C1.**

---

## File Map

| File | Change |
|---|---|
| `src/lib/stripe-prices.ts` | Remove `NEXT_PUBLIC_` prefix from env var names |
| `src/ai/flows/create-checkout-session.ts` | Remove `priceId` from input schema; resolve price server-side |
| `src/components/premium-modal.tsx` | Stop passing `priceId` to the server action |
| `.env.local` | Rename env vars (manual step) |

---

### Task 1: Rename env vars in `.env.local`

- [ ] **Step 1: Update `.env.local`**

In your `.env.local` file, rename:
```
# FROM:
NEXT_PUBLIC_STRIPE_ONE_WEEK_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID=price_yyy

# TO:
STRIPE_ONE_WEEK_PRICE_ID=price_xxx
STRIPE_LIFETIME_PRICE_ID=price_yyy
```

Do the same in your production environment (Vercel/Railway/etc.) env var settings.

---

### Task 2: Update `stripe-prices.ts`

**Files:**
- Modify: `src/lib/stripe-prices.ts`

- [ ] **Step 1: Replace entire file**

```ts
import 'server-only';

export const STRIPE_PRICES = {
    oneWeek: process.env.STRIPE_ONE_WEEK_PRICE_ID || '',
    lifetime: process.env.STRIPE_LIFETIME_PRICE_ID || '',
};
```

The `import 'server-only'` ensures this file cannot be accidentally imported in client components (requires `server-only` package — see C2 plan Task 2 for installation).

---

### Task 3: Update `create-checkout-session.ts`

**Files:**
- Modify: `src/ai/flows/create-checkout-session.ts`

- [ ] **Step 1: Remove `priceId` from input schema and resolve it server-side**

Replace the `CreateCheckoutSessionInputSchema` definition and the `line_items` construction:

```ts
// Old schema (remove priceId):
const CreateCheckoutSessionInputSchema = z.object({
  firebaseToken: z.string().min(1),   // or userId: z.string() if C1 not applied
  plan: z.enum(['one-week', 'lifetime']),
  // priceId: z.string(),  ← DELETE THIS
});

// Inside the function, replace:
// line_items: [{ price: priceId, quantity: 1 }],
// with:
import { STRIPE_PRICES } from '@/lib/stripe-prices';
const priceId = plan === 'one-week' ? STRIPE_PRICES.oneWeek : STRIPE_PRICES.lifetime;
if (!priceId) throw new Error(`Stripe price for plan "${plan}" is not configured.`);
// ...
line_items: [{ price: priceId, quantity: 1 }],
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "create-checkout-session\|stripe-prices"
```

Expected: no errors.

---

### Task 4: Update `premium-modal.tsx`

**Files:**
- Modify: `src/components/premium-modal.tsx`

- [ ] **Step 1: Remove priceId from the call**

Delete the `STRIPE_PRICES` import and `priceId` derivation. Pass only `plan`:

```ts
// DELETE:
import { STRIPE_PRICES } from "@/lib/stripe-prices";

// DELETE these lines in handleCheckout:
const priceId = selectedPlan === 'one-week'
    ? STRIPE_PRICES.oneWeek
    : STRIPE_PRICES.lifetime;
if (!priceId) {
    throw new Error("Stripe price ID is not configured.");
}

// UPDATE the action call to not pass priceId:
const result = await createCheckoutSession({
    // priceId: priceId,  ← DELETE
    userId: user.uid,      // keep (or firebaseToken if C1 applied)
    userEmail: user.email,
    plan: selectedPlan,
});
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "premium-modal"
```

Expected: no errors.

---

### Task 5: Commit

- [ ] **Step 1: Commit**

```bash
git add src/lib/stripe-prices.ts src/ai/flows/create-checkout-session.ts src/components/premium-modal.tsx
git commit -m "security(H1): remove Stripe price IDs from client bundle; resolve price server-side from plan enum"
```

---

### Verification

- [ ] Run `npm run dev`
- [ ] Open Premium modal → Upgrade — Stripe checkout page opens with the correct price
- [ ] Open browser DevTools → Sources → search for your price ID string (e.g. `price_`) in the JS bundle — it should NOT appear
