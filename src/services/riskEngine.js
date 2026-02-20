// src/services/riskEngine.js

/**
 * Calculate risk score for a node (0-100)
 * Weights: weather(30) + traffic(25) + reliability(20) + disasters(15) + history(10)
 */
export function calculateNodeRisk(node, currentEvents = []) {
    const nodeEvents = currentEvents.filter(e => e.affectedNodes?.includes(node.id));

    const weatherScore = nodeEvents
        .filter(e => e.type === 'weather')
        .reduce((acc, e) => Math.max(acc, e.weatherImpact || (e.severity === 'critical' ? 100 : e.severity === 'high' ? 70 : 40)), 0);

    const trafficScore = nodeEvents
        .filter(e => ['congestion', 'infrastructure', 'geopolitical', 'logistics'].includes(e.type))
        .reduce((acc, e) => Math.max(acc, e.trafficImpact || (e.severity === 'critical' ? 100 : e.severity === 'high' ? 70 : 40)), 0);

    const disasterScore = nodeEvents
        .filter(e => e.type === 'disaster')
        .reduce((acc, e) => Math.max(acc, (e.weatherImpact || 100) + (e.trafficImpact || 100)), 0) / 2;

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
export function calculateRouteRisk(route, nodes, currentEvents = []) {
    const fromNode = nodes.find(n => n.id === route.from);
    const toNode = nodes.find(n => n.id === route.to);
    if (!fromNode || !toNode) return { score: 0, category: 'Low', color: '#22c55e' };

    const fromRisk = calculateNodeRisk(fromNode, currentEvents);
    const toRisk = calculateNodeRisk(toNode, currentEvents);
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
export function getNetworkStats(nodes, currentEvents = []) {
    const risks = nodes.map(n => calculateNodeRisk(n, currentEvents));
    const avg = Math.round(risks.reduce((a, r) => a + r.score, 0) / (risks.length || 1));
    const high = risks.filter(r => r.category === 'High').length;
    const medium = risks.filter(r => r.category === 'Medium').length;
    const low = risks.filter(r => r.category === 'Low').length;
    return { avg, high, medium, low };
}
