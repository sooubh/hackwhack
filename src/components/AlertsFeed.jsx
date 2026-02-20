'use client';
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { db } from '@/services/firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function AlertsFeed({ user, maxItems }) {
    const { alerts } = useData();
    const { theme: t } = useTheme();
    const [simulating, setSimulating] = useState(false);

    let sortedAlerts = [...(alerts || [])].sort((a, b) => {
        if (a.read === b.read) return new Date(b.timestamp) - new Date(a.timestamp);
        return a.read ? 1 : -1;
    });
    if (maxItems) sortedAlerts = sortedAlerts.slice(0, maxItems);
    const unreadCount = sortedAlerts.filter(a => !a.read).length;

    const handleMarkAsRead = async (alertId) => {
        if (!user?.uid) return;
        try {
            await updateDoc(doc(db, `users/${user.uid}/alerts`, alertId), { read: true });
        } catch { toast.error("Failed to update alert."); }
    };

    const handleSimulate = async () => {
        if (!user?.uid) return;
        setSimulating(true);
        const disasters = [
            { title: "Monsoon Flooding on NH-8", type: 'weather', severity: 'critical', message: "Heavy flooding between Ahmedabad and Mumbai. Road freight suspended 48h.", source: 'IMD Alert' },
            { title: "Truck Strike — North India", type: 'geopolitical', severity: 'high', message: "AIMTC indefinite strike. Delhi NCR road freight halted.", source: 'Transport Ministry' },
            { title: "JNPT Port Congestion", type: 'logistics', severity: 'medium', message: "Container dwell time up to 5 days. Divert to Mundra.", source: 'Port Authority' },
        ];
        const pick = disasters[Math.floor(Math.random() * disasters.length)];
        try {
            await addDoc(collection(db, `users/${user.uid}/alerts`), {
                ...pick, id: `evt-${Date.now()}`, timestamp: new Date().toISOString(), read: false, affectedNodes: []
            });
            setTimeout(() => setSimulating(false), 800);
        } catch { toast.error("Simulation failed."); setSimulating(false); }
    };

    const sevStyle = (s) => ({
        critical: { icon: 'gpp_bad', color: t.danger },
        high: { icon: 'warning', color: t.warning },
        medium: { icon: 'info', color: t.info },
        low: { icon: 'check_circle', color: t.success },
    }[s] || { icon: 'info', color: t.textMuted });

    return (
        <div style={{ width: '100%', color: t.text }}>
            {!maxItems && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: t.heading, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Disruption Feed
                            {unreadCount > 0 && <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', background: t.dangerBg, color: t.danger, borderRadius: '8px', border: `1px solid ${t.dangerBorder}` }}>{unreadCount} Unread</span>}
                        </h1>
                        <p style={{ fontSize: '14px', color: t.textMuted, marginTop: '4px' }}>Real-time alerts from AI models and external data.</p>
                    </div>
                    <button onClick={handleSimulate} disabled={simulating} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: t.primary, color: '#fff', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: simulating ? 'not-allowed' : 'pointer', opacity: simulating ? 0.7 : 1 }}>
                        <span className="material-icons-outlined" style={{ fontSize: '16px' }}>{simulating ? 'autorenew' : 'bolt'}</span>
                        {simulating ? 'Injecting...' : 'Simulate Event'}
                    </button>
                </div>
            )}

            {(!alerts || alerts.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px', color: t.textMuted, background: t.bgCard, borderRadius: '14px', border: `1px dashed ${t.border}` }}>
                    <span className="material-icons-outlined" style={{ fontSize: '48px', opacity: 0.3, display: 'block', marginBottom: '10px' }}>shield</span>
                    <h3 style={{ color: t.textSecondary, fontWeight: 700 }}>Network Stable</h3>
                    <p style={{ fontSize: '14px' }}>No alerts. Seed data in Settings or simulate an event.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sortedAlerts.map(alert => {
                        const s = sevStyle(alert.severity);
                        return (
                            <div key={alert.id} style={{ borderRadius: '12px', padding: '18px', display: 'flex', gap: '14px', background: alert.read ? t.bgHover : t.bgCard, border: `1px solid ${t.border}`, opacity: alert.read ? 0.65 : 1 }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${s.color}12`, color: s.color }}>
                                    <span className="material-icons-outlined" style={{ fontSize: '20px' }}>{s.icon}</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: alert.read ? t.textSecondary : t.heading, margin: 0 }}>{alert.title}</h3>
                                        <span style={{ fontSize: '11px', color: t.textMuted }}>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: t.textSecondary, lineHeight: 1.5, margin: '0 0 12px' }}>{alert.message}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `1px solid ${t.border}` }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: t.textSecondary, background: t.bgHover, padding: '2px 8px', borderRadius: '6px' }}>{alert.type}</span>
                                        {!alert.read ? (
                                            <button onClick={() => handleMarkAsRead(alert.id)} style={{ fontSize: '12px', fontWeight: 600, background: 'none', border: `1px solid ${t.border}`, color: t.textSecondary, padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span className="material-icons-outlined" style={{ fontSize: '14px' }}>check_circle</span> Acknowledge
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '11px', color: t.success, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span className="material-icons-outlined" style={{ fontSize: '14px' }}>check_circle</span> Done
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
