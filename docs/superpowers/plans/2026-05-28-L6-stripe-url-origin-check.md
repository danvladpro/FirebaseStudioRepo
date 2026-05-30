# L6 — Stripe URL Origin Check

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate that the Stripe checkout URL from the server action is a legitimate `checkout.stripe.com` URL before redirecting the browser.

**Note:** If you applied the C1 plan, `premium-modal.tsx` already includes this check. Only follow this plan if NOT applying C1.

---

## File Map

| File | Change |
|---|---|
| `src/components/premium-modal.tsx` | Add origin check before `window.location.href` redirect |

---

### Task 1: Add the origin check

**Files:**
- Modify: `src/components/premium-modal.tsx`

- [ ] **Step 1: Find the redirect line**

```bash
grep -n "window.location.href" src/components/premium-modal.tsx
```

- [ ] **Step 2: Replace the redirect with a validated redirect**

Find:
```ts
if (!result.url) {
    throw new Error("Could not create a checkout session URL.");
}

// Redirect to the checkout URL provided by the server
window.location.href = result.url;
```

Replace with:
```ts
if (!result.url) {
    throw new Error("Could not create a checkout session URL.");
}

if (!result.url.startsWith('https://checkout.stripe.com')) {
    throw new Error("Unexpected redirect URL.");
}

window.location.href = result.url;
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "premium-modal"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/premium-modal.tsx
git commit -m "security(L6): validate Stripe checkout URL origin before redirecting"
```

---

### Verification

- [ ] Run `npm run dev`
- [ ] Open Premium modal and click Upgrade — Stripe checkout opens normally
- [ ] The check only matters if the server action is ever compromised — no visible UX change in normal flow
