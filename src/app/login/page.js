'use client';
// src/app/login/page.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/services/firebase';
import { Zap, Globe, TrendingUp, Shield } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        const { user, error: err } = await signInWithGoogle();
        if (user) {
            router.push('/dashboard');
        } else {
            setError(err || 'Sign-in failed. Please try again.');
            setLoading(false);
        }
    };

    const features = [
        { icon: Globe, label: 'Real-time global network visibility' },
        { icon: TrendingUp, label: 'AI-powered disruption predictions' },
        { icon: Shield, label: 'Risk scoring across 15+ nodes' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#070b14',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Animated background blobs */}
            <div style={{ position: 'absolute', top: '-200px', left: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-200px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Left panel — branding */}
            <div style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '60px',
                borderRight: '1px solid rgba(99,179,237,0.08)',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px' }}>
                    <div style={{
                        width: '48px', height: '48px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(34,211,238,0.4)',
                    }}>
                        <Zap size={24} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>SupplyGuard</div>
                        <div style={{ fontSize: '11px', color: '#22d3ee', letterSpacing: '2px', textTransform: 'uppercase' }}>AI Platform</div>
                    </div>
                </div>

                <h1 style={{
                    fontSize: '42px', fontWeight: 900, lineHeight: 1.1,
                    background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: '16px',
                }}>
                    Predict Disruptions.<br />Before They Strike.
                </h1>
                <p style={{ fontSize: '16px', color: '#64748b', lineHeight: 1.7, maxWidth: '400px', marginBottom: '40px' }}>
                    Monitor global supply chains in real time, get AI-powered risk predictions, and activate smart alternatives instantly.
                </p>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {features.map(({ icon: Icon, label }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '32px', height: '32px',
                                borderRadius: '8px',
                                background: 'rgba(34,211,238,0.1)',
                                border: '1px solid rgba(34,211,238,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icon size={14} color="#22d3ee" />
                            </div>
                            <span style={{ fontSize: '14px', color: '#94a3b8' }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel — sign in */}
            <div style={{
                width: '480px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '60px 48px',
            }}>
                <div style={{
                    width: '100%',
                    background: 'rgba(17,24,39,0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99,179,237,0.15)',
                    borderRadius: '24px',
                    padding: '40px',
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>
                        Sign in
                    </h2>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
                        Access your supply chain dashboard
                    </p>

                    {/* Network stats teaser */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
                        marginBottom: '32px',
                    }}>
                        {[
                            { label: 'Nodes Monitored', value: '15' },
                            { label: 'Active Alerts', value: '3' },
                            { label: 'Routes Tracked', value: '18' },
                            { label: 'High Risk', value: '4' },
                        ].map(({ label, value }) => (
                            <div key={label} style={{
                                padding: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '10px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: '#22d3ee' }}>{value}</div>
                                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Google Sign In */}
                    <button
                        id="google-signin-btn"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: loading ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '12px',
                            color: '#f1f5f9',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            transition: 'all 0.2s ease',
                            opacity: loading ? 0.6 : 1,
                        }}
                        onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                        onMouseLeave={e => !loading && (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
                        {!loading && (
                            <svg width="18" height="18" viewBox="0 0 18 18">
                                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                                <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.101-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
                                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
                            </svg>
                        )}
                        {loading ? 'Signing in...' : 'Continue with Google'}
                    </button>

                    {error && (
                        <p style={{ marginTop: '12px', color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>
                            {error}
                        </p>
                    )}

                    <p style={{ marginTop: '20px', fontSize: '12px', color: '#334155', textAlign: 'center', lineHeight: 1.5 }}>
                        By signing in, you agree to use this platform for supply chain management purposes.
                    </p>
                </div>
            </div>
        </div>
    );
}
