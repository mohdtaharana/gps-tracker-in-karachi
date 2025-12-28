
import React from 'react';
import { AIResponse } from '../types';

interface AIDashboardProps {
  analysis: AIResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

const AIDashboard: React.FC<AIDashboardProps> = ({ analysis, loading, onRefresh }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border-t border-slate-800/50 p-6 relative overflow-hidden">
      {/* Decorative scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
              loading ? 'bg-indigo-500/20 border-indigo-500 animate-pulse scale-110 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-indigo-600/10 border-indigo-500/30'
            }`}>
              <svg className={`w-7 h-7 ${loading ? 'text-white' : 'text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                FLEET_AI_CORE
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30 uppercase tracking-[0.2em]">Active</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Distributed Intelligence Protocol // KHI-Sector-021</p>
            </div>
            <button 
              onClick={onRefresh}
              disabled={loading}
              className={`ml-auto px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 border ${
                loading 
                  ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/50 shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {loading ? 'CALCULATING...' : 'SYNC_INTELLIGENCE'}
            </button>
          </div>

          {analysis ? (
            <div className="grid md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 group hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Status</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      analysis.riskLevel === 'Low' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
                      analysis.riskLevel === 'Medium' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' :
                      'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                    }`}></span>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${
                      analysis.riskLevel === 'Low' ? 'text-emerald-400' :
                      analysis.riskLevel === 'Medium' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {analysis.riskLevel} Threat Level
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {analysis.summary}
                </p>
              </div>

              <div className="md:col-span-2 bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Tactical Directives</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800 group hover:bg-slate-800/30 transition-all">
                      <span className="w-6 h-6 bg-indigo-500/10 border border-indigo-500/30 rounded flex items-center justify-center text-[10px] text-indigo-400 font-black shrink-0">
                        0{i+1}
                      </span>
                      <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors leading-snug">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-32 border-2 border-dashed border-slate-800/50 rounded-2xl flex flex-col items-center justify-center text-slate-600 gap-3 group hover:border-indigo-500/20 transition-all cursor-default">
              <svg className="w-8 h-8 opacity-20 group-hover:opacity-40 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.641.32a2 2 0 01-1.636 0l-1.467-.733a2 2 0 00-1.636 0l-1.467.733a2 2 0 01-1.636 0l-1.467-.733a2 2 0 00-1.636 0l-1.467.733a2 2 0 01-1.636 0l-1.467-.733a2 2 0 00-1.636 0l-1.467.733a2 2 0 01-1.636 0l-1.467-.733a2 2 0 00-1.636 0l-1.467.733a2 2 0 01-1.636 0l-1.467-.733a2 2 0 00-1.636 0l-1.467.733a2 2 0 01-1.636 0l-1.127.564a2 2 0 00-1.022.547l-2.387.477a2 2 0 00-1.574 2.112l.255 1.53c.123.74.887 1.156 1.573.86l1.396-.6c.642-.276 1.365-.246 1.983.085l1.467.784a2 2 0 001.874 0l1.467-.784a2 2 0 011.874 0l1.467.784a2 2 0 001.874 0l1.467-.784a2 2 0 011.874 0l1.467.784a2 2 0 001.874 0l1.467-.784a2 2 0 011.874 0l1.467.784a2 2 0 001.874 0l1.467-.784a2 2 0 011.874 0l1.467.784a2 2 0 001.874 0l1.467-.784a2 2 0 011.874 0l1.114.557a2 2 0 001.574-.86l.255-1.53a2 2 0 00-1.574-2.112l-2.387-.477z" />
              </svg>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Core Standby // Waiting for Sync</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
