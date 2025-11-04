
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { PerformanceRecord } from '@/lib/types';
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
        
        await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userDocRef);

            if (!userDoc.exists) {
                throw new Error("User document does not exist.");
            }

            const userData = userDoc.data();
            const currentPerformance = userData?.performance?.[setId] as PerformanceRecord | undefined;
            
            const newBestScore = Math.max(currentPerformance?.bestScore ?? 0, score);

            let newBestTime = currentPerformance?.bestTime ?? null;
            if (score === 100) {
                if (newBestTime === null || time < newBestTime) {
                    newBestTime = time;
                    isNewBest = true;
                }
            }

            const newPerformanceRecord: PerformanceRecord = {
                bestTime: newBestTime,
                bestScore: newBestScore,
                lastTrained: new Date().toISOString(),
            };

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
