import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

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
  
  db = admin.firestore();

} catch (error) {
  console.error('Firebase admin initialization error:', error);
  // Create a mock db object to avoid further crashes if initialization fails
  // This allows the application to build and run, but Firestore operations will fail.
  if (!db) {
     db = {} as admin.firestore.Firestore;
     console.error("Firestore could not be initialized. API calls will fail.");
  }
}

export { db };
