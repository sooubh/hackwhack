// src/services/predictionEngine.js
// Built-in prediction engine — works WITHOUT external API
// Generates actionable predictions from supply chain data

import { calculateNodeRisk } from './riskEngine';

/**
 * Generate comprehensive predictions for a node using local data analysis.
 * No API key required — this always works.
 */
export function generatePredictions(node, riskData, events, allNodes, routes, orders) {
    const nodeOrders = (orders || []).filter(o =>
        o.route?.includes(node.id) || o.origin === node.id || o.destination === node.id || o.currentLocation === node.id
    );

    const nodeEvents = (events || []).filter(e => e.affectedNodes?.includes(node.id));
    const connectedRoutes = (routes || []).filter(r => r.from === node.id || r.to === node.id);
    const sameTypeNodes = allNodes.filter(n => n.id !== node.id && n.type === node.type);

    // Health score: inverse of risk score, adjusted by order delays
    const avgDelay = nodeOrders.length > 0
        ? nodeOrders.reduce((sum, o) => sum + (o.delayDays || 0), 0) / nodeOrders.length
        : 0;
    const healthScore = Math.max(10, Math.min(100, Math.round(100 - riskData.score * 0.6 - avgDelay * 3)));

    // Build predictions
    const summary = buildSummary(node, riskData, nodeOrders, nodeEvents, healthScore);
    const orderPredictions = buildOrderPredictions(nodeOrders, nodeEvents, node, allNodes, routes);
    const routeOptimizations = buildRouteOptimizations(node, connectedRoutes, allNodes, events, routes);
    const proactiveSuggestions = buildSuggestions(node, riskData, nodeOrders, nodeEvents, connectedRoutes);
    const timeline = buildTimeline(node, riskData, nodeEvents, nodeOrders);

    return {
        healthScore,
        healthStatus: healthScore >= 75 ? 'Good — operations running smoothly' :
            healthScore >= 50 ? 'Moderate — some delays, monitor closely' :
                healthScore >= 25 ? 'At Risk — immediate action needed' :
                    'Critical — operations severely impacted',
        summary,
        orderPredictions,
        routeOptimizations,
        proactiveSuggestions,
        predictions: timeline,
        recommendation: buildTopRecommendation(nodeOrders, nodeEvents, riskData),
    };
}

function buildSummary(node, riskData, orders, events, healthScore) {
    const parts = [];
    parts.push(`${node.name} is currently at ${riskData.category.toLowerCase()} risk (score: ${riskData.score}/100).`);

    if (orders.length > 0) {
        const delayed = orders.filter(o => o.delayDays > 0);
        if (delayed.length > 0) {
            const totalDelay = delayed.reduce((s, o) => s + o.delayDays, 0);
            parts.push(`${delayed.length} of ${orders.length} orders are delayed (avg ${Math.round(totalDelay / delayed.length)} days).`);
        } else {
            parts.push(`All ${orders.length} orders are on schedule.`);
        }
    }

    if (events.length > 0) {
        parts.push(`${events.length} active disruption${events.length > 1 ? 's' : ''}: ${events.map(e => e.title.split(' — ')[0]).join(', ')}.`);
    }

    return parts.join(' ');
}

function buildOrderPredictions(orders, events, node, allNodes, routes) {
    return orders
        .filter(o => o.delayDays > 0 || o.status === 'at_risk' || o.status === 'delayed')
        .map(order => {
            const relevantEvents = events.filter(e =>
                order.route?.some(r => e.affectedNodes?.includes(r))
            );

            let reason = 'Standard transit variation';
            let predictedExtra = 0;
            let suggestion = 'Continue monitoring';

            if (relevantEvents.length > 0) {
                const topEvent = relevantEvents.sort((a, b) =>
                    (b.severity === 'critical' ? 3 : b.severity === 'high' ? 2 : 1) -
                    (a.severity === 'critical' ? 3 : a.severity === 'high' ? 2 : 1)
                )[0];

                reason = `${topEvent.title} — affecting route nodes`;
                predictedExtra = topEvent.severity === 'critical' ? 4 : topEvent.severity === 'high' ? 2 : 1;

                // Find alternative route
                const destNode = allNodes.find(n => n.id === order.destination);
                const altRoutes = routes.filter(r =>
                    (r.to === order.destination || r.from === order.destination) &&
                    !relevantEvents.some(e => e.affectedNodes?.includes(r.from) || e.affectedNodes?.includes(r.to))
                );

                if (altRoutes.length > 0) {
                    const altFrom = allNodes.find(n => n.id === (altRoutes[0].from === order.destination ? altRoutes[0].to : altRoutes[0].from));
                    suggestion = `Reroute via ${altFrom?.name || 'alternate hub'} to avoid disruption. Saves ~${predictedExtra} days.`;
                } else if (topEvent.type === 'weather') {
                    suggestion = 'Wait for weather to clear (24-48h). Pre-position goods at nearest safe node.';
                } else if (topEvent.type === 'geopolitical') {
                    suggestion = 'Switch to rail freight if available. Contact transport union for timeline.';
                } else {
                    suggestion = 'Pre-clear documentation and request priority clearance at destination.';
                }
            }

            return {
                orderId: order.id,
                orderName: order.name,
                currentDelay: `${order.delayDays} day${order.delayDays !== 1 ? 's' : ''}`,
                predictedDelay: `${order.delayDays + predictedExtra} days`,
                reason,
                suggestion,
                impact: order.delayDays >= 5 ? 'High' : order.delayDays >= 2 ? 'Medium' : 'Low',
            };
        });
}

