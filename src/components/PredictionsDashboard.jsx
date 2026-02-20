'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { calculateNodeRisk } from '@/services/riskEngine';
import { generatePredictions } from '@/services/predictionEngine';
import { generateReport } from '@/services/reportGenerator';
import { orders as staticOrders } from '@/data/orders';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function PredictionsDashboard() {
    const { nodes, events, routes } = useData();
    const { theme: t } = useTheme();
    const [selectedNode, setSelectedNode] = useState(null);
    const [riskData, setRiskData] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [accepted, setAccepted] = useState({});
    const [resolvedNodes, setResolvedNodes] = useState({});
    const [loaded, setLoaded] = useState(false);

    // Load saved state from Firebase on mount
    useEffect(() => {
        const loadSaved = async () => {
            const user = auth.currentUser;
            if (!user || !db) { setLoaded(true); return; }
            try {
                const snap = await getDoc(doc(db, `users/${user.uid}/settings`, 'predictions'));
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.accepted) setAccepted(data.accepted);
                    if (data.resolvedNodes) setResolvedNodes(data.resolvedNodes);
                }
            } catch (err) { console.error('Failed to load saved state:', err); }
            setLoaded(true);
        };
        loadSaved();
    }, []);

    // Save to Firebase whenever accepted or resolvedNodes change
    const saveToFirebase = async (newAccepted, newResolved) => {
        const user = auth.currentUser;
        if (!user || !db) return;
        try {
            await setDoc(doc(db, `users/${user.uid}/settings`, 'predictions'), {
                accepted: newAccepted,
                resolvedNodes: newResolved,
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        } catch (err) { console.error('Failed to save:', err); }
    };

    const sortedNodes = useMemo(() => {
        if (!nodes) return [];
        return [...nodes].map(n => ({
            ...n,
            riskScore: calculateNodeRisk(n, events).score,
            riskCategory: calculateNodeRisk(n, events).category
        })).sort((a, b) => b.riskScore - a.riskScore);
    }, [nodes, events]);

    const activeNodes = sortedNodes.filter(n => !resolvedNodes[n.id]);
    const resolvedList = sortedNodes.filter(n => resolvedNodes[n.id]);

    useEffect(() => {
        if (loaded && sortedNodes.length > 0 && !selectedNode) {
            const first = activeNodes.length > 0 ? activeNodes[0] : sortedNodes[0];
            handleSelectNode(first);
        }
    }, [sortedNodes, loaded]);

    const handleSelectNode = (node) => {
        setSelectedNode(node);
        const rd = calculateNodeRisk(node, events);
        setRiskData(rd);
        setActiveTab('overview');
        try {
            setAnalysis(generatePredictions(node, rd, events, nodes, routes, staticOrders));
        } catch (err) { console.error("Prediction error:", err); }
    };

    const handleAccept = (type, details, key) => {
        const newAccepted = { ...accepted, [key]: true };
        setAccepted(newAccepted);
        saveToFirebase(newAccepted, resolvedNodes);
        const reportId = generateReport({ type, details, node: selectedNode, timestamp: Date.now() });
        toast.success(`✅ Accepted & saved! Report #${reportId} generated.`);
    };

    const handleResolveNode = (node) => {
        const rd = calculateNodeRisk(node, events);
        const fullAnalysis = generatePredictions(node, rd, events, nodes, routes, staticOrders);
        const reportId = generateReport({
            type: 'suggestion',
            details: {
                title: `Node Resolved: ${node.name}`,
                type: 'resolution',
                description: fullAnalysis.summary + ' | Recommendation: ' + fullAnalysis.recommendation,
                impact: rd.score >= 50 ? 'High' : 'Medium',
                priority: 'completed',
            },
            node, timestamp: Date.now(),
        });
        const newResolved = { ...resolvedNodes, [node.id]: { timestamp: Date.now(), reportId } };
        setResolvedNodes(newResolved);
        saveToFirebase(accepted, newResolved);
        toast.success(`✅ ${node.name} resolved & saved!`);
        const remaining = activeNodes.filter(n => n.id !== node.id);
        if (remaining.length > 0) handleSelectNode(remaining[0]);
    };

    if (!nodes || nodes.length === 0) {
        return <div style={{ padding: '32px', color: t.textMuted }}>No nodes. Seed database via Settings.</div>;
    }

    const ic = (i) => i === 'High' ? t.danger : i === 'Medium' ? t.warning : t.success;
    const ti = (tp) => ({ efficiency: 'speed', cost: 'savings', speed: 'bolt', risk: 'shield' }[tp] || 'lightbulb');
    const pc = (p) => p === 'immediate' ? t.danger : p === 'short-term' ? t.warning : t.info;

    const acceptBtn = (onClick, isAccepted) => (
        <button onClick={onClick} disabled={isAccepted} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: isAccepted ? 'default' : 'pointer', border: 'none',
            background: isAccepted ? t.successBg : t.primary, color: isAccepted ? t.success : '#fff',
            ...(isAccepted ? { border: `1px solid ${t.successBorder}` } : {}),
        }}>
            <span className="material-icons-outlined" style={{ fontSize: '16px' }}>{isAccepted ? 'check_circle' : 'task_alt'}</span>
            {isAccepted ? 'Accepted ✓' : 'Accept & Download Report'}
        </button>
    );

    return (
        <div style={{ display: 'flex', height: '100%', background: t.bg, color: t.text, overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{ width: '270px', minWidth: '270px', borderRight: `1px solid ${t.border}`, background: t.bgCard, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '20px', borderBottom: `1px solid ${t.border}` }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: t.heading, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons-outlined" style={{ color: t.primary }}>hub</span> Supply Chain
                    </h2>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: t.warningBg, color: t.warning, fontWeight: 700 }}>{activeNodes.length} Active</span>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: t.successBg, color: t.success, fontWeight: 700 }}>{resolvedList.length} Resolved</span>
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                    {activeNodes.length > 0 && (
                        <>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 12px 4px' }}>⚠️ Active Issues ({activeNodes.length})</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                                {activeNodes.map(node => {
                                    const active = selectedNode?.id === node.id;
                                    const col = node.riskScore >= 70 ? t.danger : node.riskScore >= 35 ? t.warning : t.success;
                                    return (
                                        <div key={node.id} style={{ borderRadius: '10px', border: active ? `1px solid ${t.primaryBorder}` : '1px solid transparent', background: active ? t.primaryBg : 'transparent' }}>
                                            <div onClick={() => handleSelectNode(node)} style={{ padding: '10px 12px', cursor: 'pointer' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: active ? t.heading : t.textSecondary }}>{node.name}</span>
                                                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', background: `${col}15`, color: col }}>{node.riskScore}</span>
                                                </div>
                                                <span style={{ fontSize: '11px', color: t.textMuted }}>{node.type} • {node.region}</span>
                                            </div>
                                            <div style={{ padding: '0 12px 10px' }}>
                                                <button onClick={(e) => { e.stopPropagation(); handleResolveNode(node); }}
                                                    style={{ width: '100%', padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, border: `1px solid ${t.successBorder}`, background: t.successBg, color: t.success, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                    <span className="material-icons-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                                                    Resolve & Download
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    {resolvedList.length > 0 && (
                        <>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: t.success, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 12px 4px' }}>✅ Resolved ({resolvedList.length})</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {resolvedList.map(node => {
                                    const active = selectedNode?.id === node.id;
                                    const info = resolvedNodes[node.id];
                                    return (
                                        <div key={node.id} onClick={() => handleSelectNode(node)}
                                            style={{ padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', opacity: 0.75, border: active ? `1px solid ${t.successBorder}` : '1px solid transparent', background: active ? t.successBg : 'transparent' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: t.textSecondary, textDecoration: 'line-through' }}>{node.name}</span>
                                                <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', background: t.successBg, color: t.success }}>✓</span>
                                            </div>
                                            <span style={{ fontSize: '11px', color: t.textMuted }}>
                                                Resolved {info?.timestamp ? new Date(info.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    {activeNodes.length === 0 && resolvedList.length > 0 && (
                        <div style={{ textAlign: 'center', padding: '24px 16px', marginTop: '16px' }}>
                            <span className="material-icons-outlined" style={{ fontSize: '40px', color: t.success, display: 'block', marginBottom: '8px' }}>verified</span>
                            <p style={{ fontSize: '14px', fontWeight: 700, color: t.success }}>All Issues Resolved!</p>
                            <p style={{ fontSize: '12px', color: t.textMuted }}>All nodes have been reviewed.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Analysis Panel */}
            <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
                {!selectedNode || !analysis ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: t.textMuted }}>
                        <span className="material-icons-outlined" style={{ fontSize: '56px', opacity: 0.3 }}>analytics</span>
                    </div>
                ) : (
                    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                        {resolvedNodes[selectedNode.id] && (
                            <div style={{ background: t.successBg, border: `1px solid ${t.successBorder}`, borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="material-icons-outlined" style={{ color: t.success, fontSize: '22px' }}>verified</span>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: t.success }}>This node has been resolved</div>
                                    <div style={{ fontSize: '12px', color: t.textMuted }}>Report #{resolvedNodes[selectedNode.id].reportId} • {new Date(resolvedNodes[selectedNode.id].timestamp).toLocaleString()}</div>
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <h1 style={{ fontSize: '24px', fontWeight: 800, color: t.heading, margin: 0 }}>{selectedNode.name}</h1>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <span style={{ fontSize: '12px', color: t.textSecondary, background: t.bgCard, padding: '4px 10px', borderRadius: '8px', border: `1px solid ${t.border}` }}>{selectedNode.type} • {selectedNode.region}</span>
                                    <span style={{ fontSize: '12px', color: t.textSecondary, background: t.bgCard, padding: '4px 10px', borderRadius: '8px', border: `1px solid ${t.border}` }}>Reliability: <b style={{ color: t.heading }}>{selectedNode.reliability}%</b></span>
                                </div>
                            </div>
                            <div style={{ padding: '14px 20px', borderRadius: '14px', textAlign: 'right', background: analysis.healthScore >= 70 ? t.successBg : analysis.healthScore >= 40 ? t.warningBg : t.dangerBg, border: `1px solid ${analysis.healthScore >= 70 ? t.successBorder : analysis.healthScore >= 40 ? t.warningBorder : t.dangerBorder}` }}>
                                <div style={{ fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', fontWeight: 800 }}>Health</div>
                                <div style={{ fontSize: '28px', fontWeight: 800, color: analysis.healthScore >= 70 ? t.success : analysis.healthScore >= 40 ? t.warning : t.danger }}>{analysis.healthScore}<span style={{ fontSize: '12px', color: t.textMuted }}>/100</span></div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: t.bgCard, borderRadius: '12px', padding: '4px', border: `1px solid ${t.border}` }}>
                            {[
                                { id: 'overview', label: 'Overview', icon: 'auto_awesome' },
                                { id: 'orders', label: 'Orders', icon: 'local_shipping' },
                                { id: 'routes', label: 'Routes', icon: 'alt_route' },
                                { id: 'suggestions', label: 'Actions', icon: 'lightbulb' },
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
                                    background: activeTab === tab.id ? t.primary : 'transparent',
                                    color: activeTab === tab.id ? '#fff' : t.textMuted,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                }}>
                                    <span className="material-icons-outlined" style={{ fontSize: '16px' }}>{tab.icon}</span> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div>
                                <div style={{ background: t.primaryBg, border: `1px solid ${t.primaryBorder}`, padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: t.primary, marginBottom: '12px' }}>
                                        <span className="material-icons-outlined">auto_awesome</span>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>AI Analysis</h3>
                                    </div>
                                    <p style={{ fontSize: '14px', color: t.text, lineHeight: 1.7, margin: '0 0 16px' }}>{analysis.summary}</p>
                                    <div style={{ background: t.bgCard, padding: '14px', borderRadius: '10px', border: `1px solid ${t.border}` }}>
                                        <div style={{ fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Recommended Action</div>
                                        <div style={{ fontSize: '13px', color: t.info, fontWeight: 600 }}>{analysis.recommendation}</div>
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: t.heading }}>Forecast</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {(analysis.predictions || []).map((p, i) => (
                                        <div key={i} style={{ background: t.bgCard, border: `1px solid ${t.border}`, padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '110px', fontSize: '12px', fontWeight: 700, color: t.primary, flexShrink: 0 }}>{p.timeframe}</div>
                                            <div style={{ flex: 1, fontSize: '13px', color: t.text, lineHeight: 1.4 }}>{p.prediction}</div>
                                            <div style={{ fontSize: '16px', fontWeight: 800, color: p.confidence > 80 ? t.success : t.warning, flexShrink: 0 }}>{p.confidence}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ORDERS */}
                        {activeTab === 'orders' && (
                            <div>
                                {(analysis.orderPredictions || []).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: t.textMuted }}>
                                        <span className="material-icons-outlined" style={{ fontSize: '48px', opacity: 0.3, display: 'block', marginBottom: '10px' }}>inventory_2</span>
                                        <p>No order issues at this node.</p>
                                    </div>
                                ) : (analysis.orderPredictions || []).map((o, i) => {
                                    const key = `order-${o.orderId}-${selectedNode.id}`;
                                    const isAccepted = !!accepted[key];
                                    return (
                                        <div key={i} style={{ background: t.bgCard, border: `1px solid ${isAccepted ? t.successBorder : t.border}`, borderRadius: '14px', marginBottom: '14px', overflow: 'hidden' }}>
                                            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <div>
                                                        <span style={{ fontSize: '11px', color: t.textMuted, fontFamily: 'monospace' }}>{o.orderId}</span>
                                                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: t.heading, margin: '4px 0 0' }}>{o.orderName}</h4>
                                                    </div>
                                                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '8px', background: `${ic(o.impact)}15`, color: ic(o.impact), textTransform: 'uppercase' }}>{o.impact}</span>
                                                </div>
                                                <p style={{ fontSize: '13px', color: t.textSecondary, margin: 0 }}><b style={{ color: t.danger }}>Why:</b> {o.reason}</p>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr' }}>
                                                <div style={{ padding: '14px 18px', borderRight: `1px solid ${t.border}` }}>
                                                    <div style={{ fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Current</div>
                                                    <div style={{ fontSize: '16px', fontWeight: 800, color: t.warning }}>{o.currentDelay}</div>
                                                </div>
                                                <div style={{ padding: '14px 18px', borderRight: `1px solid ${t.border}` }}>
                                                    <div style={{ fontSize: '10px', color: t.textMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Predicted</div>
                                                    <div style={{ fontSize: '16px', fontWeight: 800, color: t.danger }}>{o.predictedDelay}</div>
                                                </div>
                                                <div style={{ padding: '14px 18px', background: t.successBg }}>
                                                    <div style={{ fontSize: '10px', color: t.success, textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>💡 Suggestion</div>
                                                    <div style={{ fontSize: '13px', color: t.text, lineHeight: 1.4 }}>{o.suggestion}</div>
                                                </div>
                                            </div>
                                            <div style={{ padding: '14px 20px', borderTop: `1px solid ${t.border}`, display: 'flex', justifyContent: 'flex-end' }}>
                                                {acceptBtn(() => handleAccept('order', o, key), isAccepted)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ROUTES */}
                        {activeTab === 'routes' && (
                            <div>
                                {(analysis.routeOptimizations || []).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: t.textMuted }}>
                                        <span className="material-icons-outlined" style={{ fontSize: '48px', opacity: 0.3, display: 'block', marginBottom: '10px' }}>map</span>
                                        <p>All routes are optimal.</p>
                                    </div>
                                ) : (analysis.routeOptimizations || []).map((r, i) => {
                                    const key = `route-${i}-${selectedNode.id}`;
                                    const isAccepted = !!accepted[key];
                                    return (
                                        <div key={i} style={{ background: t.bgCard, border: `1px solid ${isAccepted ? t.successBorder : t.infoBorder}`, borderRadius: '14px', padding: '22px', marginBottom: '14px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                                                <h4 style={{ fontSize: '14px', fontWeight: 700, color: t.heading, margin: 0 }}>Optimization #{i + 1}</h4>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: r.confidence > 80 ? t.success : t.warning }}>{r.confidence}%</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                                                <div style={{ background: t.dangerBg, border: `1px solid ${t.dangerBorder}`, padding: '12px', borderRadius: '10px' }}>
                                                    <div style={{ fontSize: '10px', color: t.danger, textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Current</div>
                                                    <div style={{ fontSize: '13px', color: t.text, fontWeight: 600 }}>{r.currentRoute}</div>
                                                </div>
                                                <span className="material-icons-outlined" style={{ color: t.success, fontSize: '24px' }}>arrow_forward</span>
                                                <div style={{ background: t.successBg, border: `1px solid ${t.successBorder}`, padding: '12px', borderRadius: '10px' }}>
                                                    <div style={{ fontSize: '10px', color: t.success, textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Better</div>
                                                    <div style={{ fontSize: '13px', color: t.text, fontWeight: 600 }}>{r.suggestedRoute}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px', marginBottom: '14px' }}>
                                                <div style={{ background: t.bg, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${t.border}` }}>
                                                    <div style={{ fontSize: '10px', color: t.textMuted, fontWeight: 700 }}>Saved</div>
                                                    <div style={{ fontSize: '16px', fontWeight: 800, color: t.success }}>{r.timeSaved}</div>
                                                </div>
                                                <div style={{ background: t.bg, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${t.border}` }}>
                                                    <div style={{ fontSize: '10px', color: t.textMuted, fontWeight: 700 }}>Cost</div>
                                                    <div style={{ fontSize: '16px', fontWeight: 800, color: r.costDelta?.startsWith('-') ? t.success : t.warning }}>{r.costDelta}</div>
                                                </div>
                                                <div style={{ background: t.bg, padding: '10px 14px', borderRadius: '10px', border: `1px solid ${t.border}` }}>
                                                    <div style={{ fontSize: '10px', color: t.textMuted, fontWeight: 700 }}>Why</div>
                                                    <div style={{ fontSize: '12px', color: t.text, lineHeight: 1.4 }}>{r.reason}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                {acceptBtn(() => handleAccept('route', r, key), isAccepted)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ACTIONS */}
                        {activeTab === 'suggestions' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {(analysis.proactiveSuggestions || []).map((s, i) => {
                                    const key = `sug-${i}-${selectedNode.id}`;
                                    const isAccepted = !!accepted[key];
                                    return (
                                        <div key={i} style={{ background: t.bgCard, border: `1px solid ${isAccepted ? t.successBorder : t.border}`, borderRadius: '12px', padding: '18px' }}>
                                            <div style={{ display: 'flex', gap: '14px' }}>
                                                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${pc(s.priority)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <span className="material-icons-outlined" style={{ fontSize: '18px', color: pc(s.priority) }}>{ti(s.type)}</span>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: t.heading, margin: 0 }}>{s.title}</h4>
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: `${ic(s.impact)}15`, color: ic(s.impact), textTransform: 'uppercase' }}>{s.impact}</span>
                                                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: `${pc(s.priority)}15`, color: pc(s.priority), textTransform: 'uppercase' }}>{s.priority}</span>
                                                        </div>
                                                    </div>
                                                    <p style={{ fontSize: '13px', color: t.textSecondary, lineHeight: 1.5, margin: '0 0 12px' }}>{s.description}</p>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                        {acceptBtn(() => handleAccept('suggestion', s, key), isAccepted)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
