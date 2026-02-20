// src/services/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only once (Next.js hot reload safe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics (only in browser environment to avoid SSR errors)
let analytics = null;
if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { user: result.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
}

export async function signOut() {
    try {
        await firebaseSignOut(auth);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
}

export { onAuthStateChanged };