function buildRouteOptimizations(node, connectedRoutes, allNodes, events, allRoutes) {
    const optimizations = [];

    connectedRoutes.forEach(route => {
        const fromNode = allNodes.find(n => n.id === route.from);
        const toNode = allNodes.find(n => n.id === route.to);
        if (!fromNode || !toNode) return;

        // Check if route is affected by events
        const routeEvents = events.filter(e =>
            e.affectedNodes?.includes(route.from) || e.affectedNodes?.includes(route.to)
        );

        if (routeEvents.length > 0) {
            // Find alternative
            const otherEnd = route.from === node.id ? route.to : route.from;
            const altRoutes = allRoutes.filter(r =>
                r.id !== route.id &&
                (r.from === node.id || r.to === node.id) &&
                !events.some(e => e.affectedNodes?.includes(r.from === node.id ? r.to : r.from))
            );

            if (altRoutes.length > 0) {
                const altRoute = altRoutes[0];
                const altEnd = altRoute.from === node.id ? altRoute.to : altRoute.from;
                const altNode = allNodes.find(n => n.id === altEnd);
                const timeDiff = (route.transitDays || 2) - (altRoute.transitDays || 2);
                const costDiff = ((altRoute.cost || 0) - (route.cost || 0)) / (route.cost || 1) * 100;

                optimizations.push({
                    currentRoute: `${fromNode.name} → ${toNode.name}`,
                    suggestedRoute: `${node.name} → ${altNode?.name || altEnd}`,
                    timeSaved: timeDiff > 0 ? `${timeDiff} day${timeDiff > 1 ? 's' : ''}` : 'Same',
                    costDelta: `${costDiff > 0 ? '+' : ''}${Math.round(costDiff)}%`,
                    reason: `Current route affected by: ${routeEvents[0].title}. Alternative avoids disruption zone.`,
                    confidence: Math.round(80 - routeEvents.length * 5),
                });
            }
        }
    });

    // If no disruption-based optimizations, suggest cost optimization
    if (optimizations.length === 0 && connectedRoutes.length >= 2) {
        const sorted = [...connectedRoutes].sort((a, b) => (a.cost || 0) - (b.cost || 0));
        if (sorted.length >= 2) {
            const cheap = sorted[0];
            const expensive = sorted[sorted.length - 1];
            const fromCheap = allNodes.find(n => n.id === cheap.from);
            const toCheap = allNodes.find(n => n.id === cheap.to);
            const fromExp = allNodes.find(n => n.id === expensive.from);
            const toExp = allNodes.find(n => n.id === expensive.to);

            optimizations.push({
                currentRoute: `${fromExp?.name} → ${toExp?.name}`,
                suggestedRoute: `${fromCheap?.name} → ${toCheap?.name}`,
                timeSaved: `${Math.abs((expensive.transitDays || 2) - (cheap.transitDays || 2))} days`,
                costDelta: `-${Math.round(((expensive.cost - cheap.cost) / expensive.cost) * 100)}%`,
                reason: 'Lower cost route available with similar transit time. No active disruptions on this path.',
                confidence: 85,
            });
        }
    }

    return optimizations;
}

