# M2 — Support Ticket Max Length

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `max()` constraints to all support ticket fields to prevent oversized payloads from abusing Firestore storage.

**Note:** If you applied the C1 plan, `submit-support-ticket.ts` was already rewritten with max lengths (`category: max(100)`, `topic: max(200)`, `body: max(5000)`). Only follow this plan if you are NOT applying C1.

---

## File Map

| File | Change |
|---|---|
| `src/app/actions/submit-support-ticket.ts` | Add `.max()` to all string fields |

---

### Task 1: Add max length constraints

**Files:**
- Modify: `src/app/actions/submit-support-ticket.ts`

- [ ] **Step 1: Update the Zod schema**

Find:
```ts
const SubmitSupportTicketSchema = z.object({
    uid: z.string(),
    email: z.string().email(),
    category: z.string().min(1),
    topic: z.string().min(1),
    body: z.string().min(1),
});
```

Replace with:
```ts
const SubmitSupportTicketSchema = z.object({
    uid: z.string(),
    email: z.string().email().max(254),
    category: z.string().min(1).max(100),
    topic: z.string().min(1).max(200),
    body: z.string().min(1).max(5000),
});
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "submit-support-ticket"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/submit-support-ticket.ts
git commit -m "security(M2): add max length constraints to support ticket fields"
```

---

### Verification

- [ ] Run `npm run dev`
- [ ] Submit a support ticket with a normal message — should succeed
- [ ] In browser DevTools, call the server action with a 6000-character body — should return a Zod validation error
