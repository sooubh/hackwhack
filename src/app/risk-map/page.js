'use client';
// src/app/risk-map/page.js
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Filter, ChevronRight } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import RiskScoreCard from '@/components/RiskScoreCard';
import VoiceAssistant from '@/components/VoiceAssistant';
import { nodeTypes } from '@/data/supplyChain';
import { calculateNodeRisk, getNetworkStats } from '@/services/riskEngine';
import { useData } from '@/contexts/DataContext';

// Leaflet MUST be dynamic (no SSR)
const NetworkMap = dynamic(() => import('@/components/NetworkMap'), {
    ssr: false, loading: () => (
        <div style={{ width: '100%', height: '100%', background: '#0d1424', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '14px' }}>
            Loading map...
        </div>
    )
});

const filters = ['all', 'high', 'medium', 'low'];
const filterColors = { all: '#22d3ee', high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

export default function RiskMapPage() {
    const [selectedNode, setSelectedNode] = useState(null);
    const [filter, setFilter] = useState('all');

    const { nodes, loading } = useData();
    const safeNodes = nodes || [];

    const nodeRisks = useMemo(() => {
        return Object.fromEntries(safeNodes.map(n => [n.id, calculateNodeRisk(n)]));
    }, [safeNodes]);

    if (loading) {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                Loading map data...
            </div>
        );
    }

    const stats = getNetworkStats(safeNodes);

    const filteredNodes = filter === 'all'
        ? safeNodes
        : safeNodes.filter(n => nodeRisks[n.id]?.category.toLowerCase() === filter);

    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', height: '100vh', background: '#070b14', overflow: 'hidden' }}>
                    <Sidebar />

                    <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <TopBar user={user} />

                        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '20px', gap: '20px' }}>
                            {/* Left sidebar: node list */}
                            <div style={{
                                width: '280px',
                                flexShrink: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                overflowY: 'auto',
                            }}>
                                {/* Filter buttons */}
                                <div style={{
                                    background: '#111827',
                                    border: '1px solid rgba(99,179,237,0.12)',
                                    borderRadius: '14px',
                                    padding: '14px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <Filter size={14} color="#475569" />
                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>FILTER BY RISK</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {filters.map(f => (
                                            <button key={f} onClick={() => setFilter(f)} style={{
                                                padding: '5px 10px',
                                                borderRadius: '20px',
                                                border: `1px solid ${filter === f ? filterColors[f] : 'rgba(255,255,255,0.08)'}`,
                                                background: filter === f ? `${filterColors[f]}20` : 'transparent',
                                                color: filter === f ? filterColors[f] : '#64748b',
                                                fontSize: '11px', fontWeight: filter === f ? 600 : 400,
                                                cursor: 'pointer',
                                            }}>
                                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                                {f !== 'all' && <span style={{ marginLeft: '4px' }}>({stats[f]})</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Node list */}
                                <div style={{
                                    background: '#111827',
                                    border: '1px solid rgba(99,179,237,0.12)',
                                    borderRadius: '14px',
                                    padding: '14px',
                                    flex: 1,
                                    overflowY: 'auto',
                                }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '10px' }}>
                                        {filteredNodes.length} NODES
                                    </div>
                                    {filteredNodes
                                        .sort((a, b) => nodeRisks[b.id]?.score - nodeRisks[a.id]?.score)
                                        .map(node => {
                                            const risk = nodeRisks[node.id];
                                            const type = nodeTypes[node.type];
                                            const isSelected = selectedNode?.id === node.id;
                                            return (
                                                <div
                                                    key={node.id}
                                                    onClick={() => setSelectedNode(isSelected ? null : node)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '10px',
                                                        padding: '10px',
                                                        borderRadius: '10px',
                                                        marginBottom: '4px',
                                                        cursor: 'pointer',
                                                        background: isSelected ? 'rgba(34,211,238,0.08)' : 'transparent',
                                                        border: isSelected ? '1px solid rgba(34,211,238,0.2)' : '1px solid transparent',
                                                        transition: 'all 0.15s ease',
                                                    }}
                                                    onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                                                    onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'transparent')}>
                                                    <div style={{
                                                        width: '10px', height: '10px',
                                                        borderRadius: '50%',
                                                        background: risk.color,
                                                        flexShrink: 0,
                                                        boxShadow: `0 0 6px ${risk.color}`,
                                                    }} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {type?.icon} {node.name}
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: '#475569' }}>{node.country}</div>
                                                    </div>
                                                    <div style={{ fontSize: '11px', fontWeight: 700, color: risk.color }}>{risk.score}</div>
                                                    <ChevronRight size={12} color="#334155" />
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>

                            {/* Map + detail */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
                                {/* Map */}
                                <div style={{ flex: 1, minHeight: 0 }}>
                                    <NetworkMap
                                        onNodeSelect={setSelectedNode}
                                        selectedNodeId={selectedNode?.id}
                                        filter={filter}
                                    />
                                </div>

                                {/* Risk detail */}
                                {selectedNode && (
                                    <div style={{ flexShrink: 0 }}>
                                        <RiskScoreCard node={selectedNode} riskData={nodeRisks[selectedNode.id]} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <VoiceAssistant />
                </div>
            )}
        </AuthGuard>
    );
}
