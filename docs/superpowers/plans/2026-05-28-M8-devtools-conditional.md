# M8 — devtools Conditional

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Only enable Next.js devtools overlay in development, not in production.

---

## File Map

| File | Change |
|---|---|
| `next.config.ts` | Make `devtools` conditional on `NODE_ENV` |

---

### Task 1: Update `next.config.ts`

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Make devtools conditional**

Find:
```ts
devtools: true,
```

Replace with:
```ts
devtools: process.env.NODE_ENV === 'development',
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "next.config"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "security(M8): only enable Next.js devtools in development environment"
```

---

### Verification

- [ ] Run `npm run dev` — devtools overlay should still appear in development
- [ ] Run `NODE_ENV=production npm run build && NODE_ENV=production npm run start` — devtools overlay should NOT appear
