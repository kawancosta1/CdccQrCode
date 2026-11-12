import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const env = typeof import.meta !== "undefined" ? import.meta.env : undefined;

export const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY?.trim() || "",
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN?.trim() || "",
  projectId: env?.VITE_FIREBASE_PROJECT_ID?.trim() || "",
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET?.trim() || "",
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || "",
  appId: env?.VITE_FIREBASE_APP_ID?.trim() || "",
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      !firebaseConfig.apiKey.includes("sua-api-key"),
  );
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseConfigured()) {
  try {
    const existingApps = getApps();
    appInstance = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    storageInstance = getStorage(appInstance);
  } catch (err) {
    console.warn("Falha ao inicializar o Firebase. Ativando fallback local:", err);
    appInstance = null;
    authInstance = null;
    dbInstance = null;
    storageInstance = null;
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  return appInstance;
}

export function getFirebaseAuth(): Auth | null {
  return authInstance;
}

export function getFirestoreDb(): Firestore | null {
  return dbInstance;
}

export function getFirebaseStorageInstance(): FirebaseStorage | null {
  return storageInstance;
}
