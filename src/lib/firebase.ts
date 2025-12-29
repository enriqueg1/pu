import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getDatabase } from "firebase/database";

// IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "PLACEHOLDER_API_KEY",
  authDomain: "PLACEHOLDER_AUTH_DOMAIN",
  databaseURL: "PLACEHOLDER_DATABASE_URL",
  projectId: "PLACEHOLDER_PROJECT_ID",
  storageBucket: "PLACEHOLDER_STORAGE_BUCKET",
  messagingSenderId: "PLACEHOLDER_MESSAGING_SENDER_ID",
  appId: "PLACEHOLDER_APP_ID",
};

function initializeFirebase() {
  if (!getApps().length) {
    try {
      // Avoid initializing if placeholder values are still present
      if (firebaseConfig.apiKey?.startsWith("PLACEHOLDER")) {
        console.warn("Firebase config is using placeholder values. Please replace them with your actual Firebase project configuration in src/lib/firebase.ts to connect to the database.");
        return null;
      }
      return initializeApp(firebaseConfig);
    } catch (error) {
      console.error("Failed to initialize Firebase", error);
      return null;
    }
  }
  return getApps()[0];
}

const app = initializeFirebase();

export const db = app ? getDatabase(app) : null;
