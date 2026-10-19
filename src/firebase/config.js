import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBmHgyBJLlVqCaEu8ZMO3Z1wvqEt3oVj4s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sgm-academy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sgm-academy",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sgm-academy.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "858546576323",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:858546576323:web:83e1b04303d718c8a57b76",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-R3L0D24W79"
};

// Check if valid Firebase configuration has been provided
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "your_api_key_here" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "your_project_id"
  );
};

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("🔥 Firebase initialized successfully with project:", firebaseConfig.projectId);
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
} else {
  console.info("ℹ️ Firebase configuration not detected or incomplete. Running in persistent local storage mode until credentials are provided in .env.");
}

export { app, auth, db, firebaseConfig };
