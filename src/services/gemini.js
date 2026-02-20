// src/services/gemini.js
// Gemini AI integration for supply chain disruption prediction

import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const prompt = `You are an AI supply chain analyst. Analyze the following supply chain node and predict disruptions.

Node: ${node.name} (${node.type}) in ${node.country}
Region: ${node.region}
Current Risk Score: ${riskData.score}/100 (${riskData.category} risk)
Node Reliability: ${node.reliability}%

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
    if (prompt.includes('predictions')) {
        return JSON.stringify({
            summary: 'Multiple disruption factors are converging on this node, requiring immediate attention.',
            predictions: [
                { timeframe: 'Next 24-48 hours', prediction: 'Delays of 12-18 hours expected due to ongoing weather and congestion events. Monitor closely for escalation.', confidence: 87, impact: 'High' },
                { timeframe: 'Next 7 days', prediction: 'Risk level likely to remain elevated. Recommend activating backup supplier agreements as precaution.', confidence: 72, impact: 'Medium' },
                { timeframe: 'Next 30 days', prediction: 'Situation expected to normalize as seasonal weather patterns improve and strikes are resolved.', confidence: 58, impact: 'Low' },
            ],
            recommendation: 'Activate contingency routing through Singapore Hub and pre-position inventory at Dubai warehouse.',
            estimatedDelay: '2-5 days',
        });
    }
    if (prompt.includes('alternatives')) {
        return JSON.stringify({
            alternatives: [
                { name: 'Singapore Hub', country: 'Singapore', reason: 'Highest reliability in region (95%), low current disruption events', estimatedCostIncrease: '+8%', estimatedTimeIncrease: '+2 days', safetyScore: 92 },
                { name: 'Dubai Logistics', country: 'UAE', reason: 'Strong reliability (91%) with excellent Middle East connectivity', estimatedCostIncrease: '+15%', estimatedTimeIncrease: '+4 days', safetyScore: 86 },
                { name: 'Rotterdam Hub', country: 'Netherlands', reason: 'Europe\'s premier logistics hub with 96% reliability', estimatedCostIncrease: '+22%', estimatedTimeIncrease: '+6 days', safetyScore: 94 },
            ],
            recommendation: 'Redirect 70% of volume through Singapore Hub immediately, maintain 30% on primary route.',
        });
    }
    return 'Your supply chain network currently shows 3 high-risk nodes requiring immediate attention. I recommend activating backup supplier agreements for Shanghai and Tokyo while the typhoon and earthquake situations are resolved. Overall network resilience remains at moderate levels.';
}
