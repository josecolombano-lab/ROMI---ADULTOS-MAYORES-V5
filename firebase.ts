import { initializeApp, getApps, getApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

// Singleton Pattern: Check if an app is already initialized to avoid crashes
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
}

// Initialize services
auth = getAuth(app);
db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

console.log("Firebase services initialized successfully.");

export { app, auth, db };
