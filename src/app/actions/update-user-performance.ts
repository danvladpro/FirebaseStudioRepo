
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { PerformanceRecord } from '@/lib/types';
import { z } from 'zod';
import { ALL_EXAM_SETS } from '@/lib/challenges';

const UpdateUserPerformanceSchema = z.object({
    uid: z.string(),
    setId: z.string(),
    time: z.number(),
    score: z.number(),
});

const generateCertificateId = (uid: string) => {
    return `${uid}-mastery-${new Date().getTime()}`;
};

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
                // Remove individual certificate ID generation
            };

            transaction.update(userDocRef, {
                [`performance.${setId}`]: newPerformanceRecord
            });
            
            // Check for Mastery Certificate after updating performance
            const isExam = ALL_EXAM_SETS.some(exam => exam.id === setId);
            if (isExam && score === 100) {
                const updatedPerformance = { ...userData?.performance, [setId]: newPerformanceRecord };
                
                const allExamsPassed = ALL_EXAM_SETS.every(exam => {
                    return updatedPerformance[exam.id]?.bestScore === 100;
                });

                if (allExamsPassed && !userData?.masteryCertificateId) {
                    const certificateId = generateCertificateId(uid);
                    transaction.update(userDocRef, {
                        masteryCertificateId: certificateId
                    });
                }
            }
        });
        
        return { success: true, newBest: isNewBest };

    } catch (error) {
        console.error("Error updating user performance:", error);
        throw new Error("Could not save your results. Please try again.");
    }
}
