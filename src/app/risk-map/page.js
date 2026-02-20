'use client';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useTheme } from '@/contexts/ThemeContext';

export default function RiskMapPage() {
    const { theme: t } = useTheme();
    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, color: t.text }}>
                    <Sidebar />
                    <main style={{ flex: 1, padding: '32px', overflowY: 'auto', height: '100vh' }}>
                        <TopBar user={user} title="Supply Chain Map" subtitle="Visual map of your India supply network" />
                        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center', color: t.textMuted }}>
                                <span className="material-icons-outlined" style={{ fontSize: '64px', opacity: 0.3, display: 'block', marginBottom: '12px' }}>map</span>
                                <h3 style={{ color: t.textSecondary, fontWeight: 700, marginBottom: '8px' }}>India Supply Chain Network</h3>
                                <p style={{ fontSize: '14px' }}>12 nodes across 5 regions • 15 active routes</p>
                                <p style={{ fontSize: '13px', color: t.textMuted, marginTop: '8px' }}>Map visualization loads with Leaflet when available</p>
                            </div>
                        </div>
                    </main>
                    <VoiceAssistant />
                </div>
            )}
        </AuthGuard>
    );
}
