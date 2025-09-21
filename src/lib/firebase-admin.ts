import admin from 'firebase-admin';

function initializeFirebaseAdmin() {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin SDK credentials. Please check your environment variables.');
    }

    const serviceAccount: admin.ServiceAccount = {
      projectId,
      clientEmail,
      privateKey,
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    
    return admin.firestore();
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // Throw the error to prevent the application from running with a misconfigured service.
    throw new Error('Failed to initialize Firebase Admin SDK. Check server logs for details.');
  }
}

const db = initializeFirebaseAdmin();

export { db };
