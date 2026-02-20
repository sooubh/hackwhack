// src/services/gemini.js
// Gemini AI integration for supply chain disruption prediction

import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchWeatherData, fetchTrafficData, fetchGeopoliticalStatus } from "./externalApis";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Initialize the SDK if we have a valid key
const genAI = (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here')
    ? new GoogleGenerativeAI(GEMINI_API_KEY)
    : null;

const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

async function callGemini(prompt) {
    if (!model) {
        // Return a structured mock response when no key is set or key is placeholder
        return getMockResponse(prompt);
    }

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error(`Gemini API error: ${error.message}`);
    }
}

/**
 * Starts a stateful chat session with the Gemini model
 */
export function startChatSession() {
    if (!model) return null; // Fallback handled by the caller

    return model.startChat({
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        },
    });
}

/**
 * Predict disruptions for a specific node
 */
export async function predictDisruptions(node, riskData, activeEvents) {
    const eventList = activeEvents
        .filter(e => e.affectedNodes.includes(node.id))
        .map(e => `- ${e.type.toUpperCase()}: ${e.title} (severity: ${e.severity})`)
        .join('\n') || '- No active disruption events';

    // Fetch external live data
    const weather = await fetchWeatherData(node.lat, node.lng, node.type === 'port');
    const traffic = await fetchTrafficData(node.lat, node.lng);
    const geoStatus = await fetchGeopoliticalStatus(node.country);

    const prompt = `You are an AI supply chain analyst. Analyze the following supply chain node and predict disruptions.

Node: ${node.name} (${node.type}) in ${node.country}
Region: ${node.region}
Current Risk Score: ${riskData.score}/100 (${riskData.category} risk)
Node Reliability: ${node.reliability}%

External Context (Real-Time API Data):
- Weather: ${weather.condition}, ${weather.temperature}. Warning: ${weather.warning}
- Local Traffic: ${traffic.congestionLevel} congestion. Delay: ${traffic.estimatedDelay}.
- Geopolitical Status: ${geoStatus.status}. Alert: ${geoStatus.alert}

Active Events Affecting This Node:
${eventList}

Risk Breakdown:
- Weather Impact: ${riskData.factors.weather}%
- Traffic/Logistics Impact: ${riskData.factors.traffic}%
- Reliability Risk: ${riskData.factors.reliability}%
- Disaster Risk: ${riskData.factors.disaster}%

Provide a concise analysis in JSON format with these fields:
{
  "summary": "One sentence summary of the situation",
  "predictions": [
    { "timeframe": "Next 24-48 hours", "prediction": "what will happen", "confidence": 85, "impact": "High/Medium/Low" },
    { "timeframe": "Next 7 days", "prediction": "what will happen", "confidence": 70, "impact": "High/Medium/Low" },
    { "timeframe": "Next 30 days", "prediction": "what will happen", "confidence": 55, "impact": "High/Medium/Low" }
  ],
  "recommendation": "Primary action to take now",
  "estimatedDelay": "X-Y days delay"
}`;

    const text = await callGemini(prompt);
    return parseJsonResponse(text);
}

/**
 * Suggest alternative routes/suppliers
 */
export async function suggestAlternatives(node, riskData, allNodes) {
    const saferNodes = allNodes
        .filter(n => n.id !== node.id && n.type === node.type)
        .sort((a, b) => b.reliability - a.reliability)
        .slice(0, 3)
        .map(n => `- ${n.name} (${n.country}, reliability: ${n.reliability}%)`)
        .join('\n');

    const prompt = `You are an AI supply chain optimizer. The following node is at ${riskData.category} risk.

At-Risk Node: ${node.name} (${node.type}) in ${node.country}
Risk Score: ${riskData.score}/100

Available Alternative ${node.type}s:
${saferNodes}

Suggest 3 alternatives in JSON format:
{
  "alternatives": [
    {
      "name": "Node name",
      "country": "Country",
      "reason": "Why this is a good alternative",
      "estimatedCostIncrease": "X%",
      "estimatedTimeIncrease": "X days",
      "safetyScore": 85
    }
  ],
  "recommendation": "Overall recommendation"
}`;

    const text = await callGemini(prompt);
    return parseJsonResponse(text);
}

/**
 * Answer a voice/text query about the supply chain
 */
export async function answerQuery(query, networkStats, activeAlerts) {
    const prompt = `You are an AI supply chain assistant. Answer the following question concisely (2-3 sentences max).

Current Network Status:
- Average Risk Score: ${networkStats.avg}/100
- High Risk Nodes: ${networkStats.high}
- Medium Risk Nodes: ${networkStats.medium}
- Low Risk Nodes: ${networkStats.low}
- Active Alerts: ${activeAlerts.length} (${activeAlerts.filter(a => !a.read).length} unread)

User Question: ${query}

Respond conversationally, like a supply chain expert briefing a manager.`;

    return await callGemini(prompt);
}

/**
 * Comprehensive supply chain prediction: orders, delays, route optimization, proactive suggestions
 */
