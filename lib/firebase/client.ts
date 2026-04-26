import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

// Client side Firebase initialization. We ensure that the app is only
// initialised once. Analytics is loaded lazily in the client to avoid
// import errors on the server. Do not import this file in server modules.

const firebaseConfig = {
  apiKey: 'AIzaSyAk0GW2sCm1rRGWucsBZjqjjhDzK5vcVpQ',
  authDomain: 'adivo-comics.firebaseapp.com',
  databaseURL: 'https://adivo-comics-default-rtdb.firebaseio.com',
  projectId: 'adivo-comics',
  storageBucket: 'adivo-comics.firebasestorage.app',
  messagingSenderId: '103283482471',
  appId: '1:103283482471:web:18234b61babdcdce1f19c2',
  measurementId: 'G-FDZDNZZR6Z'
};

let app: FirebaseApp | null = null;
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const existing = getApps()[0];
    app = existing || initializeApp(firebaseConfig);
  }
  return app;
}

let auth: Auth | null = null;
export function getFirebaseAuth(): Auth {
  const fApp = getFirebaseApp();
  if (!auth) {
    auth = getAuth(fApp);
  }
  return auth;
}

let database: Database | null = null;
export function getFirebaseDatabase(): Database {
  const fApp = getFirebaseApp();
  if (!database) {
    database = getDatabase(fApp);
  }
  return database;
}

export async function loadAnalytics() {
  if (typeof window === 'undefined') return;
  const { getAnalytics } = await import('firebase/analytics');
  const app = getFirebaseApp();
  return getAnalytics(app);
}