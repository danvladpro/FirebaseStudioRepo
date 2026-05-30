'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';

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
        return { success: true };
    }

    await userDocRef.set({
        email,
        name: email.split('@')[0] || 'User',
        emailVerified: false,
    });

    return { success: true };
}
