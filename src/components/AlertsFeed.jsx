'use client';
// src/components/AlertsFeed.jsx
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { db } from '@/services/firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { AlertCircle, AlertTriangle, ShieldAlert, CheckCircle2, Zap, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AlertsFeed({ user }) {
    const { alerts } = useData();
    const [simulating, setSimulating] = useState(false);

    // Sort alerts: unread first, then by timestamp
    const sortedAlerts = [...(alerts || [])].sort((a, b) => {
        if (a.read === b.read) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        }
        return a.read ? 1 : -1;
    });

    const unreadCount = sortedAlerts.filter(a => !a.read).length;

    const handleMarkAsRead = async (alertId) => {
        if (!user?.uid) return;
        try {
            await updateDoc(doc(db, `users/${user.uid}/alerts`, alertId), {
                read: true
            });
        } catch (err) {
            console.error("Error updating alert", err);
            toast.error("Failed to update alert status.");
        }
    };

    const handleSimulateDisaster = async () => {
        if (!user?.uid) return;
        setSimulating(true);

        const disasters = [
            { title: "Typhoon Approaching Shanghai", type: 'weather', severity: 'critical', message: "A Category 4 Typhoon is projected to hit Shanghai Port within 48 hours. Expect immediate port closure.", source: 'Global Weather API' },
            { title: "Suez Canal Blockage Reports", type: 'logistics', severity: 'high', message: "Unconfirmed reports of a grounded vessel in the Suez Canal. Traffic is piling up rapidly.", source: 'Maritime Traffic Grid' },
            { title: "Labor Strike at Rotterdam", type: 'geopolitical', severity: 'high', message: "Dockworkers commenced a sudden 72-hour strike. Freight loading capacity reduced by 85%.", source: 'Geopolitical News Feed' },
            { title: "Sudden Customs Delay", type: 'logistics', severity: 'medium', message: "Customs processing at US West Coast ports is facing unprecedented backlogs due to system failure.", source: 'Logistics Network' }
        ];

        const randomDisaster = disasters[Math.floor(Math.random() * disasters.length)];

        const newAlert = {
            ...randomDisaster,
            id: `evt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            read: false,
            affectedNodes: ['node-1', 'node-2'] // Simple mock
        };

        try {
            // Write directly to the tenant's live isolated database
            await addDoc(collection(db, `users/${user.uid}/alerts`), newAlert);
            // We intentionally don't emit a toast here, because TopBar.jsx's onSnapshot listener will catch it globally 
            // and trigger the Toast automatically!
            setTimeout(() => setSimulating(false), 800);
        } catch (err) {
            console.error("Failed to inject alert", err);
            toast.error("Simulation engine failed.");
            setSimulating(false);
        }
    };

    const getIcon = (severity) => {
        switch (severity) {
            case 'critical': return <ShieldAlert size={20} color="#ef4444" />;
            case 'high': return <AlertTriangle size={20} color="#f59e0b" />;
            case 'medium': return <AlertCircle size={20} color="#3b82f6" />;
            default: return <AlertCircle size={20} color="#10b981" />;
        }
    };

    return (
        <div style={{ padding: '32px 40px', maxWidth: '1000px', margin: '0 auto', width: '100%', color: '#f1f5f9', height: '100%', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        Live Disruption Feed
                        {unreadCount > 0 && (
                            <span style={{ fontSize: '13px', fontWeight: 700, padding: '4px 10px', background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '12px' }}>
                                {unreadCount} Unread
                            </span>
                        )}
                    </h1>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                        Real-time alerts triggered by predictive models and external telemetry data.
                    </p>
                </div>

                <button
                    onClick={handleSimulateDisaster}
                    disabled={simulating}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: simulating ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                        opacity: simulating ? 0.7 : 1,
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Zap size={16} fill="#fff" />
                    {simulating ? 'Injecting Chaos...' : 'Simulate Disruption Event'}
                </button>
            </div>

            {alerts && alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 0', color: '#64748b' }}>
                    <ShieldAlert size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: '#94a3b8' }}>Network is Stable</h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>No alerts have been recorded. You can seed data in settings or trigger a simulation above.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '60px' }}>
                    {sortedAlerts.map(alert => (
                        <div key={alert.id} style={{
                            background: alert.read ? 'rgba(30, 41, 59, 0.4)' : 'rgba(30, 41, 59, 0.9)',
                            border: `1px solid ${alert.read ? 'rgba(255,255,255,0.05)' : (alert.severity === 'critical' ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)')}`,
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            gap: '20px',
                            transition: 'all 0.3s ease',
                            opacity: alert.read ? 0.6 : 1,
                            boxShadow: alert.read ? 'none' : '0 10px 30px rgba(0,0,0,0.3)',
                        }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                                background: alert.severity === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {getIcon(alert.severity)}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: alert.read ? '#cbd5e1' : '#fff' }}>
                                        {alert.title}
                                    </h3>
                                    <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} />
                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(alert.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
                                    {alert.message}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#cbd5e1', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                            {alert.type}
                                        </span>
                                        <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={11} /> Source: {alert.source || 'SupplyGuard System'}
                                        </span>
                                    </div>

                                    {!alert.read ? (
                                        <button
                                            onClick={() => handleMarkAsRead(alert.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                background: 'transparent',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: '#e2e8f0',
                                                padding: '6px 16px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                                        >
                                            <CheckCircle2 size={14} /> Acknowledge
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle2 size={14} color="#10b981" /> Acknowledged
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
