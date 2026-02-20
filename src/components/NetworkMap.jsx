'use client';
// src/components/NetworkMap.jsx
// Dynamic import ensures Leaflet only runs client-side (no SSR)
import { useEffect, useRef, useState } from 'react';
import { nodeTypes } from '@/data/supplyChain';
import { calculateNodeRisk, calculateRouteRisk } from '@/services/riskEngine';
import { useData } from '@/contexts/DataContext';

export default function NetworkMap({ onNodeSelect, selectedNodeId, filter = 'all' }) {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const markersRef = useRef([]);
    const polylinesRef = useRef([]);
    const [mapReady, setMapReady] = useState(false);

    // Grab live data from Firebase instead of static imports
    const { nodes: supplyNodes, routes } = useData();
    const safeNodes = supplyNodes || [];
    const safeRoutes = routes || [];

    const filteredNodes = filter === 'all'
        ? safeNodes
        : safeNodes.filter(n => {
            const risk = calculateNodeRisk(n);
            return risk.category.toLowerCase() === filter.toLowerCase();
        });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Dynamically import Leaflet
        import('leaflet').then(L => {
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });

            if (!leafletMapRef.current && mapRef.current) {
                const map = L.map(mapRef.current, {
                    center: [20, 10],
                    zoom: 2.4,
                    zoomControl: true,
                    attributionControl: true,
                    minZoom: 2,
                    maxZoom: 8,
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                }).addTo(map);

                leafletMapRef.current = map;
                setMapReady(true);
            }
        });

        return () => {
            if (leafletMapRef.current) {
                leafletMapRef.current.remove();
                leafletMapRef.current = null;
            }
        };
    }, []);

    // Draw markers and routes when map is ready
    useEffect(() => {
        if (!mapReady || !leafletMapRef.current) return;

        import('leaflet').then(L => {
            const map = leafletMapRef.current;

            // Clear existing
            markersRef.current.forEach(m => m.remove());
            polylinesRef.current.forEach(p => p.remove());
            markersRef.current = [];
            polylinesRef.current = [];

            // Draw routes as polylines
            routes.forEach(route => {
                const fromNode = supplyNodes.find(n => n.id === route.from);
                const toNode = supplyNodes.find(n => n.id === route.to);
                if (!fromNode || !toNode) return;

                const routeRisk = calculateRouteRisk(route, supplyNodes);
                const opacity = filter !== 'all' ? 0.15 : 0.4;

                const poly = L.polyline(
                    [[fromNode.lat, fromNode.lng], [toNode.lat, toNode.lng]],
                    {
                        color: routeRisk.color,
                        weight: 1.5,
                        opacity,
                        dashArray: route.mode === 'air' ? '6,6' : null,
                    }
                ).addTo(map);
                polylinesRef.current.push(poly);
            });

            // Draw nodes as circle markers
            filteredNodes.forEach(node => {
                const risk = calculateNodeRisk(node);
                const typeConf = nodeTypes[node.type] || nodeTypes.supplier;
                const isSelected = node.id === selectedNodeId;

                const marker = L.circleMarker([node.lat, node.lng], {
                    radius: isSelected ? 12 : 8,
                    fillColor: risk.color,
                    color: isSelected ? '#fff' : risk.color,
                    weight: isSelected ? 2.5 : 1.5,
                    opacity: 1,
                    fillOpacity: isSelected ? 0.95 : 0.75,
                });

                marker.bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:160px">
            <div style="font-size:14px;font-weight:700;color:#f1f5f9;margin-bottom:4px">
              ${typeConf.icon} ${node.name}
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:8px">${node.country} • ${node.type}</div>
            <div style="display:flex;align-items:center;gap:6px;font-size:12px">
              <span style="background:${risk.color}30;color:${risk.color};padding:2px 8px;border-radius:6px;font-weight:600">
                ⚠ ${risk.category} Risk (${risk.score})
              </span>
            </div>
            <div style="font-size:11px;color:#64748b;margin-top:6px">Reliability: ${node.reliability}%</div>
          </div>
        `);

                marker.on('click', () => onNodeSelect && onNodeSelect(node));
                marker.addTo(map);
                markersRef.current.push(marker);
            });
        });
    }, [mapReady, filteredNodes, selectedNodeId, filter]);

    return (
        <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '12px' }} />
    );
}
