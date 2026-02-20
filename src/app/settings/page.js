'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useTheme } from '@/contexts/ThemeContext';
import { db, auth, updateUserProfile, changePassword, signOut } from '@/services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { theme: t, mode, toggleTheme } = useTheme();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState('profile');
    const [profile, setProfile] = useState({ displayName: '', company: '', designation: '', phone: '', bio: '' });
    const [prefs, setPrefs] = useState({ emailAlerts: true, pushNotifications: false, weeklyReport: true, currency: '₹ INR', language: 'English' });
    const [saving, setSaving] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPw, setChangingPw] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user || !db) return;
        const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setProfile(prev => ({ ...prev, ...data }));
                if (data.preferences) setPrefs(prev => ({ ...prev, ...data.preferences }));
            }
        });
        return () => unsub();
    }, []);

    const handleSaveProfile = async () => {
        const user = auth.currentUser;
        if (!user) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'users', user.uid), { ...profile, preferences: prefs }, { merge: true });
            if (profile.displayName) await updateUserProfile({ displayName: profile.displayName });
            toast.success('Settings saved!');
        } catch { toast.error('Save failed.'); }
        finally { setSaving(false); }
    };

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 6) { toast.error('Min 6 characters'); return; }
        if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
        setChangingPw(true);
        try {
            const result = await changePassword(newPassword);
            if (result.error) throw new Error(result.error);
            toast.success('Password changed!');
            setNewPassword(''); setConfirmPassword('');
        } catch (err) { toast.error(err.message || 'Failed — you may need to re-login first.'); }
        finally { setChangingPw(false); }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    const inputStyle = { width: '100%', padding: '10px 14px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
    const labelStyle = { fontSize: '13px', fontWeight: 600, color: t.textSecondary, display: 'block', marginBottom: '6px' };
    const cardStyle = { background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px', marginBottom: '20px' };
    const sections = [
        { id: 'profile', label: 'Profile', icon: 'person' },
        { id: 'preferences', label: 'Preferences', icon: 'tune' },
        { id: 'security', label: 'Security', icon: 'lock' },
        { id: 'account', label: 'Account', icon: 'manage_accounts' },
    ];

    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, color: t.text }}>
                    <Sidebar />
                    <main style={{ flex: 1, padding: '32px', overflowY: 'auto', height: '100vh' }}>
                        <TopBar user={user} title="Settings" subtitle="Manage your profile, preferences & security" />

                        <div style={{ display: 'flex', gap: '24px', maxWidth: '900px' }}>
                            {/* Section nav */}
                            <div style={{ width: '200px', flexShrink: 0 }}>
                                <div style={{ ...cardStyle, padding: '10px' }}>
                                    {sections.map(s => (
                                        <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                                            display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '10px',
                                            fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', textAlign: 'left',
                                            background: activeSection === s.id ? t.primaryBg : 'transparent',
                                            color: activeSection === s.id ? t.heading : t.textSecondary,
                                        }}>
                                            <span className="material-icons-outlined" style={{ fontSize: '18px', color: activeSection === s.id ? t.primary : t.textMuted }}>{s.icon}</span>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>
                                {/* PROFILE */}
                                {activeSection === 'profile' && (
                                    <div style={cardStyle}>
                                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.heading, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="material-icons-outlined" style={{ color: t.primary }}>person</span> Profile Details
                                        </h2>
                                        <div style={{ display: 'grid', gap: '16px' }}>
                                            <div>
                                                <label style={labelStyle}>Display Name</label>
                                                <input style={inputStyle} value={profile.displayName || ''} onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))} placeholder="Your Name" />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div>
                                                    <label style={labelStyle}>Company</label>
                                                    <input style={inputStyle} value={profile.company || ''} onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} placeholder="Company Name" />
                                                </div>
                                                <div>
                                                    <label style={labelStyle}>Designation</label>
                                                    <input style={inputStyle} value={profile.designation || ''} onChange={e => setProfile(p => ({ ...p, designation: e.target.value }))} placeholder="Supply Chain Manager" />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Phone</label>
                                                <input style={inputStyle} value={profile.phone || ''} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Bio</label>
                                                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={profile.bio || ''} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Brief description..." />
                                            </div>
                                        </div>
                                        <button onClick={handleSaveProfile} disabled={saving} style={{ marginTop: '20px', padding: '10px 24px', background: t.primary, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                                            {saving ? 'Saving...' : 'Save Profile'}
                                        </button>
                                    </div>
                                )}

                                {/* PREFERENCES */}
                                {activeSection === 'preferences' && (
                                    <>
                                        <div style={cardStyle}>
                                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.heading, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="material-icons-outlined" style={{ color: t.primary }}>palette</span> Appearance
                                            </h2>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${t.border}` }}>
                                                <div>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: t.heading }}>Theme</div>
                                                    <div style={{ fontSize: '12px', color: t.textMuted }}>Switch between dark and light mode</div>
                                                </div>
                                                <button onClick={toggleTheme} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: `1px solid ${t.border}`, background: t.bgCard, color: t.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span className="material-icons-outlined" style={{ fontSize: '18px' }}>{mode === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                                                    {mode === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${t.border}` }}>
                                                <div>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: t.heading }}>Currency</div>
                                                    <div style={{ fontSize: '12px', color: t.textMuted }}>Display currency for orders and costs</div>
                                                </div>
                                                <select value={prefs.currency} onChange={e => setPrefs(p => ({ ...p, currency: e.target.value }))} style={{ padding: '8px 12px', borderRadius: '10px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: '13px' }}>
                                                    <option>₹ INR</option>
                                                    <option>$ USD</option>
                                                    <option>€ EUR</option>
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
                                                <div>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: t.heading }}>Language</div>
                                                    <div style={{ fontSize: '12px', color: t.textMuted }}>Interface language</div>
                                                </div>
                                                <select value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))} style={{ padding: '8px 12px', borderRadius: '10px', border: `1px solid ${t.border}`, background: t.bg, color: t.text, fontSize: '13px' }}>
                                                    <option>English</option>
                                                    <option>Hindi</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={cardStyle}>
                                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.heading, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="material-icons-outlined" style={{ color: t.warning }}>notifications</span> Notifications
                                            </h2>
                                            {[
                                                { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive critical alerts via email' },
                                                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications for disruptions' },
                                                { key: 'weeklyReport', label: 'Weekly Report', desc: 'Get a weekly supply chain summary email' },
                                            ].map((item, i) => (
                                                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 2 ? `1px solid ${t.border}` : 'none' }}>
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: 600, color: t.heading }}>{item.label}</div>
                                                        <div style={{ fontSize: '12px', color: t.textMuted }}>{item.desc}</div>
                                                    </div>
                                                    <button onClick={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                                                        style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', background: prefs[item.key] ? t.primary : t.border, transition: 'background 0.2s' }}>
                                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: prefs[item.key] ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button onClick={handleSaveProfile} disabled={saving} style={{ padding: '10px 24px', background: t.primary, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                                            {saving ? 'Saving...' : 'Save Preferences'}
                                        </button>
                                    </>
                                )}

                                {/* SECURITY */}
                                {activeSection === 'security' && (
                                    <div style={cardStyle}>
                                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.heading, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="material-icons-outlined" style={{ color: t.warning }}>lock</span> Change Password
                                        </h2>
                                        <p style={{ fontSize: '13px', color: t.textMuted, marginBottom: '16px' }}>For email/password accounts. You may need to re-login first.</p>
                                        <div style={{ display: 'grid', gap: '12px', maxWidth: '400px' }}>
                                            <div>
                                                <label style={labelStyle}>New Password</label>
                                                <input type="password" style={inputStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Confirm Password</label>
                                                <input type="password" style={inputStyle} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
                                            </div>
                                        </div>
                                        <button onClick={handleChangePassword} disabled={changingPw} style={{ marginTop: '16px', padding: '10px 24px', background: t.warning, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                                            {changingPw ? 'Changing...' : 'Change Password'}
                                        </button>
                                    </div>
                                )}

                                {/* ACCOUNT */}
                                {activeSection === 'account' && (
                                    <>
                                        <div style={cardStyle}>
                                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.heading, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="material-icons-outlined" style={{ color: t.info }}>info</span> Account Info
                                            </h2>
                                            <div style={{ fontSize: '14px', color: t.textSecondary, display: 'grid', gap: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: t.bg, borderRadius: '10px', border: `1px solid ${t.border}` }}>
                                                    <span className="material-icons-outlined" style={{ fontSize: '18px', color: t.textMuted }}>email</span>
                                                    <div><div style={{ fontSize: '11px', color: t.textMuted }}>Email</div><div style={{ fontWeight: 600, color: t.heading }}>{user?.email}</div></div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: t.bg, borderRadius: '10px', border: `1px solid ${t.border}` }}>
                                                    <span className="material-icons-outlined" style={{ fontSize: '18px', color: t.textMuted }}>badge</span>
                                                    <div><div style={{ fontSize: '11px', color: t.textMuted }}>Provider</div><div style={{ fontWeight: 600, color: t.heading }}>{user?.providerData?.[0]?.providerId || 'email'}</div></div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: t.bg, borderRadius: '10px', border: `1px solid ${t.border}` }}>
                                                    <span className="material-icons-outlined" style={{ fontSize: '18px', color: t.textMuted }}>fingerprint</span>
                                                    <div><div style={{ fontSize: '11px', color: t.textMuted }}>User ID</div><div style={{ fontWeight: 600, color: t.heading, fontSize: '12px', fontFamily: 'monospace' }}>{user?.uid}</div></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ ...cardStyle, borderColor: t.dangerBorder }}>
                                            <h2 style={{ fontSize: '16px', fontWeight: 700, color: t.danger, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="material-icons-outlined" style={{ fontSize: '18px' }}>logout</span> Sign Out
                                            </h2>
                                            <p style={{ fontSize: '13px', color: t.textMuted, marginBottom: '14px' }}>Sign out of your account on this device.</p>
                                            <button onClick={handleSignOut} style={{ padding: '10px 20px', background: t.danger, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                                                Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </AuthGuard>
    );
}
