
'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { z } from 'zod';

const UpdateUserProfileSchema = z.object({
    firebaseToken: z.string(),
    name: z.string().min(1, "Name cannot be empty.").max(100),
    missingKeys: z.array(z.string()).optional(),
});

export async function updateUserProfile(input: z.infer<typeof UpdateUserProfileSchema>) {
    const validation = UpdateUserProfileSchema.safeParse(input);

    if (!validation.success) {
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }

    const { firebaseToken, name, missingKeys } = validation.data;

    let uid: string;
    try {
        const decoded = await adminAuth.verifyIdToken(firebaseToken);
        uid = decoded.uid;
    } catch {
        throw new Error("Authentication failed. Please log in again.");
    }

    try {
        const userDocRef = adminDb.collection('users').doc(uid);

        const dataToUpdate: { name: string; missingKeys?: string[] } = { name };
        if (missingKeys !== undefined) {
            dataToUpdate.missingKeys = missingKeys;
        }

        await userDocRef.update(dataToUpdate);

        return { success: true };
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw new Error("Could not update your profile. Please try again.");
    }
}
