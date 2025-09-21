"use server";

import { db } from './firebase';
import { collection, doc, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { UserStats, PerformanceRecord } from './types';

const USERS_COLLECTION = 'users';
const PERFORMANCE_SUBCOLLECTION = 'performance';

export async function getPerformanceStats(userId: string): Promise<UserStats> {
  const performanceCollectionRef = collection(db, USERS_COLLECTION, userId, PERFORMANCE_SUBCOLLECTION);
  const snapshot = await getDocs(performanceCollectionRef);
  
  const stats: UserStats = {};
  snapshot.forEach(doc => {
    stats[doc.id] = doc.data() as PerformanceRecord;
  });
  
  return stats;
}

export async function updateUserStats(userId: string, setId: string, record: PerformanceRecord): Promise<void> {
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  const performanceDocRef = doc(userDocRef, PERFORMANCE_SUBCOLLECTION, setId);
  
  await setDoc(performanceDocRef, record, { merge: true });
}
