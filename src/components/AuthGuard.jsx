'use client';
// src/components/AuthGuard.jsx
// Redirects unauthenticated users to /login
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged, db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AuthGuard({ children }) {
    const router = useRouter();
    const [status, setStatus] = useState('loading'); // loading | authenticated | unauthenticated
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Fetch user profile from Firestore to get RBAC role
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    let role = 'viewer';

                    // Hardcode Admin privileges for specific Master Admin UID
                    if (firebaseUser.uid === 'lBWeu274tEbyKLwKrqGIu1WPcs42') {
                        role = 'admin';
                    } else if (userDoc.exists()) {
                        role = userDoc.data().role || 'viewer';
                    }

                    if (!userDoc.exists()) {
                        // Create default profile for first-time login
                        await setDoc(userDocRef, {
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            role: role,
                            createdAt: new Date().toISOString()
                        });
                    }

                    // Inject the role into the user object
                    setUser({ ...firebaseUser, role });
                    setStatus('authenticated');
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    // Fallback access
                    setUser({ ...firebaseUser, role: 'viewer' });
                    setStatus('authenticated');
                }
            } else {
                setStatus('unauthenticated');
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    if (status === 'loading') {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#070b14',
                gap: '16px',
            }}>
                <div style={{
                    width: '48px', height: '48px',
                    border: '3px solid rgba(34,211,238,0.2)',
                    borderTopColor: '#22d3ee',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{ color: '#475569', fontSize: '14px' }}>Authenticating...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (status === 'unauthenticated') return null;

    // Pass user to children via React cloneElement if it's a single element
    return (typeof children === 'function') ? children(user) : children;
}
