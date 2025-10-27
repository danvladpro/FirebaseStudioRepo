
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

const UpdateUserProfileSchema = z.object({
    uid: z.string(),
    name: z.string().min(1, "Name cannot be empty."),
});

export async function updateUserProfile(input: z.infer<typeof UpdateUserProfileSchema>) {
    const validation = UpdateUserProfileSchema.safeParse(input);

    if (!validation.success) {
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }

    const { uid, name } = validation.data;

    try {
        const userDocRef = adminDb.collection('users').doc(uid);
        await userDocRef.update({ name });
        return { success: true };
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw new Error("Could not update your profile. Please try again.");
    }
}
