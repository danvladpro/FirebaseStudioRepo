
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { PerformanceRecord } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const UpdateUserPerformanceSchema = z.object({
    uid: z.string(),
    setId: z.string(),
    time: z.number(),
    score: z.number(),
});

export async function updateUserPerformance(input: z.infer<typeof UpdateUserPerformanceSchema>) {
    const validation = UpdateUserPerformanceSchema.safeParse(input);

    if (!validation.success) {
        throw new Error(validation.error.errors.map(e => e.message).join(', '));
    }

    const { uid, setId, time, score } = validation.data;
    const userDocRef = adminDb.collection('users').doc(uid);

    try {
        let isNewBest = false;
        
        // Use a transaction to safely read and update the performance data
        await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userDocRef);

            if (!userDoc.exists) {
                // If user document doesn't exist, we can't update it.
                // This should ideally not happen if the user is logged in.
                throw new Error("User document does not exist.");
            }

            const userData = userDoc.data();
            const currentPerformance = userData?.performance?.[setId] as PerformanceRecord | undefined;
            const isPerfectScore = score === 100;

            let newBestTime = currentPerformance?.bestTime ?? null;

            if (isPerfectScore) {
                if (newBestTime === null || time < newBestTime) {
                    newBestTime = time;
                    isNewBest = true;
                }
            }
            
            const currentBestScore = currentPerformance?.bestScore ?? 0;
            const newBestScore = Math.max(currentBestScore, score);

            const newPerformanceRecord: PerformanceRecord = {
                bestTime: newBestTime,
                bestScore: newBestScore,
                lastTrained: new Date().toISOString(),
            };

            // Use dot notation to update a specific field within the 'performance' map
            transaction.update(userDocRef, {
                [`performance.${setId}`]: newPerformanceRecord
            });
        });
        
        return { success: true, newBest: isNewBest };

    } catch (error) {
        console.error("Error updating user performance:", error);
        throw new Error("Could not save your results. Please try again.");
    }
}
