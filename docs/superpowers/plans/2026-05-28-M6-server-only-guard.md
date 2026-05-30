# M6 — server-only Guard on firebase-admin

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `import 'server-only'` to `firebase-admin.ts` so Next.js throws a build-time error if it is ever accidentally imported in a client component.

**Note:** If you applied the C2 plan, this is already done — `firebase-admin.ts` already has `import 'server-only'` at the top. Only follow this plan if you are NOT applying C2.

---

## File Map

| File | Change |
|---|---|
| `src/lib/firebase-admin.ts` | Add `import 'server-only'` at top |
| `package.json` | Add `server-only` dependency |

---

### Task 1: Install `server-only`

- [ ] **Step 1: Install**

```bash
npm install server-only
```

- [ ] **Step 2: Confirm**

```bash
node -e "require('server-only'); console.log('ok')"
```

Expected: `ok`

---

### Task 2: Add the import

**Files:**
- Modify: `src/lib/firebase-admin.ts`

- [ ] **Step 1: Add as first line of the file**

```ts
import 'server-only';
import admin from 'firebase-admin';
// ... rest unchanged
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "firebase-admin"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/firebase-admin.ts package.json package-lock.json
git commit -m "security(M6): add server-only guard to firebase-admin.ts"
```

---

### Verification

- [ ] Create a temporary test file `src/components/test-import.tsx` with `"use client"; import { adminDb } from '@/lib/firebase-admin';` and run `npm run build` — expect a build error about `server-only` in a client component. Delete the file afterward.
