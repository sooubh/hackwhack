'use client';
import { useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useTheme } from '@/contexts/ThemeContext';
import { useData } from '@/contexts/DataContext';
import { calculateNodeRisk, getNetworkStats } from '@/services/riskEngine';

// Approximate coordinates for Indian cities (scaled to fit SVG viewBox 0-500)
const cityCoords = {
    'Mumbai': { x: 130, y: 310 },
    'Delhi': { x: 200, y: 120 },
    'Chennai': { x: 220, y: 400 },
    'Kolkata': { x: 340, y: 230 },
    'Bangalore': { x: 190, y: 390 },
    'Hyderabad': { x: 200, y: 340 },
    'Ahmedabad': { x: 120, y: 220 },
    'Pune': { x: 145, y: 320 },
    'Jaipur': { x: 175, y: 160 },
    'Lucknow': { x: 250, y: 160 },
    'Visakhapatnam': { x: 260, y: 330 },
    'Cochin': { x: 170, y: 440 },
    'Guwahati': { x: 375, y: 155 },
    'Ludhiana': { x: 185, y: 100 },
    'Nagpur': { x: 210, y: 270 },
    'Indore': { x: 170, y: 245 },
    'JNPT': { x: 128, y: 315 },
    'Mundra': { x: 95, y: 225 },
};

function getCoords(name) {
    // Try exact match first, then partial match
    if (cityCoords[name]) return cityCoords[name];
    const key = Object.keys(cityCoords).find(k => name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase().split(' ')[0]));
    if (key) return cityCoords[key];
    // Fallback: hash position
    let h = 0;
    for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
    return { x: 100 + Math.abs(h % 300), y: 100 + Math.abs((h >> 8) % 350) };
}

