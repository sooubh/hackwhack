'use client';
// src/components/AuthGuard.jsx
// Redirects unauthenticated users to /login
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/services/firebase';

export default function AuthGuard({ children }) {
    const router = useRouter();
    const [status, setStatus] = useState('loading'); // loading | authenticated | unauthenticated
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                setStatus('authenticated');
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
    return typeof children === 'function' ? children(user) : children;
}
