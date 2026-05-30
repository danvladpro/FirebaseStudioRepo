import 'server-only';
import admin from 'firebase-admin';

let adminDb: ReturnType<typeof admin.firestore>;
let adminAuth: ReturnType<typeof admin.auth>;

try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    adminDb = admin.firestore();
    adminAuth = admin.auth();
} catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw error;
}

export { adminDb, adminAuth };
