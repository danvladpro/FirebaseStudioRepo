import 'server-only';
import admin from 'firebase-admin';

let app: admin.app.App | undefined;

function getApp(): admin.app.App {
    if (app) return app;
    if (admin.apps.length) {
        app = admin.apps[0]!;
        return app;
    }

    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    return app;
}

// Lazily initialise the Admin SDK on first property access. This keeps module
// import side-effect free so `next build` (which evaluates every route module
// during "Collecting page data") doesn't crash when the service-account env var
// is absent at build time. The error now only surfaces at request time.
function lazy<T extends object>(factory: () => T): T {
    let instance: T | undefined;
    return new Proxy({} as T, {
        get(_target, prop, receiver) {
            if (!instance) instance = factory();
            const value = Reflect.get(instance as object, prop, receiver);
            return typeof value === 'function' ? value.bind(instance) : value;
        },
    });
}

const adminDb = lazy(() => getApp().firestore());
const adminAuth = lazy(() => getApp().auth());

export { adminDb, adminAuth };
