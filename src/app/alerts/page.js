'use client';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import AlertsFeed from '@/components/AlertsFeed';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useTheme } from '@/contexts/ThemeContext';

export default function AlertsPage() {
    const { theme: t } = useTheme();
    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, color: t.text }}>
                    <Sidebar />
                    <main style={{ flex: 1, padding: '32px', overflowY: 'auto', height: '100vh' }}>
                        <TopBar user={user} title="Alerts" subtitle="Real-time supply chain disruption alerts" />
                        <AlertsFeed user={user} />
                    </main>
                    <VoiceAssistant />
                </div>
            )}
        </AuthGuard>
    );
}
