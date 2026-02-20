'use client';
// src/components/RiskScoreCard.jsx

const factors = [
    { key: 'weather', label: 'Weather Impact', icon: 'air', color: 'text-info', bg: 'bg-info' },
    { key: 'traffic', label: 'Traffic / Logistics', icon: 'local_shipping', color: 'text-warning', bg: 'bg-warning' },
    { key: 'reliability', label: 'Reliability Risk', icon: 'security', color: 'text-primary', bg: 'bg-primary' },
    { key: 'disaster', label: 'Disaster Risk', icon: 'local_fire_department', color: 'text-danger', bg: 'bg-danger' },
    { key: 'history', label: 'Historical Risk', icon: 'history', color: 'text-orange-500', bg: 'bg-orange-500' },
];

function ScoreBar({ value, bgClass }) {
    return (
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_currentColor] ${bgClass}`}
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

export default function RiskScoreCard({ node, riskData }) {
    if (!node || !riskData) return null;

    const riskLevel = riskData.score >= 66 ? 'high' : riskData.score >= 33 ? 'medium' : 'low';

    const colorClasses = {
        high: { text: 'text-danger', border: 'border-danger/40', bg: 'bg-danger/20', shadow: 'shadow-danger/40' },
        medium: { text: 'text-warning', border: 'border-warning/40', bg: 'bg-warning/20', shadow: 'shadow-warning/40' },
        low: { text: 'text-success', border: 'border-success/40', bg: 'bg-success/20', shadow: 'shadow-success/40' },
    }[riskLevel];

    const scoreColorHex = riskLevel === 'high' ? '#ef4444' : riskLevel === 'medium' ? '#f59e0b' : '#10b981';

    return (
        <div className="bg-card-dark/80 backdrop-blur-md border border-info/20 rounded-2xl p-5 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <div className="text-base font-bold text-white mb-1 tracking-tight">{node.name}</div>
                    <div className="text-xs text-gray-400 font-medium">{node.country} • {node.type}</div>
                </div>
                {/* Circular score */}
                <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                    style={{ background: `conic-gradient(${scoreColorHex} ${riskData.score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`, boxShadow: `0 0 15px ${scoreColorHex}40` }}
                >
                    <div className="w-11 h-11 rounded-full bg-background-dark/95 flex flex-col items-center justify-center border border-white/5 shadow-inner">
                        <span className={`text-sm font-black leading-none ${colorClasses.text}`}>{riskData.score}</span>
                        <span className="text-[8px] font-bold tracking-widest text-gray-500 mt-0.5">RISK</span>
                    </div>
                </div>
            </div>

            {/* Risk badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colorClasses.bg} ${colorClasses.border} border shadow-inner mb-5`}>
                <div className={`w-1.5 h-1.5 rounded-full bg-current ${colorClasses.text} shadow-[0_0_8px_currentColor]`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${colorClasses.text}`}>
                    {riskData.category} Risk
                </span>
            </div>

            {/* Factor bars */}
            <div className="flex flex-col gap-3.5">
                {factors.map(({ key, label, icon, color, bg }) => (
                    <div key={key}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`material-icons-outlined text-[14px] ${color}`}>{icon}</span>
                            <span className="text-xs font-medium text-gray-400 flex-1">{label}</span>
                            <span className="text-xs font-bold text-white min-w-[32px] text-right">
                                {riskData.factors[key]}%
                            </span>
                        </div>
                        <ScoreBar value={riskData.factors[key]} bgClass={bg} />
                    </div>
                ))}
            </div>

            {/* Node reliability */}
            <div className="mt-5 p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center shadow-inner">
                <span className="text-xs font-bold text-gray-400">Node Reliability</span>
                <span className="text-sm font-black text-success drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">{node.reliability}%</span>
            </div>
        </div>
    );
}
