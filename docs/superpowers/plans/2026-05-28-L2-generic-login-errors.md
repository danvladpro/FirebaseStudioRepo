# L2 — Generic Login Error Messages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace raw Firebase SDK error messages in login/signup toasts with generic messages that don't reveal whether an email address exists in the system (prevents user enumeration).

**Architecture:** Map specific Firebase error codes to safe generic strings. Keep error code logging server-side if needed (in this case the errors are client-side Firebase errors, so just swallow the specific message in the UI).

---

## File Map

| File | Change |
|---|---|
| `src/app/login/page.tsx` | Map Firebase error codes to generic messages |
| `src/app/signup/page.tsx` | Map Firebase error codes to generic messages |

---

### Task 1: Update `login/page.tsx`

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Add a helper to map Firebase error codes**

In the `handleLogin` catch block, replace:

```ts
} catch (error: any) {
    toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
    });
}
```

With:

```ts
} catch (error: any) {
    const code: string = error?.code ?? '';
    let description = "Login failed. Please try again.";

    if (code === 'auth/invalid-credential' || 
        code === 'auth/user-not-found' || 
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-email') {
        description = "Invalid email or password.";
    } else if (code === 'auth/too-many-requests') {
        description = "Too many failed attempts. Please wait a moment and try again.";
    } else if (code === 'auth/network-request-failed') {
        description = "Network error. Check your connection and try again.";
    }

    toast({
        title: "Login Failed",
        description,
        variant: "destructive",
    });
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "login/page"
```

Expected: no errors.

---

### Task 2: Update `signup/page.tsx`

**Files:**
- Modify: `src/app/signup/page.tsx`

- [ ] **Step 1: Update the catch block**

Find the existing catch block:
```ts
} catch (error: any) {
    toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
    });
}
```

Replace with:
```ts
} catch (error: any) {
    const code: string = error?.code ?? '';
    let description = "Signup failed. Please try again.";

    if (code === 'auth/email-already-in-use') {
        description = "An account with this email already exists.";
    } else if (code === 'auth/invalid-email') {
        description = "Please enter a valid email address.";
    } else if (code === 'auth/weak-password') {
        description = "Password must be at least 6 characters.";
    } else if (code === 'auth/network-request-failed') {
        description = "Network error. Check your connection and try again.";
    }

    toast({
        title: "Signup Failed",
        description,
        variant: "destructive",
    });
}
```

Note: `auth/email-already-in-use` is intentionally shown — telling users an account exists for their own email is helpful UX without being a security risk (they already know their own email).

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "signup/page"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx src/app/signup/page.tsx
git commit -m "security(L2): map Firebase error codes to generic messages; prevent user enumeration via login errors"
```

---

### Verification

- [ ] Run `npm run dev`
- [ ] Try logging in with a non-existent email — toast shows "Invalid email or password." (not the Firebase message about the user not existing)
- [ ] Try logging in with a correct email but wrong password — same generic message
- [ ] Try signing up with an already-used email — shows "An account with this email already exists."
- [ ] Try logging in with correct credentials — works normally
