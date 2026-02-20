'use client';
// src/components/PredictionPanel.jsx
import { useState } from 'react';
import { Brain, Loader, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { predictDisruptions } from '@/services/gemini';
import { events } from '@/data/events';

const confidenceColor = (c) => c >= 75 ? '#22c55e' : c >= 50 ? '#f59e0b' : '#ef4444';
const impactColor = (i) => i === 'High' ? '#ef4444' : i === 'Medium' ? '#f59e0b' : '#22c55e';

export default function PredictionPanel({ node, riskData }) {
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState(null);

    const handlePredict = async () => {
        if (!node) return;
        setLoading(true);
        setError(null);
        try {
            const result = await predictDisruptions(node, riskData, events);
            setPrediction(result);
        } catch (e) {
            setError('Failed to get prediction. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: '#111827',
            border: '1px solid rgba(99,179,237,0.12)',
            borderRadius: '16px',
            padding: '20px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Brain size={16} color="#8b5cf6" />
                </div>
                <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>AI Disruption Prediction</div>
                    <div style={{ fontSize: '11px', color: '#475569' }}>Powered by Gemini 2.0</div>
                </div>
            </div>

            {!node && (
                <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center', padding: '20px 0' }}>
                    Select a node on the map to get AI predictions
                </p>
            )}

            {node && !prediction && !loading && (
                <>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
                        Get AI-powered disruption predictions for <strong style={{ color: '#94a3b8' }}>{node.name}</strong>
                    </p>
                    <button
                        onClick={handlePredict}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
                            border: 'none',
                            borderRadius: '10px',
                            color: '#fff',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                        ✨ Predict Disruptions
                    </button>
                </>
            )}

            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px 0' }}>
                    <Loader size={24} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontSize: '13px', color: '#64748b' }}>Analyzing with Gemini AI...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

            {prediction && !prediction.error && (
                <div>
                    {/* Summary */}
                    <div style={{
                        padding: '12px',
                        background: 'rgba(139,92,246,0.08)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        borderRadius: '10px',
                        marginBottom: '16px',
                    }}>
                        <p style={{ fontSize: '13px', color: '#c4b5fd', lineHeight: 1.5, margin: 0 }}>{prediction.summary}</p>
                    </div>

                    {/* Timeline predictions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        {prediction.predictions?.map((p, i) => (
                            <div key={i} style={{
                                padding: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '10px',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={11} color="#475569" />
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>{p.timeframe}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: `${impactColor(p.impact)}20`, color: impactColor(p.impact), fontWeight: 600 }}>
                                            {p.impact}
                                        </span>
                                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: `${confidenceColor(p.confidence)}15`, color: confidenceColor(p.confidence) }}>
                                            {p.confidence}% confidence
                                        </span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>{p.prediction}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recommendation */}
                    <div style={{
                        padding: '12px',
                        background: 'rgba(34,197,94,0.06)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: '10px',
                        marginBottom: '12px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <CheckCircle size={12} color="#22c55e" />
                            <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>RECOMMENDATION</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#86efac', lineHeight: 1.5, margin: 0 }}>{prediction.recommendation}</p>
                    </div>

                    {/* Estimated delay */}
                    {prediction.estimatedDelay && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertTriangle size={12} color="#f59e0b" />
                            <span style={{ fontSize: '12px', color: '#fbbf24' }}>Est. delay: {prediction.estimatedDelay}</span>
                        </div>
                    )}

                    {/* Re-run */}
                    <button
                        onClick={handlePredict}
                        style={{
                            marginTop: '14px',
                            width: '100%',
                            padding: '8px',
                            background: 'transparent',
                            border: '1px solid rgba(139,92,246,0.3)',
                            borderRadius: '8px',
                            color: '#8b5cf6',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }}>
                        ↺ Refresh Prediction
                    </button>
                </div>
            )}
        </div>
    );
}
