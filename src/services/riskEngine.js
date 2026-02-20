// src/services/riskEngine.js
import { events } from '@/data/events';

/**
 * Calculate risk score for a node (0-100)
 * Weights: weather(30) + traffic(25) + reliability(20) + disasters(15) + history(10)
 */
export function calculateNodeRisk(node) {
    const nodeEvents = events.filter(e => e.affectedNodes.includes(node.id));

    const weatherScore = nodeEvents
        .filter(e => e.type === 'weather')
        .reduce((acc, e) => Math.max(acc, e.weatherImpact), 0);

    const trafficScore = nodeEvents
        .filter(e => ['congestion', 'infrastructure', 'geopolitical'].includes(e.type))
        .reduce((acc, e) => Math.max(acc, e.trafficImpact), 0);

    const disasterScore = nodeEvents
        .filter(e => e.type === 'disaster')
        .reduce((acc, e) => Math.max(acc, e.weatherImpact + e.trafficImpact), 0) / 2;

    // Reliability score: invert so low reliability = high risk
    const reliabilityRisk = Math.max(0, 100 - node.reliability);

    // Historical risk: random seed per node for demo consistency
    const historyRisk = ((node.id.charCodeAt(1) || 50) * 3) % 40;

    const raw = (
        weatherScore * 0.30 +
        trafficScore * 0.25 +
        reliabilityRisk * 0.20 +
        disasterScore * 0.15 +
        historyRisk * 0.10
    );

    const score = Math.min(100, Math.round(raw));

    return {
        score,
        category: score >= 66 ? 'High' : score >= 33 ? 'Medium' : 'Low',
        color: score >= 66 ? '#ef4444' : score >= 33 ? '#f59e0b' : '#22c55e',
        factors: {
            weather: Math.round(weatherScore),
            traffic: Math.round(trafficScore),
            reliability: Math.round(reliabilityRisk),
            disaster: Math.round(disasterScore),
            history: Math.round(historyRisk),
        },
    };
}

/**
 * Calculate risk for a route (average of its endpoint nodes)
 */
export function calculateRouteRisk(route, nodes) {
    const fromNode = nodes.find(n => n.id === route.from);
    const toNode = nodes.find(n => n.id === route.to);
    if (!fromNode || !toNode) return { score: 0, category: 'Low', color: '#22c55e' };

    const fromRisk = calculateNodeRisk(fromNode);
    const toRisk = calculateNodeRisk(toNode);
    const score = Math.round((fromRisk.score + toRisk.score) / 2);

    return {
        score,
        category: score >= 66 ? 'High' : score >= 33 ? 'Medium' : 'Low',
        color: score >= 66 ? '#ef4444' : score >= 33 ? '#f59e0b' : '#22c55e',
    };
}

/**
 * Get summary stats for the whole network
 */
export function getNetworkStats(nodes) {
    const risks = nodes.map(n => calculateNodeRisk(n));
    const avg = Math.round(risks.reduce((a, r) => a + r.score, 0) / risks.length);
    const high = risks.filter(r => r.category === 'High').length;
    const medium = risks.filter(r => r.category === 'Medium').length;
    const low = risks.filter(r => r.category === 'Low').length;
    return { avg, high, medium, low };
}
