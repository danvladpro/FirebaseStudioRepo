
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
} catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
}

export const adminDb = admin.firestore();
