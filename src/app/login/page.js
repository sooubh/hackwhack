'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from '@/services/firebase';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const { theme: t, mode, toggleTheme } = useTheme();
    const [view, setView] = useState('login'); // login, signup, forgot
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogle = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            router.push('/dashboard');
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    };

    const handleEmail = async (e) => {
        e.preventDefault();
        if (!email || (!password && view !== 'forgot')) { toast.error('Fill all fields'); return; }
        setLoading(true);
        try {
            if (view === 'signup') {
                await signUpWithEmail(email, password);
                router.push('/dashboard');
            } else {
                await signInWithEmail(email, password);
                router.push('/dashboard');
            }
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        if (!email) { toast.error('Enter your email'); return; }
        setLoading(true);
        try {
            const result = await resetPassword(email);
            if (result.error) throw new Error(result.error);
            toast.success('Password reset email sent! Check your inbox.');
            setView('login');
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    };

    const inputStyle = { width: '100%', padding: '12px 16px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

    return (
        <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px' }}>
            <button onClick={toggleTheme} style={{ position: 'absolute', top: '20px', right: '20px', background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '8px 14px', color: t.textSecondary, cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-icons-outlined" style={{ fontSize: '18px' }}>{mode === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                {mode === 'dark' ? 'Light' : 'Dark'}
            </button>

            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span className="material-icons-outlined" style={{ fontSize: '32px', color: t.primary }}>security</span>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, color: t.heading, margin: 0 }}>Vigilance AI</h1>
                    </div>
                    <p style={{ fontSize: '14px', color: t.textMuted }}>Supply Chain Management Platform</p>
                </div>

                <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '32px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: t.heading, margin: '0 0 24px', textAlign: 'center' }}>
                        {view === 'forgot' ? 'Reset Password' : view === 'signup' ? 'Create Account' : 'Sign In'}
                    </h2>

                    {/* Forgot Password View */}
                    {view === 'forgot' ? (
                        <form onSubmit={handleForgot}>
                            <p style={{ fontSize: '14px', color: t.textSecondary, marginBottom: '16px', textAlign: 'center' }}>
                                Enter your email and we'll send you a password reset link.
                            </p>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '13px', fontWeight: 600, color: t.textSecondary, display: 'block', marginBottom: '6px' }}>Email</label>
                                <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
                            </div>
                            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: t.primary, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: t.textMuted }}>
                                <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: t.primary, fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                                    ← Back to Sign In
                                </button>
                            </p>
                        </form>
                    ) : (
                        /* Login / Signup View */
                        <>
                            <form onSubmit={handleEmail}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: t.textSecondary, display: 'block', marginBottom: '6px' }}>Email</label>
                                    <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
                                </div>
                                <div style={{ marginBottom: '8px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 600, color: t.textSecondary, display: 'block', marginBottom: '6px' }}>Password</label>
                                    <input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                                </div>
                                {view === 'login' && (
                                    <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                                        <button type="button" onClick={() => setView('forgot')} style={{ background: 'none', border: 'none', color: t.primary, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}
                                {view === 'signup' && <div style={{ height: '12px' }} />}
                                <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: t.primary, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Please wait...' : view === 'signup' ? 'Sign Up' : 'Sign In'}
                                </button>
                            </form>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0', color: t.textMuted }}>
                                <div style={{ flex: 1, height: '1px', background: t.border }} />
                                <span style={{ fontSize: '12px' }}>or</span>
                                <div style={{ flex: 1, height: '1px', background: t.border }} />
                            </div>

                            <button onClick={handleGoogle} disabled={loading} style={{ width: '100%', padding: '12px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '18px' }}>G</span> Continue with Google
                            </button>

                            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: t.textMuted }}>
                                {view === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                                <button onClick={() => setView(view === 'signup' ? 'login' : 'signup')} style={{ background: 'none', border: 'none', color: t.primary, fontWeight: 600, cursor: 'pointer', marginLeft: '4px', fontSize: '13px' }}>
                                    {view === 'signup' ? 'Sign In' : 'Sign Up'}
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
