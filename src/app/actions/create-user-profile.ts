'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { resolveSignUpMethod } from '@/lib/sign-up-method';

/**
 * Creates the Firestore profile document for a freshly signed-up user.
 *
 * Used by BOTH sign-up paths:
 *  - email/password (`/signup`) — the auth record has no displayName.
 *  - Google popup (`/login` and `/signup`) — `signInWithPopup` never creates a
 *    profile document by itself, so the Google button calls this too. Google
 *    accounts arrive with a displayName and a photoURL.
 *
 * Detection of "first-time user" is a plain existence check on the document
 * rather than `getAdditionalUserInfo(...)?.isNewUser`, so a sign-in that was
 * interrupted between the popup closing and the write landing self-heals the
 * next time the user signs in. It is safe to call on every sign-in.
 *
 * Every field that matters is read from the Admin SDK auth record, never from
 * a client-supplied value — in particular `signUpMethod`, which the Firestore
 * rules forbid clients from writing at all.
 */
export async function createUserProfile(firebaseToken: string, email: string) {
    let uid: string;
    try {
        const decoded = await adminAuth.verifyIdToken(firebaseToken);
        uid = decoded.uid;
    } catch {
        throw new Error('Unauthorized');
    }

    const userDocRef = adminDb.collection('users').doc(uid);
    const existing = await userDocRef.get();

    if (existing.exists) {
        return { success: true, created: false };
    }

    // Authoritative account data. The `email` argument is only a fallback for
    // the (impossible in practice) case of an auth record without an email.
    const authUser = await adminAuth.getUser(uid);
    const resolvedEmail = authUser.email ?? email;
    const displayName = authUser.displayName?.trim();

    await userDocRef.set({
        email: resolvedEmail,
        name: displayName || resolvedEmail.split('@')[0] || 'User',
        // Read off the auth record's linked providers, never from the client.
        signUpMethod: resolveSignUpMethod(authUser),
        photoURL: authUser.photoURL ?? null,
    }, { merge: true });

    return { success: true, created: true };
}
