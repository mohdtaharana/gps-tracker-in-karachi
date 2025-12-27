
import React from 'react';
import { AIResponse } from '../types';

interface AIDashboardProps {
  analysis: AIResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

const AIDashboard: React.FC<AIDashboardProps> = ({ analysis, loading, onRefresh }) => {
  return (
    <div className="bg-slate-900/50 border-t border-slate-800 p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-600/20 rounded-full flex items-center justify-center border border-indigo-500/50">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Fleet Intelligence</h2>
              <p className="text-xs text-slate-400">Gemini Powered Real-time Karachi Logistics Analysis</p>
            </div>
            <button 
              onClick={onRefresh}
              disabled={loading}
              className={`ml-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Analyze Logistics
            </button>
          </div>

          {analysis ? (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-slate-400">Operational Summary</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    analysis.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-400' :
                    analysis.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {analysis.riskLevel} RISK
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>

              <div className="md:col-span-2 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">AI Recommendations</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 text-sm text-slate-300 items-start">
                      <span className="w-5 h-5 bg-indigo-500/20 rounded flex items-center justify-center text-[10px] text-indigo-400 font-bold shrink-0 mt-0.5">{i+1}</span>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-24 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-500 italic">
              Click 'Analyze Logistics' to get insights on Karachi fleet movements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
