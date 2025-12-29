import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getDatabase } from "firebase/database";

// IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAkzPHNwlI3QFJGVANlvegIFTMNPnmHnCs",
  authDomain: "enrique-s-house.firebaseapp.com",
  databaseURL: "https://enrique-s-house-default-rtdb.firebaseio.com",
  projectId: "enrique-s-house",
  storageBucket: "enrique-s-house.firebasestorage.app",
  messagingSenderId: "30014594726",
  appId: "1:30014594726:web:fd4aa3befd158bd3499e67",
  measurementId: "G-Y4FWY2MB1J"
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
