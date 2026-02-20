'use client';
// src/app/alerts/page.js
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import AlertsFeed from '@/components/AlertsFeed';
import VoiceAssistant from '@/components/VoiceAssistant';
import { alerts } from '@/data/alerts';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const severityCounts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
};

export default function AlertsPage() {
    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14' }}>
                    <Sidebar />
                    <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <TopBar user={user} />
                        <main style={{ padding: '24px', flex: 1 }}>
                            {/* Header */}
                            <div style={{ marginBottom: '24px' }}>
                                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>
                                    Disruption Alerts
                                </h1>
                                <p style={{ fontSize: '13px', color: '#475569' }}>
                                    {alerts.filter(a => !a.read).length} unread · {alerts.length} total alerts
                                </p>
                            </div>

                            {/* Summary cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                                {[
                                    { label: 'Critical', count: severityCounts.critical, color: '#ef4444', icon: AlertTriangle },
                                    { label: 'High', count: severityCounts.high, color: '#f97316', icon: AlertTriangle },
                                    { label: 'Medium', count: severityCounts.medium, color: '#f59e0b', icon: Info },
                                    { label: 'Low', count: severityCounts.low, color: '#22c55e', icon: CheckCircle },
                                ].map(({ label, count, color, icon: Icon }) => (
                                    <div key={label} style={{
                                        background: '#111827',
                                        border: `1px solid ${color}30`,
                                        borderRadius: '12px',
                                        padding: '16px',
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                    }}>
                                        <div style={{
                                            width: '36px', height: '36px',
                                            borderRadius: '8px',
                                            background: `${color}15`,
                                            border: `1px solid ${color}30`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Icon size={16} color={color} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '20px', fontWeight: 800, color }}>{count}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* All alerts */}
                            <div style={{
                                background: '#111827',
                                border: '1px solid rgba(99,179,237,0.12)',
                                borderRadius: '16px',
                                padding: '20px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                    <Bell size={16} color="#22d3ee" />
                                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>All Alerts</h2>
                                </div>
                                <AlertsFeed alerts={alerts} maxItems={alerts.length} />
                            </div>
                        </main>
                    </div>
                    <VoiceAssistant />
                </div>
            )}
        </AuthGuard>
    );
}
