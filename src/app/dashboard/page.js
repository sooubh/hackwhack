'use client';
// src/app/dashboard/page.js
import { useMemo } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import KpiCard from '@/components/KpiCard';
import AlertsFeed from '@/components/AlertsFeed';
import VoiceAssistant from '@/components/VoiceAssistant';
import { getNetworkStats, calculateNodeRisk } from '@/services/riskEngine';
import { generatePredictions } from '@/services/predictionEngine';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { orders as staticOrders } from '@/data/orders';

function OrderRow({ order, allNodes, t }) {
    const statusColors = { on_schedule: t.success, delayed: t.danger, at_risk: t.warning, in_transit: t.info };
    const col = statusColors[order.status] || t.textMuted;
    const originNode = allNodes?.find(n => n.id === order.origin);
    const destNode = allNodes?.find(n => n.id === order.destination);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: `1px solid ${t.border}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: t.textMuted, fontFamily: 'monospace' }}>{order.id}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: `${col}15`, color: col, textTransform: 'uppercase' }}>{order.status.replace('_', ' ')}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: t.heading }}>{order.name}</div>
                <div style={{ fontSize: '12px', color: t.textMuted }}>
                    {originNode?.name || order.origin} → {destNode?.name || order.destination}
                </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: order.delayDays > 0 ? t.danger : t.success }}>
                    {order.delayDays > 0 ? `+${order.delayDays}d` : 'On Time'}
                </div>
                <div style={{ fontSize: '12px', color: t.textMuted }}>{order.value}</div>
            </div>
            <div style={{ width: '80px', flexShrink: 0 }}>
                <div style={{ height: '4px', background: t.border, borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${order.progress}%`, background: col, borderRadius: '99px' }} />
                </div>
                <div style={{ fontSize: '10px', color: t.textMuted, textAlign: 'center', marginTop: '4px' }}>{order.progress}%</div>
            </div>
        </div>
    );
}

