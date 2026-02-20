'use client';
// src/components/RiskScoreCard.jsx
import { Wind, Truck, Shield, Flame, Clock } from 'lucide-react';

const factors = [
    { key: 'weather', label: 'Weather Impact', icon: Wind, color: '#22d3ee' },
    { key: 'traffic', label: 'Traffic / Logistics', icon: Truck, color: '#f59e0b' },
    { key: 'reliability', label: 'Reliability Risk', icon: Shield, color: '#8b5cf6' },
    { key: 'disaster', label: 'Disaster Risk', icon: Flame, color: '#ef4444' },
    { key: 'history', label: 'Historical Risk', icon: Clock, color: '#f97316' },
];

function ScoreBar({ value, color }) {
    return (
        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
                height: '100%',
                width: `${value}%`,
                background: color,
                borderRadius: '3px',
                transition: 'width 0.8s ease',
                boxShadow: `0 0 8px ${color}`,
            }} />
        </div>
    );
}

export default function RiskScoreCard({ node, riskData }) {
    if (!node || !riskData) return null;

    const scoreColor = riskData.score >= 66 ? '#ef4444' : riskData.score >= 33 ? '#f59e0b' : '#22c55e';

    return (
        <div style={{
            background: '#111827',
            border: '1px solid rgba(99,179,237,0.12)',
            borderRadius: '16px',
            padding: '20px',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>{node.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{node.country} • {node.type}</div>
                </div>
                {/* Circular score */}
                <div style={{
                    width: '60px', height: '60px',
                    borderRadius: '50%',
                    background: `conic-gradient(${scoreColor} ${riskData.score * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 16px ${scoreColor}40`,
                }}>
                    <div style={{
                        width: '46px', height: '46px',
                        borderRadius: '50%',
                        background: '#111827',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{riskData.score}</span>
                        <span style={{ fontSize: '8px', color: '#475569', marginTop: '1px' }}>RISK</span>
                    </div>
                </div>
            </div>

            {/* Risk badge */}
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: `${scoreColor}20`,
                border: `1px solid ${scoreColor}40`,
                marginBottom: '20px',
            }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: scoreColor }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: scoreColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {riskData.category} Risk
                </span>
            </div>

            {/* Factor bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {factors.map(({ key, label, icon: Icon, color }) => (
                    <div key={key}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <Icon size={12} color={color} />
                            <span style={{ fontSize: '12px', color: '#94a3b8', flex: 1 }}>{label}</span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9', minWidth: '32px', textAlign: 'right' }}>
                                {riskData.factors[key]}%
                            </span>
                        </div>
                        <ScoreBar value={riskData.factors[key]} color={color} />
                    </div>
                ))}
            </div>

            {/* Node reliability */}
            <div style={{
                marginTop: '16px',
                padding: '10px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Node Reliability</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>{node.reliability}%</span>
            </div>
        </div>
    );
}
