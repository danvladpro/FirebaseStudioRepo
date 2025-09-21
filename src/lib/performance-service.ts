"use server";

import { db } from './firebase-admin';
import { UserStats, PerformanceRecord } from './types';

const USERS_COLLECTION = 'users';
const PERFORMANCE_SUBCOLLECTION = 'performance';

export async function getPerformanceStats(userId: string): Promise<UserStats> {
  const performanceCollectionRef = db.collection(USERS_COLLECTION).doc(userId).collection(PERFORMANCE_SUBCOLLECTION);
  const snapshot = await performanceCollectionRef.get();
  
  const stats: UserStats = {};
  snapshot.forEach(doc => {
    stats[doc.id] = doc.data() as PerformanceRecord;
  });
  
  return stats;
}

export async function updateUserStats(userId: string, setId: string, record: PerformanceRecord): Promise<void> {
  const performanceDocRef = db.collection(USERS_COLLECTION).doc(userId).collection(PERFORMANCE_SUBCOLLECTION).doc(setId);
  
  // Use merge:true to avoid overwriting the entire document if only some fields are provided.
  // This is safer for partial updates.
  await performanceDocRef.set(record, { merge: true });
}
