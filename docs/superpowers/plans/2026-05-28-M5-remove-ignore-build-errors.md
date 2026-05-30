# M5 — Remove ignoreBuildErrors Flags

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` from `next.config.ts` so TypeScript and ESLint errors are caught during production builds. Fix the 4 pre-existing type errors first so the build is clean.

**Architecture:** Fix the known pre-existing errors one by one, then remove the escape-hatch flags. Pre-existing errors are in `drill-ui.tsx`, `drills/[id]/page.tsx`, `drill-page.tsx`, and `scroll-animation.tsx`.

---

## File Map

| File | Change |
|---|---|
| `src/components/drill-ui.tsx` | Fix `Icon` JSX type error |
| `src/app/drills/[id]/page.tsx` | Fix `selection` possibly-undefined error |
| `src/components/drill-page.tsx` | Fix `selection` possibly-undefined error (same pattern) |
| `src/components/scroll-animation.tsx` | Fix `EffectCallback` return type error |
| `next.config.ts` | Remove `ignoreBuildErrors` and `ignoreDuringBuilds` |

---

### Task 1: Fix `drill-ui.tsx` — Icon type error

**Files:**
- Modify: `src/components/drill-ui.tsx`

The error is on line 444: `'Icon' cannot be used as a JSX component`. This happens when `icons[step.iconName]` is typed as `LucideIcon | undefined` or `any` without the right component type.

- [ ] **Step 1: Find the icons import and Icon variable**

```bash
grep -n "import \* as icons\|const Icon" src/components/drill-ui.tsx | head -10
```

- [ ] **Step 2: Add explicit type cast**

Find the line (around line 402):
```ts
const Icon = icons[step.iconName];
```

Replace with:
```ts
const Icon = icons[step.iconName as keyof typeof icons] as React.ElementType | undefined;
```

This tells TypeScript `Icon` is a valid React component type (or undefined), which the `{Icon && <Icon .../>}` usage already handles safely.

- [ ] **Step 3: Verify error is gone**

```bash
npx tsc --noEmit 2>&1 | grep "drill-ui"
```

Expected: no errors for this file.

---

### Task 2: Fix `drills/[id]/page.tsx` and `drill-page.tsx` — selection undefined error

**Files:**
- Modify: `src/app/drills/[id]/page.tsx` (line ~132)
- Modify: `src/components/drill-page.tsx` (line ~126)

The error is: `selection` in the optional chained expression `initialDisplayGridState?.sheets[...]?.selection` can be `undefined` but `getSelectionRangeString` requires a non-undefined `Sheet['selection']`.

- [ ] **Step 1: Fix in `drills/[id]/page.tsx`**

Find the line (around 132):
```ts
range={getSelectionRangeString(initialDisplayGridState?.sheets[initialDisplayGridState.activeSheetIndex]?.selection)}
```

Replace with:
```ts
range={getSelectionRangeString(
    initialDisplayGridState?.sheets[initialDisplayGridState.activeSheetIndex]?.selection ?? 
    { activeCell: { row: 0, col: 0 }, anchorCell: { row: 0, col: 0 } }
)}
```

- [ ] **Step 2: Fix in `drill-page.tsx`** (same pattern, same fix)

```bash
grep -n "getSelectionRangeString" src/components/drill-page.tsx
```

Apply the same null-coalescing fallback to that line.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit 2>&1 | grep "drills/\[id\]\|drill-page"
```

Expected: no errors.

---

### Task 3: Fix `scroll-animation.tsx` — EffectCallback return type

**Files:**
- Modify: `src/components/scroll-animation.tsx`

The error is on line 16: the `useEffect` callback returns `() => void | null` but `EffectCallback` requires `void | Destructor`.

- [ ] **Step 1: Find the return statement**

```bash
sed -n '33,37p' src/components/scroll-animation.tsx
```

- [ ] **Step 2: Fix the return type**

Find:
```ts
return () => el && observer.unobserve(el);
```

Replace with:
```ts
return () => { if (el) observer.unobserve(el); };
```

The original `el && observer.unobserve(el)` returns `void | false` when `el` is null — a valid value but TypeScript's `EffectCallback` type is strict about the cleanup function signature. The explicit block form avoids the issue.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit 2>&1 | grep "scroll-animation"
```

Expected: no errors.

---

### Task 4: Remove the escape-hatch flags from `next.config.ts`

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Run typecheck to confirm zero errors**

```bash
npm run typecheck 2>&1 | grep "error TS"
```

Expected: no output. All errors must be gone before removing the flags.

- [ ] **Step 2: Remove the flags**

Find and delete these lines in `next.config.ts`:
```ts
typescript: {
    ignoreBuildErrors: true,
},
eslint: {
    ignoreDuringBuilds: true,
},
```

- [ ] **Step 3: Run build to confirm it passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: build completes with no type or lint errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/drill-ui.tsx src/app/drills/\[id\]/page.tsx src/components/drill-page.tsx src/components/scroll-animation.tsx next.config.ts
git commit -m "fix(M5): resolve pre-existing TS errors; remove ignoreBuildErrors and ignoreDuringBuilds flags"
```

---

### Verification

- [ ] `npm run build` passes with no errors
- [ ] `npm run typecheck` outputs nothing
- [ ] `npm run dev` — drill pages still render correctly, scroll animations still work
