// src/services/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
    updatePassword as firebaseUpdatePassword
} from 'firebase/auth';
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

export async function signUpWithEmail(email, password, displayName) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Set the display name on the Firebase Auth profile
        await updateProfile(result.user, { displayName });
        return { user: result.user, error: null };
    } catch (error) {
        let msg = error.message;
        if (error.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
        if (error.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
        if (error.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
        return { user: null, error: msg };
    }
}

export async function updateUserProfile(profileData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');
        await updateProfile(user, profileData);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
}

export async function signInWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error) {
        let msg = error.message;
        if (error.code === 'auth/user-not-found') msg = 'No account found with this email.';
        if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
        if (error.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
        if (error.code === 'auth/too-many-requests') msg = 'Too many attempts. Please try again later.';
        return { user: null, error: msg };
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

export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
}

export async function changePassword(newPassword) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');
        await firebaseUpdatePassword(user, newPassword);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
}

export { onAuthStateChanged };
