'use client';
// src/components/AlertsFeed.jsx
import { AlertTriangle, Info, Zap, XCircle, CheckCircle } from 'lucide-react';

const severityConfig = {
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', icon: XCircle },
    high: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)', icon: AlertTriangle },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: Zap },
    low: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', icon: Info },
};

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function AlertsFeed({ alerts, maxItems = 5 }) {
    const shown = alerts.slice(0, maxItems);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {shown.map(alert => {
                const config = severityConfig[alert.severity] || severityConfig.low;
                const Icon = config.icon;
                return (
                    <div
                        key={alert.id}
                        style={{
                            display: 'flex',
                            gap: '12px',
                            padding: '14px',
                            background: alert.read ? 'rgba(255,255,255,0.02)' : config.bg,
                            border: `1px solid ${alert.read ? 'rgba(255,255,255,0.06)' : config.border}`,
                            borderRadius: '12px',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                    >
                        {/* Severity icon */}
                        <div style={{
                            width: '32px', height: '32px',
                            borderRadius: '8px',
                            background: config.bg,
                            border: `1px solid ${config.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <Icon size={14} color={config.color} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '13px', fontWeight: alert.read ? 400 : 600, color: alert.read ? '#94a3b8' : '#f1f5f9', lineHeight: 1.3 }}>
                                    {alert.title}
                                </span>
                                <span style={{ fontSize: '11px', color: '#475569', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                    {timeAgo(alert.timestamp)}
                                </span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {alert.message}
                            </p>
                        </div>

                        {/* Unread dot */}
                        {!alert.read && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.color, flexShrink: 0, marginTop: '4px', boxShadow: `0 0 6px ${config.color}` }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