export async function predictSupplyChain(node, riskData, activeEvents, allNodes, routes, orders) {
    const nodeOrders = (orders || []).filter(o => o.route?.includes(node.id) || o.origin === node.id || o.destination === node.id || o.currentLocation === node.id);
    const orderSummary = nodeOrders.length > 0
        ? nodeOrders.map(o => `- ${o.name} (${o.id}): ${o.status}, ${o.delayDays}d delay, Value: ${o.value}, Progress: ${o.progress}%, Route: ${o.route?.join(' → ')}`).join('\n')
        : '- No active orders through this node';

    const eventList = activeEvents
        .filter(e => e.affectedNodes?.includes(node.id))
        .map(e => `- ${e.type.toUpperCase()}: ${e.title} (severity: ${e.severity})`)
        .join('\n') || '- No active events';

    const connectedRoutes = (routes || []).filter(r => r.from === node.id || r.to === node.id);
    const routeInfo = connectedRoutes.length > 0
        ? connectedRoutes.map(r => {
            const other = r.from === node.id ? r.to : r.from;
            const otherNode = allNodes.find(n => n.id === other);
            return `- Route to ${otherNode?.name || other} (${r.mode || 'sea'}, ${r.distance || '?'}km, ${r.transitDays || '?'} days)`;
        }).join('\n')
        : '- No direct routes';

    const nearbyAlternatives = allNodes
        .filter(n => n.id !== node.id && n.region === node.region && n.type === node.type)
        .sort((a, b) => b.reliability - a.reliability)
        .slice(0, 4)
        .map(n => `- ${n.name} (${n.country}, reliability: ${n.reliability}%)`)
        .join('\n') || '- No regional alternatives';

    const prompt = `You are an advanced AI supply chain intelligence system. Provide comprehensive analysis for this node — NOT just disaster prediction, but full supply chain optimization including order tracking, delay predictions, route optimization, and proactive efficiency suggestions.

NODE: ${node.name} (${node.type}) in ${node.country}, ${node.region}
Risk Score: ${riskData.score}/100 (${riskData.category})
Reliability: ${node.reliability}%

ACTIVE ORDERS THROUGH THIS NODE:
${orderSummary}

ACTIVE DISRUPTION EVENTS:
${eventList}

CONNECTED ROUTES:
${routeInfo}

REGIONAL ALTERNATIVES:
${nearbyAlternatives}

Provide a COMPREHENSIVE analysis in JSON format. Focus on:
1. Overall supply chain health (not just disasters)
2. Order delay predictions with specific reasons
3. Better/faster route suggestions
4. Cost optimization opportunities
5. Proactive efficiency improvements

Return JSON:
{
  "healthScore": 75,
  "healthStatus": "Moderate — some delays but manageable",
  "summary": "Comprehensive 2-3 sentence overview of node performance, efficiency, and outlook",
  "orderPredictions": [
    { "orderId": "ORD-XXX", "orderName": "Name", "currentDelay": "3 days", "predictedDelay": "5 days", "reason": "Why delayed", "suggestion": "How to speed up", "impact": "High/Medium/Low" }
  ],
  "routeOptimizations": [
    { "currentRoute": "A → B → C", "suggestedRoute": "A → D → C", "timeSaved": "2 days", "costDelta": "+5%", "reason": "Why this route is better", "confidence": 85 }
  ],
  "proactiveSuggestions": [
    { "type": "efficiency/cost/speed/risk", "title": "Short action title", "description": "What to do and why", "impact": "High/Medium/Low", "priority": "immediate/short-term/long-term" }
  ],
  "predictions": [
    { "timeframe": "Next 24-48 hours", "prediction": "What will happen", "confidence": 85, "impact": "High/Medium/Low" },
    { "timeframe": "Next 7 days", "prediction": "What will happen", "confidence": 70, "impact": "Medium" },
    { "timeframe": "Next 30 days", "prediction": "Outlook", "confidence": 55, "impact": "Low" }
  ],
  "recommendation": "Primary action to take right now"
}`;

    const text = await callGemini(prompt);
    return parseJsonResponse(text);
}

function parseJsonResponse(text) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return { error: 'Could not parse response', raw: text };
    } catch {
        return { error: 'Parse error', raw: text };
    }
}

