'use client';
// src/components/AlternativesPanel.jsx
import { useState } from 'react';
import { suggestAlternatives } from '@/services/gemini';
import { useData } from '@/contexts/DataContext';

export default function AlternativesPanel({ node, riskData }) {
    const [loading, setLoading] = useState(false);
    const [alternatives, setAlternatives] = useState(null);
    const { nodes } = useData();

    const handleFetch = async () => {
        setLoading(true);
        try {
            const result = await suggestAlternatives(node, riskData, nodes || []);
            setAlternatives(result);
        } finally {
            setLoading(false);
        }
    };

    if (!node) return null;
    if (riskData?.category === 'Low') return (
        <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-[13px] text-success-light flex items-center gap-2">
            <span className="material-icons-outlined text-[16px]">check_circle</span> This node is low risk — no alternative routing required.
        </div>
    );

    return (
        <div className="bg-card-dark/80 backdrop-blur-md border border-info/20 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2.5 mb-4 border-b border-border-dark pb-3">
                <span className="material-icons-outlined text-info text-lg">alt_route</span>
                <div className="text-sm font-bold text-white tracking-tight">Smart Alternatives</div>
            </div>

            {!alternatives && !loading && (
                <button
                    onClick={handleFetch}
                    className="w-full py-2.5 bg-info/10 hover:bg-info/20 border border-info/30 hover:border-info/50 rounded-xl text-info text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-icons-outlined text-[16px]">search</span> Find Alternative Routes
                </button>
            )}

            {loading && (
                <div className="flex items-center gap-2.5 py-4 text-info">
                    <span className="material-icons-outlined text-[16px] animate-spin">autorenew</span>
                    <span className="text-xs font-bold tracking-wide">Finding alternatives...</span>
                </div>
            )}

            {alternatives?.alternatives && (
                <div className="flex flex-col gap-3">
                    {alternatives.alternatives.map((alt, i) => (
                        <div key={i} className="p-3.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-info/15 flex items-center justify-center text-[11px] font-bold text-info border border-info/30 shadow-inner">
                                    {i + 1}
                                </div>
                                <span className="text-xs font-bold text-white tracking-wide">{alt.name}</span>
                                <span className="text-[10px] text-gray-500 font-medium">{alt.country}</span>
                                <div className="ml-auto flex items-center gap-1 bg-warning/10 px-1.5 py-0.5 rounded border border-warning/20">
                                    <span className="material-icons-outlined text-[12px] text-warning">star</span>
                                    <span className="text-[10px] text-warning font-bold">{alt.safetyScore}</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed mb-3 font-medium">{alt.reason}</p>
                            <div className="flex gap-4 border-t border-white/5 pt-2 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-icons-outlined text-[14px] text-danger">attach_money</span>
                                    <span className="text-[11px] font-bold text-danger">{alt.estimatedCostIncrease}</span>
                                </div>
                                <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                                    <span className="material-icons-outlined text-[14px] text-gray-400">schedule</span>
                                    <span className="text-[11px] font-bold text-gray-400">{alt.estimatedTimeIncrease}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {alternatives.recommendation && (
                        <div className="p-3 bg-info/10 border border-info/20 rounded-xl flex items-start gap-2 mt-2 shadow-inner">
                            <span className="material-icons-outlined text-[16px] text-info shrink-0 mt-0.5">check_circle</span>
                            <p className="text-[11px] text-info-light leading-relaxed m-0 font-medium">{alternatives.recommendation}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