export default function RiskMapPage() {
    const { theme: t } = useTheme();
    const { nodes, events, routes } = useData();
    const [hoveredNode, setHoveredNode] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    const nodesWithRisk = useMemo(() => {
        if (!nodes) return [];
        return nodes.map(n => {
            const rd = calculateNodeRisk(n, events);
            return { ...n, ...rd, coords: getCoords(n.name) };
        }).sort((a, b) => b.score - a.score);
    }, [nodes, events]);

    const stats = useMemo(() => {
        if (!nodes) return { high: 0, medium: 0, low: 0, avg: 0 };
        return getNetworkStats(nodes, events || []);
    }, [nodes, events]);

    const riskColor = (score) => score >= 70 ? t.danger : score >= 35 ? t.warning : t.success;
    const typeIcon = (type) => ({ factory: 'factory', port: 'directions_boat', warehouse: 'warehouse', hub: 'hub', distribution: 'local_shipping' }[type?.toLowerCase()] || 'location_on');

    const detail = selectedNode || hoveredNode;

    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, color: t.text }}>
                    <Sidebar />
                    <main style={{ flex: 1, padding: '32px', overflowY: 'auto', height: '100vh' }}>
                        <TopBar user={user} title="Supply Chain Map" subtitle="India supply network — nodes, routes & risk visualization" />

                        {/* Stats bar */}
                        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                            {[
                                { label: 'Total Nodes', value: nodesWithRisk.length, icon: 'hub', color: t.primary },
                                { label: 'Active Routes', value: routes?.length || 0, icon: 'alt_route', color: t.info },
                                { label: 'High Risk', value: stats.high, icon: 'warning', color: t.danger },
                                { label: 'Medium Risk', value: stats.medium, icon: 'error_outline', color: t.warning },
                                { label: 'Low Risk', value: stats.low, icon: 'check_circle', color: t.success },
                            ].map((s, i) => (
                                <div key={i} style={{ flex: 1, background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="material-icons-outlined" style={{ color: s.color, fontSize: '22px' }}>{s.icon}</span>
                                    <div>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: t.heading }}>{s.value}</div>
                                        <div style={{ fontSize: '11px', color: t.textMuted }}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
                            {/* Map */}
                            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '20px', position: 'relative', minHeight: '520px' }}>
                                <svg viewBox="40 60 380 420" style={{ width: '100%', height: '100%' }}>
                                    {/* Routes */}
                                    {(routes || []).map((route, i) => {
                                        const from = nodesWithRisk.find(n => n.id === route.from);
                                        const to = nodesWithRisk.find(n => n.id === route.to);
                                        if (!from || !to) return null;
                                        return (
                                            <line key={i}
                                                x1={from.coords.x} y1={from.coords.y}
                                                x2={to.coords.x} y2={to.coords.y}
                                                stroke={t.border} strokeWidth="1.2" strokeDasharray="4,3" opacity="0.6" />
                                        );
                                    })}
                                    {/* Nodes */}
                                    {nodesWithRisk.map(node => {
                                        const isHovered = hoveredNode?.id === node.id;
                                        const isSelected = selectedNode?.id === node.id;
                                        const r = isHovered || isSelected ? 12 : 8;
                                        const col = riskColor(node.score);
                                        return (
                                            <g key={node.id}
                                                onMouseEnter={() => setHoveredNode(node)}
                                                onMouseLeave={() => setHoveredNode(null)}
                                                onClick={() => setSelectedNode(node.id === selectedNode?.id ? null : node)}
                                                style={{ cursor: 'pointer' }}>
                                                {/* Pulse ring for high risk */}
                                                {node.score >= 70 && (
                                                    <circle cx={node.coords.x} cy={node.coords.y} r="16" fill="none" stroke={t.danger} strokeWidth="1.5" opacity="0.4">
                                                        <animate attributeName="r" values="10;20;10" dur="2s" repeatCount="indefinite" />
                                                        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
                                                    </circle>
                                                )}
                                                <circle cx={node.coords.x} cy={node.coords.y} r={r} fill={col} opacity="0.2" />
                                                <circle cx={node.coords.x} cy={node.coords.y} r={r * 0.65} fill={col} />
                                                {(isHovered || isSelected) && (
                                                    <text x={node.coords.x} y={node.coords.y - 16} textAnchor="middle" fontSize="10" fontWeight="700" fill={t.heading}>
                                                        {node.name}
                                                    </text>
                                                )}
                                            </g>
                                        );
                                    })}
                                </svg>
                                {/* Legend */}
                                <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '14px', fontSize: '11px', color: t.textMuted }}>
                                    {[{ c: t.danger, l: 'High Risk' }, { c: t.warning, l: 'Medium' }, { c: t.success, l: 'Low' }].map(it => (
                                        <div key={it.l} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: it.c }} /> {it.l}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Node List + Detail */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Detail card */}
                                {detail && (
                                    <div style={{ background: t.bgCard, border: `1px solid ${riskColor(detail.score)}40`, borderRadius: '16px', padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                    <span className="material-icons-outlined" style={{ fontSize: '18px', color: riskColor(detail.score) }}>{typeIcon(detail.type)}</span>
                                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: t.heading, margin: 0 }}>{detail.name}</h3>
                                                </div>
                                                <div style={{ fontSize: '12px', color: t.textMuted }}>{detail.type} • {detail.region}</div>
                                            </div>
                                            <div style={{ padding: '6px 12px', borderRadius: '10px', background: `${riskColor(detail.score)}15`, textAlign: 'center' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 800, color: riskColor(detail.score) }}>{detail.score}</div>
                                                <div style={{ fontSize: '9px', fontWeight: 700, color: t.textMuted }}>RISK</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                            <div style={{ padding: '8px 12px', borderRadius: '8px', background: t.bg, border: `1px solid ${t.border}` }}>
                                                <div style={{ fontSize: '10px', color: t.textMuted, fontWeight: 700 }}>Reliability</div>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: t.heading }}>{detail.reliability}%</div>
                                            </div>
                                            <div style={{ padding: '8px 12px', borderRadius: '8px', background: t.bg, border: `1px solid ${t.border}` }}>
                                                <div style={{ fontSize: '10px', color: t.textMuted, fontWeight: 700 }}>Category</div>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: riskColor(detail.score), textTransform: 'capitalize' }}>{detail.category}</div>
                                            </div>
                                        </div>
                                        {(detail.factors || []).length > 0 && (
                                            <div>
                                                <div style={{ fontSize: '11px', fontWeight: 700, color: t.textMuted, marginBottom: '6px' }}>Risk Factors</div>
                                                {detail.factors.map((f, i) => (
                                                    <div key={i} style={{ fontSize: '12px', color: t.textSecondary, padding: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ color: t.warning }}>⚠</span> {f}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Scrollable node list */}
                                <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '16px', flex: 1, overflowY: 'auto', maxHeight: detail ? '300px' : '480px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: t.heading, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span className="material-icons-outlined" style={{ fontSize: '16px', color: t.primary }}>list</span> All Nodes
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {nodesWithRisk.map(node => {
                                            const active = selectedNode?.id === node.id;
                                            return (
                                                <div key={node.id} onClick={() => setSelectedNode(active ? null : node)}
                                                    onMouseEnter={() => setHoveredNode(node)} onMouseLeave={() => setHoveredNode(null)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', border: active ? `1px solid ${t.primaryBorder}` : '1px solid transparent', background: active ? t.primaryBg : 'transparent' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: riskColor(node.score), flexShrink: 0 }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '13px', fontWeight: 600, color: t.heading }}>{node.name}</div>
                                                        <div style={{ fontSize: '11px', color: t.textMuted }}>{node.type} • {node.region}</div>
                                                    </div>
                                                    <div style={{ fontSize: '12px', fontWeight: 800, color: riskColor(node.score) }}>{node.score}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                    <VoiceAssistant />
                </div>
            )}
        </AuthGuard>
    );
}
