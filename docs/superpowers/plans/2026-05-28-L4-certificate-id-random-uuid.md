# L4 — Certificate ID Random UUID

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the certificate ID format `{uid}-mastery-{timestamp}` with a random opaque UUID so user Firebase UIDs are not embedded in public certificate URLs.

**Note:** If you applied the C1 plan, `update-user-performance.ts` was already rewritten with `crypto.randomUUID()`. Only follow this plan if NOT applying C1.

**Impact:** Existing certificates will still verify correctly (the `masteryCertificateId` field on the user doc is the source of truth). New certificates will use the new format. The `verify` page parses the ID to extract a `userId` — this logic must also be updated.

---

## File Map

| File | Change |
|---|---|
| `src/app/actions/update-user-performance.ts` | Use `crypto.randomUUID()` for certificate IDs |
| `src/app/verify/page.tsx` | Update parsing logic (no longer rely on UID being in the cert ID) |

---

### Task 1: Update `update-user-performance.ts`

**Files:**
- Modify: `src/app/actions/update-user-performance.ts`

- [ ] **Step 1: Replace `generateCertificateId`**

Find:
```ts
const generateCertificateId = (uid: string) => {
    return `${uid}-mastery-${new Date().getTime()}`;
};
```

Replace with:
```ts
const generateCertificateId = () => {
    return `cert-${crypto.randomUUID()}`;
};
```

- [ ] **Step 2: Update the call site inside the transaction**

Find:
```ts
const certificateId = generateCertificateId(uid);
```

Replace with:
```ts
const certificateId = generateCertificateId();
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "update-user-performance"
```

Expected: no errors.

---

### Task 2: Update `verify/page.tsx`

**Files:**
- Modify: `src/app/verify/page.tsx`

The current parsing logic in `verifyCertificate` splits the cert ID on `-` and assumes `parts[0]` is the user's UID. This no longer holds for the new format.

The new approach: use Firestore to query for any user whose `masteryCertificateId` matches the given `id`. Since this is a public verification endpoint (no login required), keep the query as a simple Firestore lookup by iterating — or use a collectionGroup query.

The simplest approach given current schema: store the `userId` alongside the cert in a separate `certificates` collection. But that's a schema change.

**Simpler alternative (no schema change):** Do a collection query on `users` where `masteryCertificateId == id`. Firestore allows this with a `where` query.

- [ ] **Step 1: Replace `verifyCertificate` function**

```ts
async function verifyCertificate(id: string): Promise<VerificationResult> {
    if (!id || typeof id !== 'string' || id.length > 200) {
        return { status: 'error', message: 'Invalid certificate ID.' };
    }

    try {
        // Query for the user who has this certificate ID
        const snapshot = await adminDb
            .collection('users')
            .where('masteryCertificateId', '==', id)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return { status: 'invalid', message: 'This certificate is not valid or could not be found in our records.' };
        }

        const userData = snapshot.docs[0].data() as UserProfile;
        const timestamp = userData.masteryCertificateId?.split('-').pop();
        const date = timestamp && !isNaN(parseInt(timestamp))
            ? new Date(parseInt(timestamp)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        return {
            status: 'valid',
            userName: userData.name,
            date,
            message: 'This Certificate of Mastery is valid and has been successfully verified.',
        };

    } catch (err) {
        console.error("Verification error:", err);
        return { status: 'error', message: 'An error occurred during verification. Please try again later.' };
    }
}
```

Note: you will need to add a Firestore index on `users.masteryCertificateId` for this query to work at scale. Firebase will prompt you with a link to create it when the query first runs without an index — follow that link, or add it to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "masteryCertificateId", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "verify/page"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/update-user-performance.ts src/app/verify/page.tsx firestore.indexes.json
git commit -m "security(L4): use crypto.randomUUID() for certificate IDs; remove UID from public cert URLs; update verify query"
```

---

### Verification

- [ ] Run `npm run dev`
- [ ] Complete all challenges and drills to earn a certificate (or manually set `masteryCertificateId: "cert-<some-uuid>"` in Firestore console)
- [ ] Visit `/verify?id=cert-<that-uuid>` — shows "Certificate Verified" with the user's name
- [ ] Visit `/verify?id=fake-id` — shows "Verification Failed"
- [ ] Confirm the cert ID in the URL does not contain the user's UID