function buildSuggestions(node, riskData, orders, events, routes) {
    const suggestions = [];

    // Check for delayed orders
    const delayedOrders = orders.filter(o => o.delayDays > 0);
    if (delayedOrders.length > 0) {
        suggestions.push({
            type: 'speed',
            title: `Expedite ${delayedOrders.length} Delayed Order${delayedOrders.length > 1 ? 's' : ''}`,
            description: `${delayedOrders.map(o => o.id).join(', ')} are behind schedule. Contact carriers for priority handling and pre-clear customs documentation.`,
            impact: 'High',
            priority: 'immediate',
        });
    }

    // Check for weather events
    const weatherEvents = events.filter(e => e.type === 'weather');
    if (weatherEvents.length > 0) {
        suggestions.push({
            type: 'risk',
            title: 'Activate Weather Contingency Plan',
            description: 'Monsoon/weather disruption detected. Pre-position inventory at unaffected warehouses and switch to rail freight where possible.',
            impact: 'High',
            priority: 'immediate',
        });
    }

    // Check reliability
    if (node.reliability < 80) {
        suggestions.push({
            type: 'risk',
            title: 'Improve Node Reliability',
            description: `${node.name} has ${node.reliability}% reliability. Consider backup capacity agreements with nearby facilities and preventive maintenance scheduling.`,
            impact: 'Medium',
            priority: 'short-term',
        });
    }

    // Cost optimization
    if (routes.length > 1) {
        const avgCost = routes.reduce((s, r) => s + (r.cost || 0), 0) / routes.length;
        suggestions.push({
            type: 'cost',
            title: 'Negotiate Bulk Transport Rates',
            description: `Average route cost from this node is ₹${Math.round(avgCost / 1000)}K. Consolidating shipments and negotiating quarterly contracts could save 10-15%.`,
            impact: 'Medium',
            priority: 'short-term',
        });
    }

    // Inventory buffer
    if (orders.length > 0) {
        suggestions.push({
            type: 'efficiency',
            title: 'Build Safety Stock Buffer',
            description: 'Maintain 1-week buffer inventory at this node to absorb transit delays and prevent production/delivery stoppages.',
            impact: 'Medium',
            priority: 'long-term',
        });
    }

    return suggestions;
}

function buildTimeline(node, riskData, events, orders) {
    const predictions = [];

    // Next 24-48 hours
    const activeHighEvents = events.filter(e => e.severity === 'critical' || e.severity === 'high');
    if (activeHighEvents.length > 0) {
        predictions.push({
            timeframe: 'Next 24-48 hours',
            prediction: `${activeHighEvents.length} high-severity disruption${activeHighEvents.length > 1 ? 's' : ''} ongoing. Expect continued delays on affected routes. Monitor for escalation.`,
            confidence: 88,
            impact: 'High',
        });
    } else {
        predictions.push({
            timeframe: 'Next 24-48 hours',
            prediction: 'No major disruptions expected. Current orders should progress normally through transit.',
            confidence: 90,
            impact: 'Low',
        });
    }

    // Next 7 days
    const delayedOrders = orders.filter(o => o.delayDays > 0);
    if (delayedOrders.length > 0) {
        predictions.push({
            timeframe: 'Next 7 days',
            prediction: `${delayedOrders.length} delayed order${delayedOrders.length > 1 ? 's' : ''} should recover. Activate backup routing if delays exceed 5 days. Pre-position critical inventory.`,
            confidence: 72,
            impact: 'Medium',
        });
    } else {
        predictions.push({
            timeframe: 'Next 7 days',
            prediction: 'Stable operations expected. Good window for preventive maintenance and inventory optimization.',
            confidence: 78,
            impact: 'Low',
        });
    }

    // Next 30 days
    predictions.push({
        timeframe: 'Next 30 days',
        prediction: riskData.score >= 50
            ? 'Risk level may remain elevated due to seasonal factors. Build contingency plans and diversify supply routes.'
            : 'Operations outlook is positive. Focus on cost optimization and capacity planning for upcoming demand.',
        confidence: 55,
        impact: riskData.score >= 50 ? 'Medium' : 'Low',
    });

    return predictions;
}

function buildTopRecommendation(orders, events, riskData) {
    const delayed = orders.filter(o => o.delayDays > 0);
    const criticalEvents = events.filter(e => e.severity === 'critical' || e.severity === 'high');

    if (delayed.length > 0 && criticalEvents.length > 0) {
        return `Immediately reroute ${delayed[0].id} to avoid disruption zone and pre-clear customs for all delayed orders. Contact carriers for priority handling.`;
    }
    if (delayed.length > 0) {
        return `Priority: expedite ${delayed.map(o => o.id).join(', ')} — contact carriers for ETA updates and explore rail alternatives.`;
    }
    if (criticalEvents.length > 0) {
        return `Monitor ${criticalEvents[0].title} closely. Prepare backup routing and notify downstream customers of potential delays.`;
    }
    return 'Operations stable. Focus on cost optimization and building inventory buffers at key nodes.';
}