function RiskBar({ label, count, total, color, t }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: t.textSecondary, fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color }}>{count} ({pct}%)</span>
            </div>
            <div style={{ height: '6px', background: t.border, borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { nodes, events, alerts, routes, loading } = useData();
    const { theme: t } = useTheme();

    if (loading) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', border: `4px solid ${t.border}`, borderTopColor: t.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <p style={{ fontWeight: 700, fontSize: '14px', color: t.primary }}>Loading Dashboard</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    const stats = getNetworkStats(nodes || [], events || []);
    const unreadAlerts = alerts?.filter(a => !a.read).length || 0;
    const delayedOrders = staticOrders.filter(o => o.delayDays > 0);

    // AI preview: analyze the highest-risk node
    const aiPreview = useMemo(() => {
        if (!nodes || nodes.length === 0) return null;
        const topNode = [...nodes].sort((a, b) => calculateNodeRisk(b, events).score - calculateNodeRisk(a, events).score)[0];
        if (!topNode) return null;
        const rd = calculateNodeRisk(topNode, events);
        try {
            const analysis = generatePredictions(topNode, rd, events, nodes, routes, staticOrders);
            return { node: topNode, riskData: rd, ...analysis };
        } catch { return null; }
    }, [nodes, events, routes]);

    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: "'Inter', sans-serif", color: t.text }}>
                    <Sidebar />
                    <main style={{ flex: 1, padding: '32px', overflowY: 'auto', height: '100vh' }}>
                        <TopBar user={user} title="Supply Chain Dashboard" subtitle="Manage orders, track shipments & monitor your network" />

                        {/* KPIs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
                            <KpiCard title="Active Orders" value={staticOrders.length} icon="inventory_2" colorClass="primary" trendValue={`${delayedOrders.length} delayed`} trend="up" />
                            <KpiCard title="Network Nodes" value={nodes?.length || 0} icon="hub" colorClass="info" subtitle={`${stats.high} at risk`} />
                            <KpiCard title="Unread Alerts" value={unreadAlerts} icon="notifications_active" colorClass={unreadAlerts > 0 ? 'danger' : 'success'} trendValue={unreadAlerts > 0 ? 'Action needed' : 'All clear'} trend={unreadAlerts > 0 ? 'up' : 'down'} />
                            <KpiCard title="Avg Risk Score" value={`${stats.avg}/100`} icon="speed" colorClass={stats.avg >= 66 ? 'danger' : stats.avg >= 33 ? 'warning' : 'success'} subtitle={stats.avg >= 50 ? 'Elevated' : 'Normal'} />
                        </div>

                        {/* Orders + Risk */}
                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', marginBottom: '28px' }}>
                            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.heading, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="material-icons-outlined" style={{ color: t.primary, fontSize: '20px' }}>local_shipping</span> Active Orders
                                    </h2>
                                    <Link href="/predictions" style={{ fontSize: '12px', color: t.primary, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        AI Analysis <span className="material-icons-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                                    </Link>
                                </div>
                                {staticOrders.map(order => (
                                    <OrderRow key={order.id} order={order} allNodes={nodes} t={t} />
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px' }}>
                                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: t.heading, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="material-icons-outlined" style={{ color: t.warning, fontSize: '20px' }}>donut_large</span> Risk Distribution
                                    </h2>
                                    <RiskBar label="High Risk" count={stats.high} total={nodes?.length || 0} color={t.danger} t={t} />
                                    <RiskBar label="Medium Risk" count={stats.medium} total={nodes?.length || 0} color={t.warning} t={t} />
                                    <RiskBar label="Low Risk" count={stats.low} total={nodes?.length || 0} color={t.success} t={t} />
                                </div>

                                <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px' }}>
                                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: t.heading, margin: '0 0 16px' }}>Quick Actions</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {[
                                            { href: '/predictions', icon: 'auto_awesome', label: 'AI Predictions & Analysis', color: t.primary },
                                            { href: '/risk-map', icon: 'map', label: 'View Supply Chain Map', color: t.info },
                                            { href: '/alerts', icon: 'warning', label: `Manage Alerts (${unreadAlerts})`, color: t.danger },
                                        ].map(a => (
                                            <Link key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: `${a.color}08`, border: `1px solid ${a.color}20`, borderRadius: '12px', textDecoration: 'none', color: t.text, fontSize: '14px', fontWeight: 500 }}>
                                                <span className="material-icons-outlined" style={{ color: a.color, fontSize: '20px' }}>{a.icon}</span>
                                                <span>{a.label}</span>
                                                <span className="material-icons-outlined" style={{ marginLeft: 'auto', fontSize: '16px', color: t.textMuted }}>arrow_forward</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Analysis Preview */}
                        {aiPreview && (
                            <div style={{ background: t.primaryBg, border: `1px solid ${t.primaryBorder}`, borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.heading, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="material-icons-outlined" style={{ color: t.primary, fontSize: '20px' }}>auto_awesome</span> AI Analysis — {aiPreview.node?.name}
                                    </h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: aiPreview.healthScore >= 70 ? t.successBg : aiPreview.healthScore >= 40 ? t.warningBg : t.dangerBg, color: aiPreview.healthScore >= 70 ? t.success : aiPreview.healthScore >= 40 ? t.warning : t.danger, border: `1px solid ${aiPreview.healthScore >= 70 ? t.successBorder : aiPreview.healthScore >= 40 ? t.warningBorder : t.dangerBorder}` }}>
                                            Health: {aiPreview.healthScore}/100
                                        </span>
                                    </div>
                                </div>

                                <p style={{ fontSize: '14px', color: t.text, lineHeight: 1.6, margin: '0 0 16px' }}>{aiPreview.summary}</p>

                                {/* Top delayed orders */}
                                {(aiPreview.orderPredictions || []).length > 0 && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: t.heading, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span className="material-icons-outlined" style={{ fontSize: '16px', color: t.warning }}>local_shipping</span> Delayed Orders
                                        </h3>
                                        {(aiPreview.orderPredictions || []).slice(0, 2).map((o, i) => (
                                            <div key={i} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: t.heading }}>{o.orderName}</div>
                                                    <div style={{ fontSize: '12px', color: t.textMuted, marginTop: '2px' }}>Delay: <b style={{ color: t.danger }}>{o.predictedDelay}</b> • {o.reason}</div>
                                                </div>
                                                <div style={{ background: t.successBg, padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: t.text, maxWidth: '260px', lineHeight: 1.4, border: `1px solid ${t.successBorder}` }}>
                                                    💡 {o.suggestion}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Recommended action */}
                                <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Top Recommendation</div>
                                    <div style={{ fontSize: '13px', color: t.info, fontWeight: 600 }}>{aiPreview.recommendation}</div>
                                </div>

                                <Link href="/predictions" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: t.primary, color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                                    View Full Analysis <span className="material-icons-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                                </Link>
                            </div>
                        )}

                        {/* Recent Alerts */}
                        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.heading, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="material-icons-outlined" style={{ color: t.danger, fontSize: '20px' }}>feed</span> Recent Alerts
                                </h2>
                                <Link href="/alerts" style={{ fontSize: '12px', color: t.primary, fontWeight: 600, textDecoration: 'none' }}>View All</Link>
                            </div>
                            <AlertsFeed maxItems={3} />
                        </div>
                    </main>
                    <VoiceAssistant />
                </div>
            )}
        </AuthGuard>
    );
}
