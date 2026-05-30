# C3 — Firestore Security Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `firestore.rules` file to the repo and deploy it so the Firestore database has explicit, version-controlled security rules instead of relying on console-only settings.

**Architecture:** Rules follow deny-by-default. Authenticated users can only read/write their own `users/{uid}` document. The `preview` field is write-protected (only writable via Admin SDK which bypasses rules). `supportTickets` collection is create-only for authenticated users, never readable by clients. All other paths are denied.

**Tech Stack:** Firebase CLI (`firebase-tools`), Firestore Security Rules v2.

**Note:** Deploying rules requires the Firebase CLI to be authenticated. The rules file itself can be committed without deploying — deployment is a separate step done from a terminal with `firebase deploy --only firestore:rules`.

---

## File Map

| File | Change |
|---|---|
| `firestore.rules` | Create (new file at repo root) |
| `firebase.json` | Create (new file at repo root) |

---

### Task 1: Create `firestore.rules`

**Files:**
- Create: `firestore.rules` (at repo root, next to `package.json`)

- [ ] **Step 1: Create the file**

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read and write their own document only.
    // The 'preview' (admin) field is NOT writable by the client:
    // any write that tries to change 'preview' is rejected.
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;

      allow create: if request.auth != null
        && request.auth.uid == userId
        && !('preview' in request.resource.data)
        && !('subscription' in request.resource.data);

      allow update: if request.auth != null
        && request.auth.uid == userId
        && !('preview' in request.resource.data.diff(resource.data).affectedKeys())
        && !('subscription' in request.resource.data.diff(resource.data).affectedKeys())
        && !('masteryCertificateId' in request.resource.data.diff(resource.data).affectedKeys());
    }

    // Support tickets: authenticated users can create only.
    // Reading/updating tickets is admin-only (via Admin SDK, which bypasses rules).
    match /supportTickets/{ticketId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false;
    }

    // Deny everything else by default.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Step 2: Verify the file exists at the right location**

```bash
ls -la firestore.rules
```

Expected: file present at repo root.

---

### Task 2: Create `firebase.json`

**Files:**
- Create: `firebase.json` (at repo root)

Check if one already exists first:

```bash
cat firebase.json 2>/dev/null || echo "not found"
```

If it does not exist, create it:

- [ ] **Step 1: Create `firebase.json`**

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

- [ ] **Step 2: Create the empty indexes file** (Firebase CLI requires it)

```bash
echo '{"indexes": [], "fieldOverrides": []}' > firestore.indexes.json
```

---

### Task 3: Add rules files to `.gitignore` exclusion check

- [ ] **Step 1: Confirm rules are NOT in `.gitignore`**

```bash
grep "firestore.rules\|firebase.json\|firestore.indexes" .gitignore
```

Expected: no output (these files should be committed, not ignored). If they appear, remove those lines from `.gitignore`.

---

### Task 4: Deploy the rules

- [ ] **Step 1: Check Firebase CLI is installed**

```bash
firebase --version
```

If not installed: `npm install -g firebase-tools`

- [ ] **Step 2: Login (if not already)**

```bash
firebase login
```

- [ ] **Step 3: Deploy rules only**

```bash
firebase deploy --only firestore:rules --project studio-7892987648-351fe
```

Expected output: `✔  Deploy complete!`

- [ ] **Step 4: Verify in Firebase console**

Open Firebase Console → Firestore → Rules. Confirm the deployed rules match what's in `firestore.rules`.

---

### Task 5: Commit

- [ ] **Step 1: Commit the rules files**

```bash
git add firestore.rules firebase.json firestore.indexes.json
git commit -m "security(C3): add Firestore security rules — deny-by-default, protect preview/subscription fields"
```

---

### Verification

- [ ] Run dev server: `npm run dev`
- [ ] Sign up as a new user — Firestore user doc creation should succeed (create is allowed for own uid)
- [ ] Update profile name on dashboard — should succeed (update is allowed for own uid, name field)
- [ ] Open browser DevTools → Console → try this in the console while logged in:
  ```js
  import { doc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';
  // This should be DENIED:
  await updateDoc(doc(window.__db, 'users', 'other-user-uid'), { name: 'hacked' });
  ```
  Expected: `FirebaseError: Missing or insufficient permissions`
- [ ] Also try setting `preview: true` on your own document:
  ```js
  await updateDoc(doc(window.__db, 'users', YOUR_UID), { preview: true });
  ```
  Expected: `FirebaseError: Missing or insufficient permissions`

**Note on L1:** With these rules deployed, the Firebase `apiKey` being public in `NEXT_PUBLIC_FIREBASE_API_KEY` is safe — the key alone cannot be used to read or write data without passing the security rules.
