'use client';
// src/app/predictions/page.js
import { useState } from 'react';
import dynamic from 'next/dynamic';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import PredictionPanel from '@/components/PredictionPanel';
import AlternativesPanel from '@/components/AlternativesPanel';
import VoiceAssistant from '@/components/VoiceAssistant';
import { nodes, nodeTypes } from '@/data/supplyChain';
import { calculateNodeRisk } from '@/services/riskEngine';
import { Brain, ChevronRight } from 'lucide-react';

export default function PredictionsPage() {
    const [selectedNode, setSelectedNode] = useState(null);

    const riskData = selectedNode ? calculateNodeRisk(selectedNode) : null;

    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14' }}>
                    <Sidebar />
                    <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <TopBar user={user} />
                        <main style={{ padding: '24px', flex: 1 }}>
                            <div style={{ marginBottom: '24px' }}>
                                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>
                                    AI Disruption Predictions
                                </h1>
                                <p style={{ fontSize: '13px', color: '#475569' }}>
                                    Select a supply chain node to generate Gemini AI-powered predictions
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {/* Node grid */}
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '12px', letterSpacing: '0.5px' }}>
                                        SELECT NODE TO PREDICT
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {nodes
                                            .sort((a, b) => calculateNodeRisk(b).score - calculateNodeRisk(a).score)
                                            .map(node => {
                                                const risk = calculateNodeRisk(node);
                                                const typeConf = nodeTypes[node.type];
                                                const isSelected = selectedNode?.id === node.id;
                                                return (
                                                    <div
                                                        key={node.id}
                                                        onClick={() => setSelectedNode(isSelected ? null : node)}
                                                        style={{
                                                            padding: '14px',
                                                            background: isSelected ? 'rgba(139,92,246,0.12)' : '#111827',
                                                            border: `1px solid ${isSelected ? 'rgba(139,92,246,0.4)' : 'rgba(99,179,237,0.1)'}`,
                                                            borderRadius: '12px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                        onMouseEnter={e => !isSelected && (e.currentTarget.style.borderColor = 'rgba(99,179,237,0.25)')}
                                                        onMouseLeave={e => !isSelected && (e.currentTarget.style.borderColor = 'rgba(99,179,237,0.1)')}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                            <span style={{ fontSize: '18px' }}>{typeConf?.icon}</span>
                                                            <span style={{
                                                                fontSize: '10px', fontWeight: 700, padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                background: `${risk.color}20`, color: risk.color,
                                                            }}>{risk.category}</span>
                                                        </div>
                                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '2px', lineHeight: 1.3 }}>
                                                            {node.name}
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: '#475569' }}>{node.country}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                                                            <div style={{ height: '3px', flex: 1, marginRight: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                                                                <div style={{ width: `${risk.score}%`, height: '100%', background: risk.color, borderRadius: '2px' }} />
                                                            </div>
                                                            <span style={{ fontSize: '11px', fontWeight: 700, color: risk.color }}>{risk.score}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* Prediction + Alternatives panels */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {!selectedNode && (
                                        <div style={{
                                            flex: 1,
                                            background: '#111827',
                                            border: '1px solid rgba(99,179,237,0.12)',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '40px',
                                            gap: '14px',
                                            textAlign: 'center',
                                        }}>
                                            <div style={{
                                                width: '56px', height: '56px',
                                                borderRadius: '16px',
                                                background: 'rgba(139,92,246,0.12)',
                                                border: '1px solid rgba(139,92,246,0.25)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <Brain size={24} color="#8b5cf6" />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>
                                                    AI Prediction Engine
                                                </div>
                                                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                                                    Select any node from the grid to generate AI-powered disruption predictions and smart alternative suggestions.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedNode && (
                                        <>
                                            <PredictionPanel node={selectedNode} riskData={riskData} />
                                            <AlternativesPanel node={selectedNode} riskData={riskData} />
                                        </>
                                    )}
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
