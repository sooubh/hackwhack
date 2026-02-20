'use client';
import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useTheme } from '@/contexts/ThemeContext';
import { db, auth, updateUserProfile, changePassword } from '@/services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { theme: t } = useTheme();
    const [profile, setProfile] = useState({ displayName: '', company: '', designation: '', phone: '', bio: '' });
    const [saving, setSaving] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user || !db) return;
        const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) setProfile(prev => ({ ...prev, ...snap.data() }));
        });
        return () => unsub();
    }, []);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
            if (profile.displayName) await updateUserProfile({ displayName: profile.displayName });
            toast.success('Profile saved!');
        } catch (err) { toast.error('Save failed.'); }
        finally { setSaving(false); }
    };

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
        setChangingPassword(true);
        try {
            const result = await changePassword(newPassword);
            if (result.error) throw new Error(result.error);
            toast.success('Password changed successfully!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) { toast.error(err.message || 'Failed to change password. You may need to re-login first.'); }
        finally { setChangingPassword(false); }
    };

    const inputStyle = { width: '100%', padding: '10px 14px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: '10px', color: t.text, fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
    const labelStyle = { fontSize: '13px', fontWeight: 600, color: t.textSecondary, display: 'block', marginBottom: '6px' };

    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, color: t.text }}>
                    <Sidebar />
                    <main style={{ flex: 1, padding: '32px', overflowY: 'auto', height: '100vh' }}>
                        <TopBar user={user} title="My Profile" subtitle="Manage your account and security" />

                        <div style={{ maxWidth: '600px' }}>
                            {/* Profile Details */}
                            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.heading, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="material-icons-outlined" style={{ color: t.primary }}>person</span> Profile Details
                                </h2>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Display Name</label>
                                        <input style={inputStyle} value={profile.displayName || ''} onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))} placeholder="John Doe" />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={labelStyle}>Company</label>
                                            <input style={inputStyle} value={profile.company || ''} onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} placeholder="Your Company" />
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
                                <button onClick={handleSave} disabled={saving} style={{ marginTop: '20px', padding: '10px 24px', background: t.primary, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>

                            {/* Change Password */}
                            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.heading, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="material-icons-outlined" style={{ color: t.warning }}>lock</span> Change Password
                                </h2>
                                <p style={{ fontSize: '13px', color: t.textMuted, marginBottom: '16px' }}>For email/password accounts. You may need to re-login first for security.</p>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div>
                                        <label style={labelStyle}>New Password</label>
                                        <input type="password" style={inputStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Confirm Password</label>
                                        <input type="password" style={inputStyle} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
                                    </div>
                                </div>
                                <button onClick={handleChangePassword} disabled={changingPassword} style={{ marginTop: '16px', padding: '10px 24px', background: t.warning, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                                    {changingPassword ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>

                            {/* Account Info */}
                            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px' }}>
                                <h2 style={{ fontSize: '16px', fontWeight: 700, color: t.heading, margin: '0 0 12px' }}>Account Info</h2>
                                <div style={{ fontSize: '14px', color: t.textSecondary }}>
                                    <p style={{ margin: '0 0 6px' }}><b style={{ color: t.heading }}>Email:</b> {user?.email}</p>
                                    <p style={{ margin: '0 0 6px' }}><b style={{ color: t.heading }}>Provider:</b> {user?.providerData?.[0]?.providerId || 'email'}</p>
                                    <p style={{ margin: 0 }}><b style={{ color: t.heading }}>UID:</b> <span style={{ fontSize: '12px', fontFamily: 'monospace', color: t.textMuted }}>{user?.uid}</span></p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </AuthGuard>
    );
}