function getMockResponse(prompt) {
    if (prompt.includes('Comprehensive') || prompt.includes('supply chain intelligence')) {
        return JSON.stringify({
            healthScore: 72,
            healthStatus: 'Moderate — active delays on 2 orders, routes performing at 85% efficiency',
            summary: 'This node is operating at moderate efficiency with 2 active orders experiencing delays averaging 5 days. Current congestion events are impacting throughput, but alternative routing through regional hubs could reduce delays by 40%. Proactive inventory repositioning is recommended.',
            orderPredictions: [
                { orderId: 'ORD-2024-001', orderName: 'Semiconductor Batch Alpha', currentDelay: '3 days', predictedDelay: '5 days', reason: 'Port congestion at intermediate hub combined with seasonal weather patterns', suggestion: 'Reroute through Dubai Logistics to bypass congestion — saves 2 days', impact: 'High' },
                { orderId: 'ORD-2024-003', orderName: 'Textile Shipment Bravo', currentDelay: '10 days', predictedDelay: '12 days', reason: 'Customs clearance delays compounded by regional strike action at origin', suggestion: 'Pre-clear documentation digitally and request priority handling at destination port', impact: 'High' },
            ],
            routeOptimizations: [
                { currentRoute: 'Shanghai → Singapore → Dubai → Rotterdam → New York', suggestedRoute: 'Shanghai → Singapore → Suez Canal → Rotterdam → New York', timeSaved: '3 days', costDelta: '-2%', reason: 'Direct Suez routing eliminates Dubai transshipment delay and reduces fuel costs', confidence: 88 },
                { currentRoute: 'Mumbai → Chennai → Dubai', suggestedRoute: 'Mumbai → Jeddah → Dubai', timeSaved: '1 day', costDelta: '+4%', reason: 'Jeddah port has 15% less congestion this month and faster customs processing', confidence: 76 },
            ],
            proactiveSuggestions: [
                { type: 'efficiency', title: 'Consolidate Shipments at Singapore Hub', description: 'Merging 3 small shipments into 1 container reduces transit costs by 18% and simplifies tracking. Schedule weekly consolidation window.', impact: 'High', priority: 'immediate' },
                { type: 'cost', title: 'Negotiate Bulk Rate with Rotterdam', description: 'Current volume qualifies for tier-2 pricing. Switching to quarterly contracts saves ~$45K/quarter on port handling fees.', impact: 'Medium', priority: 'short-term' },
                { type: 'speed', title: 'Pre-Position Safety Stock at Dubai', description: 'Keeping 2-week buffer inventory at Dubai warehouse reduces emergency airfreight costs by 60% during disruptions.', impact: 'High', priority: 'short-term' },
                { type: 'risk', title: 'Diversify Supplier Base in Southeast Asia', description: 'Over-reliance on single-region suppliers increases vulnerability. Onboard 1-2 backup suppliers in Vietnam or Thailand.', impact: 'Medium', priority: 'long-term' },
            ],
            predictions: [
                { timeframe: 'Next 24-48 hours', prediction: 'Port congestion easing slightly. Semiconductor order to clear Singapore by tomorrow. Textile shipment remains held at customs.', confidence: 87, impact: 'Medium' },
                { timeframe: 'Next 7 days', prediction: 'Overall throughput should improve 15% as weather patterns normalize. Recommend activating backup routing for any new high-priority orders.', confidence: 72, impact: 'Medium' },
                { timeframe: 'Next 30 days', prediction: 'Seasonal demand increase expected. Pre-position inventory at key hubs and confirm carrier capacity agreements to avoid spot market premiums.', confidence: 58, impact: 'Low' },
            ],
            recommendation: 'Immediately reroute ORD-2024-001 through Dubai bypass and pre-clear customs docs for ORD-2024-003 to reduce combined delays by 5 days.',
        });
    }
    if (prompt.includes('predictions') || prompt.includes('predict disruptions')) {
        return JSON.stringify({
            summary: 'Multiple disruption factors are converging on this node, requiring immediate attention.',
            predictions: [
                { timeframe: 'Next 24-48 hours', prediction: 'Delays of 12-18 hours expected due to ongoing weather and congestion events.', confidence: 87, impact: 'High' },
                { timeframe: 'Next 7 days', prediction: 'Risk level likely to remain elevated. Recommend activating backup supplier agreements.', confidence: 72, impact: 'Medium' },
                { timeframe: 'Next 30 days', prediction: 'Situation expected to normalize as seasonal weather patterns improve.', confidence: 58, impact: 'Low' },
            ],
            recommendation: 'Activate contingency routing through Singapore Hub.',
            estimatedDelay: '2-5 days',
        });
    }
    if (prompt.includes('alternatives')) {
        return JSON.stringify({
            alternatives: [
                { name: 'Singapore Hub', country: 'Singapore', reason: 'Highest reliability in region (95%)', estimatedCostIncrease: '+8%', estimatedTimeIncrease: '+2 days', safetyScore: 92 },
                { name: 'Dubai Logistics', country: 'UAE', reason: 'Strong reliability (91%) with excellent connectivity', estimatedCostIncrease: '+15%', estimatedTimeIncrease: '+4 days', safetyScore: 86 },
                { name: 'Rotterdam Hub', country: 'Netherlands', reason: "Europe's premier logistics hub with 96% reliability", estimatedCostIncrease: '+22%', estimatedTimeIncrease: '+6 days', safetyScore: 94 },
            ],
            recommendation: 'Redirect 70% of volume through Singapore Hub immediately.',
        });
    }
    return 'Your supply chain network currently shows 3 high-risk nodes requiring attention. I recommend checking your order delays and activating backup routing for priority shipments.';
}

