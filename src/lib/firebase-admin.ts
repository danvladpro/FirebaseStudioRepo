
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error: any) {
    console.error('Firebase Admin initialization error', error.stack);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
