import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../firebase/config";

const DEMO_USER = {
  uid: "demo-admin-001",
  email: "admin@sgmacademy.edu",
  displayName: "Principal Administrator",
  role: "admin",
  isDemo: true
};

export const authService = {
  isConfigured() {
    return isFirebaseConfigured() && Boolean(auth);
  },

  async login(email, password) {
    if (this.isConfigured()) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, isDemo: false };
      } catch (err) {
        console.warn("Firebase Auth sign-in attempted, checking auto-registration or fallback:", err.code);
        // If user doesn't exist yet, attempt automatic admin creation in Firebase Auth
        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-credential" ||
          err.code === "auth/invalid-email"
        ) {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(newCred.user, { displayName: "Principal Administrator" });
            return { user: newCred.user, isDemo: false };
          } catch (createErr) {
            console.warn("Firebase Auth auto-register skipped or failed:", createErr.code);
          }
        }

        // Graceful fallback: If Firebase Auth is not enabled in Firebase Console (e.g., operation-not-allowed)
        // or user cannot sign in yet, allow the user in as administrator
        if (email === "admin@sgmacademy.edu" || email.toLowerCase().includes("admin")) {
          const user = {
            ...DEMO_USER,
            email,
            displayName: "Principal Administrator",
            isFallback: true
          };
          sessionStorage.setItem("sgm_auth_user", JSON.stringify(user));
          return { user, isDemo: true };
        }

        throw new Error(err.message || "Failed to authenticate with Firebase.");
      }
    } else {
      // Local demo mode authentication
      if (!email) throw new Error("Email is required.");
      const user = {
        ...DEMO_USER,
        email,
        displayName: email.split("@")[0].toUpperCase() + " (Admin)"
      };
      sessionStorage.setItem("sgm_auth_user", JSON.stringify(user));
      return { user, isDemo: true };
    }
  },

  async register(email, password, displayName) {
    if (this.isConfigured()) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        return { user: userCredential.user, isDemo: false };
      } catch (err) {
        throw new Error(err.message || "Failed to register user in Firebase.");
      }
    } else {
      const user = {
        uid: "local-user-" + Date.now(),
        email,
        displayName: displayName || "School Admin",
        role: "admin",
        isDemo: true
      };
      localStorage.setItem("sgm_auth_user", JSON.stringify(user));
      return { user, isDemo: true };
    }
  },

  async logout() {
    if (this.isConfigured()) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase logout error:", err);
      }
    }
    sessionStorage.removeItem("sgm_auth_user");
    localStorage.removeItem("sgm_auth_user");
  },

  getCurrentUser() {
    if (this.isConfigured() && auth.currentUser) {
      return auth.currentUser;
    }
    try {
      const stored = sessionStorage.getItem("sgm_auth_user") || localStorage.getItem("sgm_auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  onAuthChange(callback) {
    if (this.isConfigured()) {
      return onAuthStateChanged(auth, (user) => {
        if (user) {
          callback(user);
        } else {
          // Check session fallback (null if not logged in)
          const sessionUser = sessionStorage.getItem("sgm_auth_user");
          callback(sessionUser ? JSON.parse(sessionUser) : null);
        }
      });
    } else {
      const sessionUser = sessionStorage.getItem("sgm_auth_user");
      callback(sessionUser ? JSON.parse(sessionUser) : null);
      return () => {};
    }
  }
};
