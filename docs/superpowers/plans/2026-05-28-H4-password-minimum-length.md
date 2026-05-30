# H4 — Password Minimum Length

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce a minimum password length of 6 characters client-side before calling Firebase Auth, so the user sees a clear, immediate error message instead of Firebase's generic SDK error.

**Architecture:** Add a simple length check in the `handleSignup` function before calling `createUserWithEmailAndPassword`. No new libraries needed.

---

## File Map

| File | Change |
|---|---|
| `src/app/signup/page.tsx` | Add password length validation before Firebase call |

---

### Task 1: Add password length check

**Files:**
- Modify: `src/app/signup/page.tsx`

- [ ] **Step 1: Add the check inside `handleSignup`, before the Firebase call**

Find the existing confirm-password check:
```ts
if (password !== confirmPassword) {
    toast({ ... });
    return;
}
```

Add this block immediately after it:
```ts
if (password.length < 6) {
    toast({
        title: "Signup Failed",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
    });
    return;
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "signup"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/signup/page.tsx
git commit -m "security(H4): enforce minimum 6-character password on signup"
```

---

### Verification

- [ ] Run `npm run dev`
- [ ] Go to `/signup`, enter a 3-character password and try to submit — toast appears: "Password must be at least 6 characters."
- [ ] Enter a 6-character password — form submits to Firebase normally
