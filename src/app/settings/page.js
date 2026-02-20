'use client';
// src/app/settings/page.js
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import AuthGuard from '@/components/AuthGuard';
import VoiceAssistant from '@/components/VoiceAssistant';
import { Database, AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { seedDummyDataToFirebase, clearFirebaseDatabase } from '@/services/dataSeeder';
import { useData } from '@/contexts/DataContext';

export default function SettingsPage() {
    const [seeding, setSeeding] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    const { nodes, routes, events, alerts, error } = useData();

    const handleSeedData = async (userId) => {
        setSeeding(true);
        setStatusMessage({ text: 'Initializing tenant database seed...', type: 'info' });

        try {
            await seedDummyDataToFirebase(userId);
            setStatusMessage({ text: 'Successfully seeded your isolated database sandbox!', type: 'success' });
        } catch (err) {
            console.error("Seeding failed", err);
            setStatusMessage({ text: `Failed to seed: ${err.message}`, type: 'error' });
        } finally {
            setSeeding(false);
        }
    };

    const handleClearData = async (userId) => {
        if (!window.confirm("Are you sure you want to completely erase your data? This action cannot be undone.")) {
            return;
        }

        setClearing(true);
        setStatusMessage({ text: 'Erasing your tenant database...', type: 'info' });

        try {
            await clearFirebaseDatabase(userId);
            setStatusMessage({ text: 'Successfully wiped your isolated database.', type: 'success' });
        } catch (err) {
            console.error("Database clear failed", err);
            setStatusMessage({ text: `Failed to clear: ${err.message}`, type: 'error' });
        } finally {
            setClearing(false);
        }
    };

    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14' }}>
                    <Sidebar />

                    <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <TopBar user={user} />

                        <main style={{ padding: '32px', flex: 1, color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
                            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>
                                    Platform Settings
                                </h1>
                                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
                                    Manage your isolated tenant sandbox and data state.
                                </p>

                                {/* Firebase Status Card */}
                                <div style={{
                                    background: '#0d1424',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    padding: '24px',
                                    marginBottom: '32px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Database color="#22d3ee" size={24} />
                                        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Tenant Sandboxes</h2>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                        {[
                                            { label: 'My Nodes', count: nodes?.length || 0, color: '#22d3ee' },
                                            { label: 'My Routes', count: routes?.length || 0, color: '#c084fc' },
                                            { label: 'My Events', count: events?.length || 0, color: '#fb923c' },
                                            { label: 'My Alerts', count: alerts?.length || 0, color: '#f87171' },
                                        ].map(stat => (
                                            <div key={stat.label} style={{
                                                background: 'rgba(15, 23, 42, 0.5)',
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{stat.label}</div>
                                                <div style={{ fontSize: '24px', fontWeight: 600, color: stat.color }}>{stat.count}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {error && (
                                        <div style={{
                                            marginBottom: '24px',
                                            padding: '16px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            borderRadius: '12px',
                                            display: 'flex', gap: '12px', alignItems: 'flex-start',
                                            color: '#f87171', fontSize: '13px'
                                        }}>
                                            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <div>
                                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Firebase Connection Error</div>
                                                {error}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{
                                        background: '#070b14',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', margin: 0 }}>Sandbox Operations</h3>
                                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
                                            You can reset your isolated tenant data using templates or completely clear the collections to start fresh. This only affects your specific account.
                                        </p>

                                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => handleSeedData(user.uid)}
                                                disabled={seeding || clearing}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    padding: '10px 24px',
                                                    borderRadius: '10px',
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    border: (seeding || clearing) ? '1px solid #334155' : 'none',
                                                    background: (seeding || clearing) ? '#1e293b' : 'linear-gradient(135deg, #10b981, #059669)',
                                                    color: (seeding || clearing) ? '#94a3b8' : '#fff',
                                                    cursor: (seeding || clearing) ? 'not-allowed' : 'pointer',
                                                    boxShadow: (seeding || clearing) ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {seeding ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Database size={16} />}
                                                {seeding ? 'Seeding Database...' : 'Seed Template Data'}
                                                {seeding && <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>}
                                            </button>

                                            <button
                                                onClick={() => handleClearData(user.uid)}
                                                disabled={seeding || clearing}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    padding: '10px 24px',
                                                    borderRadius: '10px',
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    border: '1px solid rgba(239, 68, 68, 0.4)',
                                                    background: 'transparent',
                                                    color: (seeding || clearing) ? '#475569' : '#ef4444',
                                                    cursor: (seeding || clearing) ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => { if (!seeding && !clearing) { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; } }}
                                                onMouseLeave={(e) => { if (!seeding && !clearing) { e.currentTarget.style.background = 'transparent'; } }}
                                            >
                                                {clearing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
                                                {clearing ? 'Wiping Database...' : 'Erase All Data'}
                                            </button>
                                        </div>

                                        {statusMessage.text && (
                                            <div style={{
                                                marginTop: '16px',
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                fontSize: '13px',
                                                color: statusMessage.type === 'success' ? '#4ade80' : statusMessage.type === 'error' ? '#f87171' : '#22d3ee'
                                            }}>
                                                {statusMessage.type === 'success' && <CheckCircle2 size={16} />}
                                                {statusMessage.type === 'error' && <AlertCircle size={16} />}
                                                {statusMessage.text}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                    <VoiceAssistant />
                </div>
            )}
        </AuthGuard>
    );
}
