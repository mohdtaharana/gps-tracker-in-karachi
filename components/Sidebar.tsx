
import React, { useState } from 'react';
import { Vehicle, LogEntry } from '../types';

interface SidebarProps {
  vehicles: Vehicle[];
  logs: LogEntry[];
  onSelectVehicle: (v: Vehicle) => void;
  onUpdateStatus: (id: string, status: Vehicle['status']) => void;
  selectedVehicleId: string | null;
}

const getStatusConfig = (status: Vehicle['status']) => {
  switch (status) {
    case 'active':
      return { 
        color: 'text-emerald-400', 
        bg: 'bg-emerald-500/10', 
        accent: 'bg-emerald-500', 
        label: 'Active', 
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        pulse: 'animate-pulse'
      };
    case 'idle':
      return { 
        color: 'text-slate-400', 
        bg: 'bg-slate-500/10', 
        accent: 'bg-slate-500', 
        label: 'Idle', 
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        pulse: ''
      };
    case 'warning':
      return { 
        color: 'text-amber-400', 
        bg: 'bg-amber-500/10', 
        accent: 'bg-amber-500', 
        label: 'Warning', 
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        pulse: 'animate-pulse'
      };
    case 'emergency':
      return { 
        color: 'text-rose-400', 
        bg: 'bg-rose-500/15', 
        accent: 'bg-rose-500', 
        label: 'Critical', 
        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
        pulse: 'animate-ping'
      };
    default:
      return { color: 'text-slate-400', bg: 'bg-slate-500/10', accent: 'bg-slate-500', label: status, icon: '', pulse: '' };
  }
};

const Sidebar: React.FC<SidebarProps> = ({ vehicles, logs, onSelectVehicle, onUpdateStatus, selectedVehicleId }) => {
  const [search, setSearch] = useState('');
  const filteredVehicles = vehicles.filter(v => 
    v.regNumber.toLowerCase().includes(search.toLowerCase()) || 
    v.driverName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-96 bg-slate-950 border-r border-slate-800 flex flex-col h-full z-20">
      <div className="p-6 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.488V5.111a2 2 0 011.164-1.815l7-3.5a2 2 0 011.672 0l7 3.5A2 2 0 0121 5.111v10.377a2 2 0 01-1.553 1.948L15 20l-3 3-3-3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-tight">KHI SECURE</h1>
            <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-[0.2em]">Distributed Logistics</p>
          </div>
        </div>
        
        <div className="relative group">
          <input 
            type="text"
            placeholder="Search Units or Operators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-10 text-xs text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
          />
          <svg className="w-4 h-4 text-slate-500 absolute left-4 top-3.5 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredVehicles.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-500 text-xs italic">No units detected in the sector.</p>
          </div>
        )}
        {filteredVehicles.map(v => {
          const config = getStatusConfig(v.status);
          const vId = v._id || v.id;
          const isSelected = selectedVehicleId === vId;
          return (
            <button
              key={vId}
              onClick={() => onSelectVehicle(v)}
              className={`w-full text-left rounded-2xl border transition-all duration-300 relative overflow-hidden group/card ${
                isSelected 
                  ? 'bg-slate-900 border-slate-600 shadow-2xl ring-1 ring-white/5' 
                  : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.accent} ${v.status === 'emergency' ? 'animate-pulse' : ''}`}></div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 transition-transform group-hover/card:scale-110`}>
                         <svg className={`w-4 h-4 ${config.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={config.icon} />
                         </svg>
                      </div>
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${config.accent} ${config.pulse}`}></div>
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-black text-white tracking-tighter">{v.regNumber}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{v.cargo}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${config.bg} ${config.color} border border-white/5`}>
                    {config.label}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                   <div className="text-left">
                     <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Operator</p>
                     <p className="text-xs text-slate-300 font-bold">{v.driverName}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest">Velocity</p>
                     <p className="text-xs font-mono font-black text-slate-200">{v.speed} <span className="text-[9px] text-slate-600">KMH</span></p>
                   </div>
                </div>

                {isSelected && (
                  <div className="pt-4 mt-2 border-t border-white/5 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(vId, v.status === 'emergency' ? 'active' : 'emergency'); }}
                      className={`text-[9px] font-black py-2 rounded-lg border transition-all ${
                        v.status === 'emergency' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20'
                      }`}
                    >
                      {v.status === 'emergency' ? 'CLEAR ALARM' : 'PANIC ALERT'}
                    </button>
                    <div className="grid grid-cols-2 gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateStatus(vId, 'idle'); }}
                        className="bg-slate-800/50 border border-slate-700 text-slate-400 text-[9px] font-black py-2 rounded-lg hover:text-white hover:border-slate-500"
                      >
                        IDLE
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onUpdateStatus(vId, 'warning'); }}
                        className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black py-2 rounded-lg hover:bg-amber-500/20"
                      >
                        WARN
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

     
    </div>
  );
};

export default Sidebar;
