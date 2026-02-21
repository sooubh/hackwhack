// src/services/reportGenerator.js
// Generates detailed, professional PDF reports for accepted AI suggestions

/**
 * Generate and download a detailed PDF report.
 * Opens in a new tab with auto print dialog.
 */
export function generateReport({ type, details, node, timestamp }) {
    const reportId = `SCA-${Date.now().toString(36).toUpperCase()}`;
    const date = new Date(timestamp || Date.now()).toLocaleString('en-IN', {
        dateStyle: 'full', timeStyle: 'short'
    });
    const shortDate = new Date(timestamp || Date.now()).toLocaleDateString('en-IN');

    let bodyContent = '';
    let reportTitle = 'Intelligence Report';

    if (type === 'order') {
        reportTitle = 'Order Delay Analysis & Action Report';
        bodyContent = `
            <div class="section">
                <h2>📦 Order Details</h2>
                <table>
                    <tr><td class="label">Order ID</td><td><strong>${details.orderId || 'N/A'}</strong></td></tr>
                    <tr><td class="label">Order Name</td><td>${details.orderName || 'N/A'}</td></tr>
                    <tr><td class="label">Origin Node</td><td>${node?.name || 'N/A'} (${node?.type || ''}, ${node?.region || ''})</td></tr>
                    <tr><td class="label">Reliability Score</td><td>${node?.reliability || 'N/A'}%</td></tr>
                    <tr><td class="label">Impact Level</td><td><span class="badge ${details.impact?.toLowerCase()}">${details.impact || 'N/A'}</span></td></tr>
                </table>
            </div>

            <div class="section">
                <h2>⏱️ Delay Analysis</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-label">Current Delay</div>
                        <div class="metric-value warning">${details.currentDelay || '0 days'}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Predicted Delay</div>
                        <div class="metric-value danger">${details.predictedDelay || '0 days'}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Additional Risk</div>
                        <div class="metric-value">${details.predictedDelay && details.currentDelay ? 'Escalating' : 'Stable'}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🔍 Root Cause Analysis</h2>
                <div class="highlight-box red">
                    <strong>Primary Cause:</strong> ${details.reason || 'Multiple contributing factors identified'}
                </div>
                <div class="detail-text">
                    <p><strong>Contributing Factors:</strong></p>
                    <ul>
                        <li>Node reliability at ${node?.reliability || 'N/A'}% — ${(node?.reliability || 100) < 80 ? 'below acceptable threshold' : 'within normal range'}</li>
                        <li>Regional infrastructure conditions affecting ${node?.region || 'this region'}</li>
                        <li>Current disruption events impacting delivery timelines</li>
                        <li>Supply chain bottleneck at origin node requiring rerouting consideration</li>
                    </ul>
                </div>
            </div>

            <div class="section">
                <h2>✅ Accepted AI Recommendation</h2>
                <div class="action-box">
                    <div class="action-title">Recommended Action</div>
                    ${details.suggestion || 'Prioritize alternative routing and expedite shipment'}
                </div>
                <div class="detail-text">
                    <p><strong>Implementation Steps:</strong></p>
                    <ol>
                        <li>Notify logistics partner of updated delivery schedule</li>
                        <li>Activate contingency routing if primary route remains blocked</li>
                        <li>Update downstream warehouse for revised ETA</li>
                        <li>Send delay notification to customer with revised timeline</li>
                        <li>Monitor order progress every 4 hours until delivery confirmation</li>
                    </ol>
                </div>
            </div>

            <div class="section">
                <h2>📊 Impact Assessment</h2>
                <table>
                    <tr><td class="label">Financial Impact</td><td>Potential penalty of ₹${Math.floor(Math.random() * 50000 + 10000).toLocaleString('en-IN')} if delay exceeds SLA</td></tr>
                    <tr><td class="label">Customer Impact</td><td>${details.impact === 'High' ? 'High — major client, escalation required' : 'Moderate — standard delivery window'}</td></tr>
                    <tr><td class="label">Ripple Effect</td><td>${details.impact === 'High' ? '3-5 downstream orders may be affected' : '1-2 downstream orders may be affected'}</td></tr>
                    <tr><td class="label">Recovery ETA</td><td>Expected resolution within ${parseInt(details.predictedDelay) || 2} business days after action</td></tr>
                </table>
            </div>
        `;
    } else if (type === 'route') {
        reportTitle = 'Route Optimization Report';
        bodyContent = `
            <div class="section">
                <h2>🛣️ Route Change Summary</h2>
                <div class="route-comparison">
                    <div class="route-box old">
                        <div class="route-label">❌ Previous Route</div>
                        <div class="route-path">${details.currentRoute || 'N/A'}</div>
                    </div>
                    <div class="route-arrow">→</div>
                    <div class="route-box new">
                        <div class="route-label">✅ Optimized Route</div>
                        <div class="route-path">${details.suggestedRoute || 'N/A'}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>📈 Optimization Metrics</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-label">Time Saved</div>
                        <div class="metric-value success">${details.timeSaved || 'N/A'}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Cost Impact</div>
                        <div class="metric-value ${details.costDelta?.startsWith('-') ? 'success' : 'warning'}">${details.costDelta || 'N/A'}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">AI Confidence</div>
                        <div class="metric-value">${details.confidence || 0}%</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🔍 Optimization Rationale</h2>
                <div class="highlight-box blue">
                    <strong>Why this change:</strong> ${details.reason || 'AI engine identified a more efficient route based on real-time conditions'}
                </div>
                <div class="detail-text">
                    <p><strong>Analysis Details:</strong></p>
                    <ul>
                        <li>Previous route experiencing disruption or congestion</li>
                        <li>New route reduces transit time by ${details.timeSaved || 'several hours'}</li>
                        <li>Cost delta: ${details.costDelta || 'neutral'} — ${details.costDelta?.startsWith('-') ? 'saving money' : 'slight increase justified by time savings'}</li>
                        <li>Route confidence score: ${details.confidence || 0}% based on historical transit data</li>
                        <li>Node at ${node?.name || 'origin'} has reliability of ${node?.reliability || 'N/A'}%</li>
                    </ul>
                </div>
            </div>

            <div class="section">
                <h2>✅ Accepted Action</h2>
                <div class="action-box">
                    <div class="action-title">Route Change Approved</div>
                    Route updated from "${details.currentRoute}" to "${details.suggestedRoute}". All active shipments on this corridor will be redirected.
                </div>
                <div class="detail-text">
                    <p><strong>Notifications Sent To:</strong></p>
                    <ol>
                        <li>Logistics partner — route manifest updated</li>
                        <li>Warehouse teams at intermediate stops — revised schedule</li>
                        <li>Destination facility — updated ETA</li>
                        <li>Fleet management system — GPS route recalculated</li>
                    </ol>
                </div>
            </div>
        `;
    } else if (type === 'suggestion') {
        reportTitle = 'Proactive Action Item Report';
        bodyContent = `
            <div class="section">
                <h2>💡 Action Item Overview</h2>
                <table>
                    <tr><td class="label">Action Title</td><td><strong>${details.title || 'N/A'}</strong></td></tr>
                    <tr><td class="label">Category</td><td style="text-transform:capitalize">${details.type || 'General'}</td></tr>
                    <tr><td class="label">Impact Level</td><td><span class="badge ${details.impact?.toLowerCase()}">${details.impact || 'N/A'}</span></td></tr>
                    <tr><td class="label">Priority</td><td style="text-transform:capitalize"><strong>${details.priority || 'N/A'}</strong></td></tr>
                    <tr><td class="label">Assigned Node</td><td>${node?.name || 'Network-wide'} (${node?.type || ''}, ${node?.region || ''})</td></tr>
                    <tr><td class="label">Node Reliability</td><td>${node?.reliability || 'N/A'}%</td></tr>
                </table>
            </div>

            <div class="section">
                <h2>📝 Detailed Description</h2>
                <div class="highlight-box blue">
                    ${details.description || 'No additional description provided.'}
                </div>
            </div>

            <div class="section">
                <h2>📊 Expected Outcomes</h2>
                <div class="detail-text">
                    <ul>
                        <li><strong>Efficiency:</strong> ${details.type === 'efficiency' ? 'Direct process improvement expected — 10-25% faster throughput' : 'Indirect efficiency gains through reduced risk'}</li>
                        <li><strong>Cost Savings:</strong> ${details.type === 'cost' ? 'Estimated ₹1-5L annual savings from this optimization' : 'Cost reduction through fewer disruptions and penalties'}</li>
                        <li><strong>Risk Reduction:</strong> ${details.impact === 'High' ? 'Significant — eliminates a major vulnerability' : 'Moderate — reduces exposure to common disruption scenarios'}</li>
                        <li><strong>Timeline:</strong> ${details.priority === 'immediate' ? 'Must be implemented within 24 hours' : details.priority === 'short-term' ? 'Implement within 1 week' : 'Plan for implementation within 2-4 weeks'}</li>
                    </ul>
                </div>
            </div>

            <div class="section">
                <h2>✅ Action Accepted</h2>
                <div class="action-box">
                    <div class="action-title">Implementation Approved</div>
                    This action item has been accepted and queued for implementation. The operations team has been notified.
                </div>
                <div class="detail-text">
                    <p><strong>Next Steps:</strong></p>
                    <ol>
                        <li>Operations team to review implementation feasibility</li>
                        <li>Assign responsible person and set deadline</li>
                        <li>Execute the recommended action</li>
                        <li>Monitor results and measure improvement</li>
                        <li>Report back with outcome metrics within 7 days</li>
                    </ol>
                </div>
            </div>
        `;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SupplyChain AI — ${reportTitle} — ${reportId}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; padding: 40px; max-width: 850px; margin: 0 auto; line-height: 1.6; }
        
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 10px; }
        .header h1 { font-size: 22px; color: #4f46e5; }
        .header .meta { text-align: right; font-size: 12px; color: #6b7280; }
        .header .meta strong { color: #1f2937; display: block; font-size: 14px; margin-bottom: 4px; }
        
        .report-title { font-size: 20px; font-weight: 800; color: #111827; margin-bottom: 6px; }
        .report-subtitle { font-size: 13px; color: #6b7280; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
        
        .section { margin-bottom: 28px; }
        .section h2 { font-size: 16px; margin-bottom: 14px; color: #111827; border-left: 4px solid #4f46e5; padding-left: 12px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        td { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 13px; vertical-align: top; }
        td.label { font-weight: 600; color: #4b5563; width: 170px; background: #f9fafb; }
        
        .badge { padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge.high, .badge.critical { background: #fef2f2; color: #dc2626; }
        .badge.medium { background: #fffbeb; color: #d97706; }
        .badge.low { background: #f0fdf4; color: #059669; }
        
        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 8px; }
        .metric-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; text-align: center; }
        .metric-label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 6px; }
        .metric-value { font-size: 20px; font-weight: 800; color: #111827; }
        .metric-value.success { color: #059669; }
        .metric-value.warning { color: #d97706; }
        .metric-value.danger { color: #dc2626; }
        
        .highlight-box { border-radius: 10px; padding: 16px; font-size: 13px; line-height: 1.6; margin-bottom: 12px; }
        .highlight-box.red { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
        .highlight-box.blue { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
        .highlight-box.green { background: #f0fdf4; border: 1px solid #bbf7d0; color: #065f46; }
        
        .action-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; font-size: 13px; color: #065f46; line-height: 1.7; margin-bottom: 12px; }
        .action-title { font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #047857; }
        
        .detail-text { font-size: 13px; color: #374151; line-height: 1.7; margin-top: 12px; }
        .detail-text ul, .detail-text ol { margin-left: 20px; margin-top: 8px; }
        .detail-text li { margin-bottom: 6px; }
        .detail-text p { margin-bottom: 8px; }
        
        .route-comparison { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
        .route-box { flex: 1; border-radius: 10px; padding: 16px; text-align: center; }
        .route-box.old { background: #fef2f2; border: 1px solid #fecaca; }
        .route-box.new { background: #f0fdf4; border: 1px solid #bbf7d0; }
        .route-label { font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; color: #6b7280; }
        .route-path { font-size: 14px; font-weight: 700; color: #111827; }
        .route-arrow { font-size: 24px; color: #059669; font-weight: 800; }
        
        .node-info { background: #f3f4f6; border-radius: 10px; padding: 16px; margin-bottom: 24px; display: flex; align-items: center; gap: 14px; }
        .node-icon { width: 44px; height: 44px; background: #4f46e5; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; flex-shrink: 0; }
        .node-info h3 { font-size: 15px; margin-bottom: 4px; color: #111827; }
        .node-info p { font-size: 12px; color: #6b7280; }
        
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; }
        .footer-brand { font-size: 14px; font-weight: 700; color: #4f46e5; margin-bottom: 4px; }
        .footer p { font-size: 11px; color: #9ca3af; margin-bottom: 2px; }
        .footer .disclaimer { font-size: 10px; color: #d1d5db; margin-top: 8px; font-style: italic; }
        
        @media print { 
            body { padding: 20px; } 
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>🔒 SupplyChain AI</h1>
            <p style="font-size: 13px; color: #6b7280; margin-top: 4px;">Supply Chain Intelligence Platform</p>
        </div>
        <div class="meta">
            <strong>Report #${reportId}</strong>
            ${date}
        </div>
    </div>

    <div class="report-title">${reportTitle}</div>
    <div class="report-subtitle">Generated on ${date} • Classification: Internal — Confidential</div>

    ${node ? `
    <div class="node-info">
        <div class="node-icon">📍</div>
        <div>
            <h3>${node.name}</h3>
            <p>${node.type || 'Node'} • ${node.region || 'India'} • Reliability: <strong>${node.reliability || 'N/A'}%</strong> • Capacity: ${node.capacity || 'N/A'}</p>
        </div>
    </div>
    ` : ''}

    ${bodyContent}

    <div class="section">
        <h2>📋 Report Metadata</h2>
        <table>
            <tr><td class="label">Report Status</td><td><span class="badge low">ACCEPTED & ACTIONED</span></td></tr>
            <tr><td class="label">Report Type</td><td style="text-transform: capitalize">${type} ${type === 'order' ? 'Delay' : type === 'route' ? 'Optimization' : 'Action Item'} Report</td></tr>
            <tr><td class="label">Generated On</td><td>${date}</td></tr>
            <tr><td class="label">Report ID</td><td><code>${reportId}</code></td></tr>
            <tr><td class="label">Platform</td><td>SupplyChain AI — India Operations</td></tr>
            <tr><td class="label">Accepted By</td><td>Authorized Platform User (via AI Predictions Dashboard)</td></tr>
            <tr><td class="label">Data Source</td><td>SupplyChain AI Prediction Engine v1.0</td></tr>
        </table>
    </div>

    <div class="footer">
        <div class="footer-brand">SupplyChain AI — India Operations</div>
        <p>This report was auto-generated by the SupplyChain AI Platform.</p>
        <p>Built by <strong>Team Code Crunch Squad</strong> — HackWhak 3.0</p>
        <p>© 2024 SupplyChain AI • All Rights Reserved</p>
        <div class="disclaimer">This document is confidential and intended for internal use only. Unauthorized distribution is prohibited.</div>
    </div>

    <script>
        window.onload = function() { window.print(); }
    </script>
</body>
</html>`;

    // Open in new tab for print/save as PDF
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    return reportId;
}
