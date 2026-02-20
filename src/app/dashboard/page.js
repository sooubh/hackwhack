'use client';
// src/app/dashboard/page.js
import { useState } from 'react';
import { Activity, AlertTriangle, Network, Clock, Map } from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import KpiCard from '@/components/KpiCard';
import AlertsFeed from '@/components/AlertsFeed';
import VoiceAssistant from '@/components/VoiceAssistant';
import { nodes } from '@/data/supplyChain';
import { alerts } from '@/data/alerts';
import { getNetworkStats, calculateNodeRisk } from '@/services/riskEngine';
import { events } from '@/data/events';

const stats = getNetworkStats(nodes);

// Risk distribution bar
function RiskBar({ label, count, total, color }) {
    return (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color }}>
                    {count} nodes ({Math.round(count / total * 100)}%)
                </span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                <div style={{ width: `${count / total * 100}%`, height: '100%', background: color, borderRadius: '3px', boxShadow: `0 0 8px ${color}` }} />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14' }}>
                    <Sidebar />

                    <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <TopBar user={user} />

                        <main style={{ padding: '28px', flex: 1 }}>
                            {/* Page header */}
                            <div style={{ marginBottom: '28px' }}>
                                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>
                                    Supply Chain Dashboard
                                </h1>
                                <p style={{ fontSize: '13px', color: '#475569' }}>
                                    Real-time overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>

                            {/* KPI Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                                <KpiCard
                                    title="Total Nodes"
                                    value={nodes.length}
                                    icon={Network}
                                    color="#22d3ee"
                                    trend="up"
                                    trendValue="+2 this month"
                                />
                                <KpiCard
                                    title="Active Alerts"
                                    value={alerts.filter(a => !a.read).length}
                                    icon={AlertTriangle}
                                    color="#ef4444"
                                    trend="up"
                                    trendValue="3 unread"
                                />
                                <KpiCard
                                    title="Avg Risk Score"
                                    value={stats.avg}
                                    icon={Activity}
                                    color={stats.avg >= 66 ? '#ef4444' : stats.avg >= 33 ? '#f59e0b' : '#22c55e'}
                                    trend="down"
                                    trendValue="↑ from 38 last week"
                                />
                                <KpiCard
                                    title="High Risk Events"
                                    value={events.filter(e => e.severity === 'high').length}
                                    icon={Clock}
                                    color="#f97316"
                                    trend="up"
                                    trendValue="Active now"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                {/* Alerts feed */}
                                <div style={{
                                    background: '#111827',
                                    border: '1px solid rgba(99,179,237,0.12)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>Recent Alerts</h2>
                                        <Link href="/alerts" style={{ fontSize: '12px', color: '#22d3ee', textDecoration: 'none' }}>View all →</Link>
                                    </div>
                                    <AlertsFeed alerts={alerts} maxItems={4} />
                                </div>

                                {/* Risk distribution & events */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Risk distribution */}
                                    <div style={{
                                        background: '#111827',
                                        border: '1px solid rgba(99,179,237,0.12)',
                                        borderRadius: '16px',
                                        padding: '20px',
                                    }}>
                                        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px' }}>Risk Distribution</h2>
                                        <RiskBar label="High Risk" count={stats.high} total={nodes.length} color="#ef4444" />
                                        <RiskBar label="Medium Risk" count={stats.medium} total={nodes.length} color="#f59e0b" />
                                        <RiskBar label="Low Risk" count={stats.low} total={nodes.length} color="#22c55e" />
                                    </div>

                                    {/* Quick access map link */}
                                    <Link href="/risk-map" style={{ textDecoration: 'none' }}>
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(139,92,246,0.1))',
                                            border: '1px solid rgba(34,211,238,0.2)',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            display: 'flex', alignItems: 'center', gap: '14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                            <div style={{
                                                width: '44px', height: '44px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <Map size={20} color="#fff" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>
                                                    Open Risk Map
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    View live network with {nodes.length} nodes & routes
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* Active events list */}
                            <div style={{
                                background: '#111827',
                                border: '1px solid rgba(99,179,237,0.12)',
                                borderRadius: '16px',
                                padding: '20px',
                            }}>
                                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px' }}>Active Disruption Events</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    {events.map(ev => (
                                        <div key={ev.id} style={{
                                            padding: '14px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${ev.severity === 'high' ? 'rgba(239,68,68,0.25)' : ev.severity === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.15)'}`,
                                            borderRadius: '10px',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <span style={{
                                                    fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
                                                    background: ev.severity === 'high' ? 'rgba(239,68,68,0.15)' : ev.severity === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                                                    color: ev.severity === 'high' ? '#ef4444' : ev.severity === 'medium' ? '#f59e0b' : '#22c55e',
                                                    fontWeight: 600, textTransform: 'uppercase',
                                                }}>
                                                    {ev.severity}
                                                </span>
                                                <span style={{ fontSize: '11px', color: '#475569' }}>{ev.type}</span>
                                            </div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{ev.title}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>{ev.description}</div>
                                        </div>
                                    ))}
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
