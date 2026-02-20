'use client';
// src/components/PredictionsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { calculateNodeRisk } from '@/services/riskEngine';
import { predictDisruptions, suggestAlternatives } from '@/services/gemini';
import { Activity, AlertTriangle, ArrowRight, Brain, Clock, MapPin, Loader2, ShieldCheck, Thermometer, Wind, CheckCircle2 } from 'lucide-react';

export default function PredictionsDashboard() {
    const { nodes, events } = useData();
    const [selectedNode, setSelectedNode] = useState(null);
    const [riskData, setRiskData] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [alternatives, setAlternatives] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Sort nodes by risk automatically
    const sortedNodes = React.useMemo(() => {
        if (!nodes) return [];
        return [...nodes].map(n => ({
            ...n,
            riskScore: calculateNodeRisk(n, events).score,
            riskCategory: calculateNodeRisk(n, events).category
        })).sort((a, b) => b.riskScore - a.riskScore);
    }, [nodes, events]);

    // Initial select
    useEffect(() => {
        if (sortedNodes.length > 0 && !selectedNode) {
            handleSelectNode(sortedNodes[0]);
        }
    }, [sortedNodes]);

    const handleSelectNode = async (node) => {
        setSelectedNode(node);
        const rd = calculateNodeRisk(node, events);
        setRiskData(rd);
        setAnalysis(null);
        setAlternatives(null);
        setError(null);
        setLoading(true);

        try {
            const [disruptionAnalysis, alternativeOptions] = await Promise.all([
                predictDisruptions(node, rd, events),
                suggestAlternatives(node, rd, nodes)
            ]);

            if (disruptionAnalysis.error) throw new Error(disruptionAnalysis.error);
            setAnalysis(disruptionAnalysis);

            if (alternativeOptions.error) throw new Error(alternativeOptions.error);
            setAlternatives(alternativeOptions);
        } catch (err) {
            console.error("Gemini AI failed to build prediction model:", err);
            setError("AI Prediction Engine failed to build model. Please ensure API key is valid.");
        } finally {
            setLoading(false);
        }
    };

    if (!nodes || nodes.length === 0) {
        return (
            <div style={{ padding: '32px', color: '#94a3b8' }}>
                <p>No nodes available for analysis. Please seed your tenant database via Settings first.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100%', background: '#070b14', color: '#f1f5f9' }}>

            {/* Sidebar List */}
            <div style={{
                width: '320px',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                background: '#0a0f1c',
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto'
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Brain size={18} color="#8b5cf6" /> Network Nodes
                    </h2>
                    <p style={{ fontSize: '13px', margin: 0, color: '#64748b' }}>Select a node to run <b>SupplyGuard AI</b> deep-dive predictive analysis.</p>
                </div>
                <div style={{ padding: '16px' }}>
                    {sortedNodes.map(node => (
                        <div key={node.id}
                            onClick={() => handleSelectNode(node)}
                            style={{
                                padding: '16px',
                                background: selectedNode?.id === node.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                border: `1px solid ${selectedNode?.id === node.id ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.03)'}`,
                                borderRadius: '12px',
                                marginBottom: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: selectedNode?.id === node.id ? '#c4b5fd' : '#e2e8f0' }}>{node.name}</div>
                                <div style={{
                                    fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                                    background: node.riskScore >= 70 ? 'rgba(239, 68, 68, 0.1)' : (node.riskScore >= 35 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
                                    color: node.riskScore >= 70 ? '#ef4444' : (node.riskScore >= 35 ? '#f59e0b' : '#10b981')
                                }}>
                                    {node.riskScore}/100
                                </div>
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={12} /> {node.region}, {node.country}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Analysis Panel */}
            <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
                {!selectedNode ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                        Select a node from the sidebar to begin analysis.
                    </div>
                ) : loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8b5cf6' }}>
                        <Loader2 size={40} className="animate-spin" style={{ marginBottom: '16px' }} />
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Gemini AI Processing...</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Ingesting live telemetry, weather APIs, and geopolitical news feeds.</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '24px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <AlertTriangle size={24} style={{ marginBottom: '12px' }} />
                        <h3 style={{ margin: '0 0 8px 0' }}>Analysis Error</h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
                    </div>
                ) : analysis && alternatives ? (
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div>
                                <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>{selectedNode.name}</h1>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#94a3b8' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {selectedNode.country} ({selectedNode.type})</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={14} /> Base Reliability: {selectedNode.reliability}%</span>
                                </div>
                            </div>
                            <div style={{
                                padding: '16px 24px',
                                background: riskData.score >= 70 ? 'linear-gradient(135deg, rgba(239,68,68,0.2), transparent)' : 'linear-gradient(135deg, rgba(16,185,129,0.2), transparent)',
                                border: `1px solid ${riskData.score >= 70 ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
                                borderRadius: '16px',
                                textAlign: 'right'
                            }}>
                                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '4px' }}>Live Risk Index</div>
                                <div style={{ fontSize: '28px', fontWeight: 800, color: riskData.score >= 70 ? '#ef4444' : '#10b981' }}>
                                    {riskData.score} <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>/ 100</span>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Card */}
                        <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c4b5fd', marginBottom: '16px' }}>
                                <Brain size={20} /> <h3 style={{ margin: 0, fontWeight: 600, fontSize: '16px' }}>AI Predictive Summary</h3>
                            </div>
                            <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                                {analysis.summary}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ background: '#0a0f1c', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Estimated Delay Scope</div>
                                    <div style={{ fontSize: '18px', fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clock size={16} /> {analysis.estimatedDelay}
                                    </div>
                                </div>
                                <div style={{ background: '#0a0f1c', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>AI Primary Action</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShieldCheck size={16} /> {analysis.recommendation}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TIMELINE PREDICTIONS */}
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9', marginBottom: '16px' }}>What-If Timeline Simulation</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                            {analysis.predictions.map((pred, i) => (
                                <div key={i} style={{
                                    background: '#0d1424',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', gap: '20px'
                                }}>
                                    <div style={{ minWidth: '120px', fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
                                        {pred.timeframe}
                                    </div>
                                    <div style={{ flex: 1, fontSize: '14px', color: '#e2e8f0' }}>
                                        {pred.prediction}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '80px' }}>
                                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Confidence</span>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: pred.confidence > 80 ? '#10b981' : '#f59e0b' }}>
                                            {pred.confidence}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ALTERNATIVE ROUTES */}
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f1f5f9', marginBottom: '16px' }}>Optimized Alternatives</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                            {alternatives.alternatives.map((alt, i) => (
                                <div key={i} style={{
                                    background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.05), transparent)',
                                    border: '1px solid rgba(34, 211, 238, 0.2)',
                                    padding: '20px',
                                    borderRadius: '16px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>{alt.name}</h4>
                                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                                            {alt.safetyScore} Safety
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
                                        {alt.reason}
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                                        <div style={{ fontSize: '12px' }}>
                                            <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Cost Delta</span>
                                            <span style={{ color: '#ef4444', fontWeight: 600 }}>{alt.estimatedCostIncrease}</span>
                                        </div>
                                        <div style={{ fontSize: '12px' }}>
                                            <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Time Delta</span>
                                            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{alt.estimatedTimeIncrease}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
