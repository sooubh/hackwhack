'use client';
// src/components/NetworkMap.jsx
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from 'react-simple-maps';
import { useData } from '@/contexts/DataContext';
import { calculateNodeRisk } from '@/services/riskEngine';
import { AlertTriangle, Info, MapPin } from 'lucide-react';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export default function NetworkMap() {
    const { nodes, routes, events } = useData();
    const [tooltipData, setTooltipData] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    if (!nodes || nodes.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                <p>No map data available. Please seed the database in Settings.</p>
            </div>
        );
    }

    const handleMouseEnter = (node, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate risk
        const risk = calculateNodeRisk(node, events);

        setTooltipData({
            ...node,
            riskScore: risk.score,
            riskCategory: risk.category
        });

        // Offset tooltip slightly
        setTooltipPos({ x: e.clientX, y: e.clientY - 40 });
    };

    const handleMouseLeave = () => {
        setTooltipData(null);
    };

    function getRiskColor(score) {
        if (score >= 70) return '#ef4444'; // Red
        if (score >= 35) return '#f59e0b'; // Orange
        return '#10b981'; // Green
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 140 }}
                style={{ width: "100%", height: "100%", outline: 'none' }}
            >
                <ZoomableGroup center={[0, 20]}>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#1e293b" // Dark land
                                    stroke="#334155" // Borders
                                    strokeWidth={0.5}
                                    style={{
                                        default: { outline: 'none' },
                                        hover: { outline: 'none', fill: '#334155' },
                                        pressed: { outline: 'none' },
                                    }}
                                />
                            ))
                        }
                    </Geographies>

                    {/* Draw Routes */}
                    {routes && routes.map((route, i) => {
                        const startNode = nodes.find(n => n.id === route.startNode);
                        const endNode = nodes.find(n => n.id === route.endNode);

                        if (!startNode || !endNode) return null;

                        const isVulnerable = route.vulnerabilityScore > 60;
                        const lineColor = isVulnerable ? 'rgba(239, 68, 68, 0.5)' : 'rgba(148, 163, 184, 0.4)';
                        const strokeDasharray = isVulnerable ? "4 4" : "none";

                        return (
                            <Line
                                key={i}
                                from={[startNode.lng, startNode.lat]}
                                to={[endNode.lng, endNode.lat]}
                                stroke={lineColor}
                                strokeWidth={isVulnerable ? 2 : 1}
                                strokeDasharray={strokeDasharray}
                                strokeLinecap="round"
                                style={{
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        );
                    })}

                    {/* Draw Nodes */}
                    {nodes.map((node) => {
                        const risk = calculateNodeRisk(node, events);
                        const color = getRiskColor(risk.score);
                        const isAlert = risk.score >= 70;

                        return (
                            <Marker
                                key={node.id}
                                coordinates={[node.lng, node.lat]}
                                onMouseEnter={(e) => handleMouseEnter(node, e)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <circle r={isAlert ? 6 : 4} fill={color} stroke="#070b14" strokeWidth={1} style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} />
                                {isAlert && (
                                    <circle r={12} fill="transparent" stroke={color} strokeWidth={1} style={{ animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', pointerEvents: 'none', opacity: 0.5 }} />
                                )}
                            </Marker>
                        );
                    })}
                </ZoomableGroup>
            </ComposableMap>

            {/* Float Tooltip */}
            {tooltipData && (
                <div style={{
                    position: 'fixed',
                    left: `${tooltipPos.x}px`,
                    top: `${tooltipPos.y}px`,
                    transform: 'translate(-50%, -100%)',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    color: '#fff',
                    pointerEvents: 'none',
                    zIndex: 100,
                    minWidth: '200px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    transition: 'opacity 0.1s ease',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>{tooltipData.name}</span>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '2px 6px', borderRadius: '4px',
                            background: tooltipData.riskScore >= 70 ? 'rgba(239, 68, 68, 0.2)' : (tooltipData.riskScore >= 35 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                            color: tooltipData.riskScore >= 70 ? '#ef4444' : (tooltipData.riskScore >= 35 ? '#fbbf24' : '#10b981'),
                            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase'
                        }}>
                            {tooltipData.riskScore >= 70 ? <AlertTriangle size={10} /> : <Info size={10} />}
                            {tooltipData.riskCategory}
                        </div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={12} color="#cbd5e1" />
                            <span>{tooltipData.region}, {tooltipData.country}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                            <span>Type:</span>
                            <span style={{ color: '#e2e8f0', textTransform: 'capitalize' }}>{tooltipData.type}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Live Risk Index:</span>
                            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{tooltipData.riskScore}/100</span>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2.5);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
