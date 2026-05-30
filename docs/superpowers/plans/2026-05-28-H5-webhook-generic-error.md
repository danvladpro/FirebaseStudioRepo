# H5 — Webhook Generic Error Response

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop returning the raw Stripe exception message in the webhook HTTP response body. Internal error details should only appear in server logs.

**Architecture:** One-line change — replace the interpolated error message with a static string. The detailed message is already logged via `console.error` so nothing is lost for debugging.

---

## File Map

| File | Change |
|---|---|
| `src/app/api/stripe/webhook/route.ts` | Return generic error message on signature failure |

---

### Task 1: Replace the error response

**Files:**
- Modify: `src/app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Find and replace line 26**

Find:
```ts
return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
```

Replace with:
```ts
return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
```

The `console.error` on the line above already logs the full message server-side — do not remove it.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "webhook"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stripe/webhook/route.ts
git commit -m "security(H5): return generic error message from webhook endpoint; avoid leaking internal details"
```

---

### Verification

- [ ] Run `npm run dev`
- [ ] Send a malformed POST to the webhook endpoint:
  ```bash
  curl -X POST http://localhost:9002/api/stripe/webhook \
    -H "Content-Type: application/json" \
    -d '{"bad": "payload"}'
  ```
  Expected response body: `{"error":"Invalid webhook payload"}`
  Expected server log: the actual Stripe error message is printed there
