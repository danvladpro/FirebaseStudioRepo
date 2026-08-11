'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { resolveSignUpMethod } from '@/lib/sign-up-method';

/**
 * Backfills `signUpMethod` onto profiles created before the field existed.
 *
 * The client never gets to say how it signed up: it only proves *who* it is
 * (via its ID token), and the provider list is then read off the authoritative
 * Admin SDK auth record. Firestore rules forbid clients writing the field.
 *
 * Safe to call repeatedly — it no-ops once the field is present.
 */
export async function syncSignUpMethod(firebaseToken: string) {
    let uid: string;
    try {
        const decoded = await adminAuth.verifyIdToken(firebaseToken);
        uid = decoded.uid;
    } catch {
        throw new Error('Unauthorized');
    }

    const userDocRef = adminDb.collection('users').doc(uid);
    const snapshot = await userDocRef.get();

    if (!snapshot.exists) {
        // Profile hasn't been created yet — createUserProfile sets the field
        // itself, so there is nothing to backfill.
        return { success: true, signUpMethod: null };
    }

    const existing = snapshot.data()?.signUpMethod;
    if (existing === 'email' || existing === 'google') {
        return { success: true, signUpMethod: existing };
    }

    const authUser = await adminAuth.getUser(uid);
    const signUpMethod = resolveSignUpMethod(authUser);
    await userDocRef.update({ signUpMethod });

    return { success: true, signUpMethod };
}
