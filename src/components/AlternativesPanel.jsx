'use client';
// src/components/AlternativesPanel.jsx
import { useState } from 'react';
import { Route, Loader, Star, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { suggestAlternatives } from '@/services/gemini';
import { useData } from '@/contexts/DataContext';

export default function AlternativesPanel({ node, riskData }) {
    const [loading, setLoading] = useState(false);
    const [alternatives, setAlternatives] = useState(null);
    const { nodes } = useData();

    const handleFetch = async () => {
        setLoading(true);
        try {
            const result = await suggestAlternatives(node, riskData, nodes || []);
            setAlternatives(result);
        } finally {
            setLoading(false);
        }
    };

    if (!node) return null;
    if (riskData?.category === 'Low') return (
        <div style={{ padding: '12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', fontSize: '13px', color: '#86efac' }}>
            ✅ This node is low risk — no alternative routing required.
        </div>
    );

    return (
        <div style={{
            background: '#111827',
            border: '1px solid rgba(99,179,237,0.12)',
            borderRadius: '16px',
            padding: '20px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Route size={16} color="#22d3ee" />
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>Smart Alternatives</div>
            </div>

            {!alternatives && !loading && (
                <button onClick={handleFetch} style={{
                    width: '100%', padding: '10px',
                    background: 'rgba(34,211,238,0.1)',
                    border: '1px solid rgba(34,211,238,0.3)',
                    borderRadius: '10px',
                    color: '#22d3ee',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                }}>
                    🔍 Find Alternative Routes
                </button>
            )}

            {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 0' }}>
                    <Loader size={16} color="#22d3ee" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: '#64748b', fontSize: '13px' }}>Finding alternatives...</span>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {alternatives?.alternatives && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {alternatives.alternatives.map((alt, i) => (
                        <div key={i} style={{
                            padding: '14px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '12px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{
                                    width: '22px', height: '22px',
                                    borderRadius: '50%',
                                    background: 'rgba(34,211,238,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '11px', fontWeight: 700, color: '#22d3ee',
                                }}>
                                    {i + 1}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{alt.name}</span>
                                <span style={{ fontSize: '11px', color: '#475569' }}>{alt.country}</span>
                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Star size={10} color="#f59e0b" fill="#f59e0b" />
                                    <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 600 }}>{alt.safetyScore}</span>
                                </div>
                            </div>
                            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, marginBottom: '8px' }}>{alt.reason}</p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <DollarSign size={11} color='#f97316' />
                                    <span style={{ fontSize: '11px', color: '#f97316' }}>{alt.estimatedCostIncrease}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={11} color='#94a3b8' />
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{alt.estimatedTimeIncrease}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {alternatives.recommendation && (
                        <div style={{
                            padding: '12px',
                            background: 'rgba(34,211,238,0.06)',
                            border: '1px solid rgba(34,211,238,0.2)',
                            borderRadius: '10px',
                            display: 'flex', gap: '8px',
                        }}>
                            <CheckCircle size={14} color="#22d3ee" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <p style={{ fontSize: '12px', color: '#67e8f9', lineHeight: 1.5, margin: 0 }}>{alternatives.recommendation}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
