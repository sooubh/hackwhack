'use client';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import PredictionsDashboard from '@/components/PredictionsDashboard';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useTheme } from '@/contexts/ThemeContext';

export default function PredictionsPage() {
    const { theme: t } = useTheme();
    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, color: t.text }}>
                    <Sidebar />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
                        <div style={{ padding: '32px 32px 0' }}>
                            <TopBar user={user} title="AI Predictions" subtitle="Per-node analysis, order delays, route optimization" />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <PredictionsDashboard />
                        </div>
                    </div>
                    <VoiceAssistant />
                </div>
            )}
        </AuthGuard>
    );
}
