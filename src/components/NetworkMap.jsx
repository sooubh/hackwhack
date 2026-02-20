'use client';
// src/components/NetworkMap.jsx
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from 'react-simple-maps';
import { useData } from '@/contexts/DataContext';
import { calculateNodeRisk } from '@/services/riskEngine';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export default function NetworkMap() {
    const { nodes, routes, events } = useData();
    const [tooltipData, setTooltipData] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    if (!nodes || nodes.length === 0) {
        return (
            <div className="flex items-center justify-center h-full w-full text-gray-500 bg-card-dark/30 rounded-2xl border border-border-dark border-dashed">
                <div className="text-center">
                    <span className="material-icons-outlined text-4xl opacity-50 mb-3 block">public_off</span>
                    <p className="text-sm font-medium">No map data available. Please seed the database in Settings.</p>
                </div>
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
        if (score >= 70) return '#ef4444'; // var(--color-danger)
        if (score >= 35) return '#f59e0b'; // var(--color-warning)
        return '#10b981'; // var(--color-success)
    }

    return (
        <div className="w-full h-full relative overflow-hidden rounded-2xl bg-[#0f111a]">
            {/* Background elements to make it feel more "dashboardy" */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background-dark to-background-dark pointer-events-none"></div>

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 140 }}
                className="w-full h-full outline-none"
            >
                <ZoomableGroup center={[0, 20]} maxZoom={5}>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#1a1c29" // Slightly brighter than background
                                    stroke="#2d3042" // Border dark
                                    strokeWidth={0.5}
                                    style={{
                                        default: { outline: 'none' },
                                        hover: { outline: 'none', fill: '#2d3042', transition: 'all 0.3s ease' },
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
                        const lineColor = isVulnerable ? 'rgba(239, 68, 68, 0.6)' : 'rgba(99, 102, 241, 0.3)';
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
                                style={{ transition: 'all 0.3s ease' }}
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
                                <circle
                                    r={isAlert ? 6 : 4}
                                    fill={color}
                                    stroke="#0f111a"
                                    strokeWidth={1.5}
                                    className="cursor-pointer transition-all duration-300 hover:scale-150 origin-center"
                                />
                                {isAlert && (
                                    <circle
                                        r={14}
                                        fill="transparent"
                                        stroke={color}
                                        strokeWidth={1}
                                        className="animate-ping pointer-events-none opacity-50 origin-center"
                                    />
                                )}
                            </Marker>
                        );
                    })}
                </ZoomableGroup>
            </ComposableMap>

            {/* Float Tooltip - Glassmorphism */}
            {tooltipData && (
                <div
                    className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+10px)]"
                    style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
                >
                    <div className="bg-card-dark/95 backdrop-blur-xl border border-white/10 p-3.5 rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] min-w-[220px] text-white">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                            <span className="font-bold text-sm tracking-tight">{tooltipData.name}</span>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${tooltipData.riskScore >= 70 ? 'bg-danger/20 text-danger border border-danger/20' :
                                    tooltipData.riskScore >= 35 ? 'bg-warning/20 text-warning border border-warning/20' :
                                        'bg-success/20 text-success border border-success/20'
                                }`}>
                                <span className="material-icons-outlined text-[12px]">
                                    {tooltipData.riskScore >= 70 ? 'warning' : 'info'}
                                </span>
                                {tooltipData.riskCategory}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 text-xs text-gray-400 font-medium">
                            <div className="flex items-center gap-2">
                                <span className="material-icons-outlined text-[14px] text-gray-500">location_on</span>
                                <span className="truncate">{tooltipData.region}, {tooltipData.country}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded-md mt-1">
                                <span>Type:</span>
                                <span className="text-gray-200 capitalize font-bold">{tooltipData.type}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded-md">
                                <span>Live Risk Index:</span>
                                <span className="text-white font-black">{tooltipData.riskScore}/100</span>
                            </div>
                        </div>
                    </div>
                    {/* Tooltip triangle pointer */}
                    <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/10"></div>
                </div>
            )}
        </div>
    );
}
