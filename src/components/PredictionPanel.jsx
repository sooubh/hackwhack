'use client';
// src/components/PredictionPanel.jsx
import { useState } from 'react';
import { predictDisruptions } from '@/services/gemini';
import { useData } from '@/contexts/DataContext';

const confidenceColorClass = (c) => c >= 75 ? 'text-success bg-success/10 border-success/20' : c >= 50 ? 'text-warning bg-warning/10 border-warning/20' : 'text-danger bg-danger/10 border-danger/20';
const impactColorClass = (i) => i === 'High' ? 'text-danger bg-danger/10' : i === 'Medium' ? 'text-warning bg-warning/10' : 'text-success bg-success/10';

export default function PredictionPanel({ node, riskData }) {
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState(null);
    const { events } = useData();

    const handlePredict = async () => {
        if (!node) return;
        setLoading(true);
        setError(null);
        try {
            const result = await predictDisruptions(node, riskData, events || []);
            setPrediction(result);
        } catch (e) {
            setError('Failed to get prediction. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card-dark/80 backdrop-blur-md border border-primary/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5 border-b border-border-dark pb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-inner">
                    <span className="material-icons-outlined text-primary text-xl">auto_awesome</span>
                </div>
                <div>
                    <div className="text-sm font-extrabold text-white tracking-tight">AI Disruption Prediction</div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Powered by Gemini 2.0</div>
                </div>
            </div>

            {!node && (
                <p className="text-sm text-gray-500 text-center py-6 font-medium">
                    Select a node on the map to get AI predictions
                </p>
            )}

            {node && !prediction && !loading && (
                <>
                    <p className="text-sm text-gray-400 mb-5 leading-relaxed font-medium">
                        Get AI-powered disruption predictions for <strong className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">{node.name}</strong>
                    </p>
                    <button
                        onClick={handlePredict}
                        className="w-full py-3 bg-gradient-to-r from-accent-purple to-indigo-600 hover:from-indigo-500 hover:to-accent-purple border-none rounded-xl text-white text-sm font-bold cursor-pointer transition-all shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.6)] flex items-center justify-center gap-2 group"
                    >
                        <span className="material-icons-outlined text-sm group-hover:animate-pulse">bolt</span> Predict Disruptions
                    </button>
                </>
            )}

            {loading && (
                <div className="flex flex-col items-center gap-4 py-8 text-primary">
                    <span className="material-icons-outlined text-4xl animate-spin">autorenew</span>
                    <p className="text-sm font-bold text-gray-400 tracking-wide">Analyzing with Gemini AI...</p>
                </div>
            )}

            {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 text-danger text-sm font-medium flex items-center gap-2">
                    <span className="material-icons-outlined text-lg">error_outline</span> {error}
                </div>
            )}

            {prediction && !prediction.error && (
                <div className="animate-in fade-in duration-500">
                    {/* Summary */}
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl mb-5 shadow-inner">
                        <p className="text-sm text-primary-light font-medium leading-relaxed m-0">{prediction.summary}</p>
                    </div>

                    {/* Timeline predictions */}
                    <div className="flex flex-col gap-3 mb-5">
                        {prediction.predictions?.map((p, i) => (
                            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <span className="material-icons-outlined text-[14px] text-gray-400">schedule</span>
                                        <span className="text-xs font-bold text-gray-300">{p.timeframe}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md ${impactColorClass(p.impact)}`}>
                                            {p.impact}
                                        </span>
                                        <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md border ${confidenceColorClass(p.confidence)}`}>
                                            {p.confidence}% CONF.
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed m-0 font-medium">{p.prediction}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recommendation */}
                    <div className="p-4 bg-success/10 border border-success/20 rounded-xl mb-4 shadow-inner">
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="material-icons-outlined text-[16px] text-success">verified</span>
                            <span className="text-xs font-black text-success tracking-widest uppercase">RECOMMENDATION</span>
                        </div>
                        <p className="text-sm text-success-light leading-relaxed m-0 font-medium">{prediction.recommendation}</p>
                    </div>

                    {/* Estimated delay */}
                    {prediction.estimatedDelay && (
                        <div className="flex items-center gap-2 bg-card-dark border border-border-dark p-3 rounded-xl mb-4">
                            <span className="material-icons-outlined text-[16px] text-warning">warning_amber</span>
                            <span className="text-sm font-bold text-warning">Est. delay: {prediction.estimatedDelay}</span>
                        </div>
                    )}

                    {/* Re-run */}
                    <button
                        onClick={handlePredict}
                        className="w-full mt-2 py-2.5 bg-transparent hover:bg-primary/5 border border-primary/30 hover:border-primary/50 rounded-xl text-primary text-xs font-bold cursor-pointer transition-all flex justify-center items-center gap-2 group"
                    >
                        <span className="material-icons-outlined text-[16px] group-hover:-rotate-180 transition-transform duration-500">refresh</span> Refresh Prediction
                    </button>
                </div>
            )}
        </div>
    );
}
