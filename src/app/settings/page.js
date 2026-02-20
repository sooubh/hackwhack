'use client';
import { useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useTheme } from '@/contexts/ThemeContext';
import { seedDummyDataToFirebase, clearFirebaseDatabase } from '@/services/dataSeeder';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { theme: t } = useTheme();
    const [seeding, setSeeding] = useState(false);
    const [clearing, setClearing] = useState(false);

    const handleSeed = async (userId) => {
        setSeeding(true);
        try {
            await seedDummyDataToFirebase(userId);
            toast.success('Database seeded with India supply chain data!');
        } catch (err) { toast.error('Seeding failed: ' + err.message); }
        finally { setSeeding(false); }
    };

    const handleClear = async (userId) => {
        setClearing(true);
        try {
            await clearFirebaseDatabase(userId);
            toast.success('Database cleared successfully!');
        } catch (err) { toast.error('Clear failed: ' + err.message); }
        finally { setClearing(false); }
    };

    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, color: t.text }}>
                    <Sidebar />
                    <main style={{ flex: 1, padding: '32px', overflowY: 'auto', height: '100vh' }}>
                        <TopBar user={user} title="Settings" subtitle="Database management and configuration" />

                        <div style={{ maxWidth: '700px' }}>
                            {/* Seed Data */}
                            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.heading, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="material-icons-outlined" style={{ color: t.primary }}>cloud_upload</span> Seed Database
                                </h2>
                                <p style={{ fontSize: '14px', color: t.textSecondary, marginBottom: '16px' }}>Load India supply chain data (12 nodes, 15 routes, 5 events, 5 alerts) into your Firebase database.</p>
                                <button onClick={() => handleSeed(user.uid)} disabled={seeding} style={{ padding: '10px 20px', background: t.primary, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: seeding ? 'not-allowed' : 'pointer', opacity: seeding ? 0.7 : 1 }}>
                                    {seeding ? 'Seeding...' : 'Seed India Data'}
                                </button>
                            </div>

                            {/* Clear Data */}
                            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.heading, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="material-icons-outlined" style={{ color: t.danger }}>delete_forever</span> Clear Database
                                </h2>
                                <p style={{ fontSize: '14px', color: t.textSecondary, marginBottom: '16px' }}>Remove all supply chain data from your database. This cannot be undone.</p>
                                <button onClick={() => handleClear(user.uid)} disabled={clearing} style={{ padding: '10px 20px', background: t.danger, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: clearing ? 'not-allowed' : 'pointer', opacity: clearing ? 0.7 : 1 }}>
                                    {clearing ? 'Clearing...' : 'Clear All Data'}
                                </button>
                            </div>

                            {/* Info */}
                            <div style={{ background: t.infoBg, border: `1px solid ${t.infoBorder}`, borderRadius: '16px', padding: '20px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 700, color: t.info, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span className="material-icons-outlined" style={{ fontSize: '18px' }}>info</span> About AI Predictions
                                </h3>
                                <p style={{ fontSize: '13px', color: t.textSecondary, lineHeight: 1.5, margin: 0 }}>
                                    AI predictions are generated using your supply chain data — no external API required.
                                    The engine analyzes node risk, order delays, route efficiency, and active events to provide actionable suggestions.
                                    If a Gemini API key is configured, the chatbot will use it for conversational queries.
                                </p>
                            </div>
                        </div>
                    </main>
                    <VoiceAssistant />
                </div>
            )}
        </AuthGuard>
    );
}
