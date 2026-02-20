// src/services/reportGenerator.js
// Generates downloadable PDF reports for accepted AI suggestions

/**
 * Generate and download a PDF-like report for an accepted suggestion.
 * Uses browser print dialog — user can save as PDF.
 */
export function generateReport({ type, details, node, timestamp }) {
    const reportId = `VIG-${Date.now().toString(36).toUpperCase()}`;
    const date = new Date(timestamp || Date.now()).toLocaleString('en-IN', {
        dateStyle: 'full', timeStyle: 'short'
    });

    let bodyContent = '';

    if (type === 'order') {
        bodyContent = `
            <div class="section">
                <h2>📦 Order Update Report</h2>
                <table>
                    <tr><td class="label">Order ID</td><td>${details.orderId}</td></tr>
                    <tr><td class="label">Order Name</td><td>${details.orderName}</td></tr>
                    <tr><td class="label">Previous Delay</td><td>${details.currentDelay}</td></tr>
                    <tr><td class="label">Predicted Delay</td><td>${details.predictedDelay}</td></tr>
                    <tr><td class="label">Delay Reason</td><td>${details.reason}</td></tr>
                    <tr><td class="label">Impact Level</td><td><span class="badge ${details.impact?.toLowerCase()}">${details.impact}</span></td></tr>
                </table>
            </div>
            <div class="section">
                <h2>✅ Accepted Action</h2>
                <div class="action-box">${details.suggestion}</div>
                <p class="note">This suggestion has been accepted and the order status has been updated to <strong>"action_taken"</strong>. All downstream systems have been notified.</p>
            </div>
        `;
    } else if (type === 'route') {
        bodyContent = `
            <div class="section">
                <h2>🛣️ Route Optimization Report</h2>
                <table>
                    <tr><td class="label">Previous Route</td><td>${details.currentRoute}</td></tr>
                    <tr><td class="label">New Route</td><td><strong style="color:#059669">${details.suggestedRoute}</strong></td></tr>
                    <tr><td class="label">Time Saved</td><td>${details.timeSaved}</td></tr>
                    <tr><td class="label">Cost Impact</td><td>${details.costDelta}</td></tr>
                    <tr><td class="label">Confidence</td><td>${details.confidence}%</td></tr>
                    <tr><td class="label">Reason</td><td>${details.reason}</td></tr>
                </table>
            </div>
            <div class="section">
                <h2>✅ Route Change Accepted</h2>
                <div class="action-box">Route has been updated from "${details.currentRoute}" to "${details.suggestedRoute}". All shipments on this route will be redirected.</div>
                <p class="note">Logistics partners and warehouse teams have been notified of the route change.</p>
            </div>
        `;
    } else if (type === 'suggestion') {
        bodyContent = `
            <div class="section">
                <h2>💡 Action Item Report</h2>
                <table>
                    <tr><td class="label">Action</td><td><strong>${details.title}</strong></td></tr>
                    <tr><td class="label">Category</td><td>${details.type}</td></tr>
                    <tr><td class="label">Description</td><td>${details.description}</td></tr>
                    <tr><td class="label">Impact</td><td><span class="badge ${details.impact?.toLowerCase()}">${details.impact}</span></td></tr>
                    <tr><td class="label">Priority</td><td>${details.priority}</td></tr>
                </table>
            </div>
            <div class="section">
                <h2>✅ Action Accepted</h2>
                <div class="action-box">This action item has been marked as accepted and added to the operations queue for implementation.</div>
            </div>
        `;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SupplyChain AI — Report ${reportId}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { font-size: 24px; color: #4f46e5; }
        .header .meta { text-align: right; font-size: 12px; color: #6b7280; }
        .header .meta strong { color: #1f2937; display: block; font-size: 14px; margin-bottom: 4px; }
        .section { margin-bottom: 28px; }
        .section h2 { font-size: 18px; margin-bottom: 14px; color: #111827; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        td.label { font-weight: 600; color: #4b5563; width: 160px; background: #f9fafb; }
        .badge { padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .badge.high { background: #fef2f2; color: #dc2626; }
        .badge.medium { background: #fffbeb; color: #d97706; }
        .badge.low { background: #f0fdf4; color: #059669; }
        .action-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; font-size: 14px; color: #065f46; line-height: 1.6; }
        .note { font-size: 13px; color: #6b7280; margin-top: 12px; font-style: italic; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
        .node-info { background: #f3f4f6; border-radius: 10px; padding: 16px; margin-bottom: 24px; }
        .node-info h3 { font-size: 16px; margin-bottom: 8px; }
        .node-info p { font-size: 13px; color: #6b7280; }
        @media print { body { padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>🔒 SupplyChain AI</h1>
            <p style="font-size: 14px; color: #6b7280; margin-top: 4px;">Supply Chain Intelligence Report</p>
        </div>
        <div class="meta">
            <strong>Report #${reportId}</strong>
            ${date}
        </div>
    </div>

    ${node ? `
    <div class="node-info">
        <h3>📍 Node: ${node.name}</h3>
        <p>${node.type} • ${node.region} • Reliability: ${node.reliability}%</p>
    </div>
    ` : ''}

    ${bodyContent}

    <div class="section">
        <h2>📋 Status</h2>
        <table>
            <tr><td class="label">Status</td><td><span class="badge low">ACCEPTED</span></td></tr>
            <tr><td class="label">Accepted On</td><td>${date}</td></tr>
            <tr><td class="label">Report ID</td><td>${reportId}</td></tr>
            <tr><td class="label">Platform</td><td>SupplyChain AI — India Operations</td></tr>
        </table>
    </div>

    <div class="footer">
        <p>This report was auto-generated by SupplyChain AI Supply Chain Management Platform.</p>
        <p style="margin-top: 4px;">© 2024 SupplyChain AI — Confidential</p>
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
