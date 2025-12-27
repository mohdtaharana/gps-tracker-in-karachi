
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import AIDashboard from './components/AIDashboard';
import { analyzeLogistics } from './services/geminiService';
import { fetchFleet, fetchLogs, updateVehicleStatusAPI, seedDatabase } from './services/api';
import { Vehicle, LogEntry, AIResponse } from './types';
import { KARACHI_LOCATIONS, VEHICLE_ID_PREFIX } from './constants';

const INITIAL_SIM_VEHICLES: Vehicle[] = [
  {
    id: 'sim_1',
    regNumber: `${VEHICLE_ID_PREFIX}SIM-01`,
    driverName: 'Offline Simulator',
    status: 'active',
    lat: 24.8607,
    lng: 67.0011,
    speed: 40,
    battery: 90,
    cargo: 'Simulation Data',
    destination: 'Site Area',
    lastUpdate: new Date().toISOString(),
    path: [[24.8607, 67.0011]]
  }
];

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_SIM_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIResponse | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'simulated'>('simulated');
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync Logic
  const syncData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const data = await fetchFleet();
      
      // Auto-seed if empty
      if (data.length === 0) {
        console.log('Database empty, seeding...');
        await seedDatabase();
        const seededData = await fetchFleet();
        setVehicles(seededData);
      } else {
        setVehicles(data);
      }

      const logData = await fetchLogs();
      setLogs(logData);
      setBackendStatus('connected');
    } catch (err) {
      console.warn('Backend connection failed, staying in simulation mode.');
      setBackendStatus('simulated');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 5000); // Polling for real-time-ish updates
    return () => clearInterval(interval);
  }, [syncData]);

  const handleUpdateStatus = async (id: string, newStatus: Vehicle['status']) => {
    if (backendStatus === 'connected') {
      try {
        const { vehicle, log } = await updateVehicleStatusAPI(id, newStatus);
        setVehicles(prev => prev.map(v => v._id === id || v.id === id ? vehicle : v));
        setLogs(prev => [log, ...prev].slice(0, 50));
        return;
      } catch (err) {
        console.error('API Update failed:', err);
      }
    }

    // Fallback Simulation Update
    setVehicles(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, status: newStatus, lastUpdate: new Date().toISOString() };
      }
      return v;
    }));
  };

  const handleRefreshAI = async () => {
    setLoadingAI(true);
    const analysis = await analyzeLogistics(vehicles);
    setAiAnalysis(analysis);
    setLoadingAI(false);
  };

  const selectedVehicle = vehicles.find(v => (v._id || v.id) === selectedVehicleId) || null;

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar 
        vehicles={vehicles} 
        logs={logs} 
        onSelectVehicle={(v) => setSelectedVehicleId(v._id || v.id)}
        onUpdateStatus={handleUpdateStatus}
        selectedVehicleId={selectedVehicleId}
      />
      
      <main className="flex-1 flex flex-col relative">
        <MapView 
          vehicles={vehicles} 
          selectedVehicle={selectedVehicle}
        />
        
        <AIDashboard analysis={aiAnalysis} loading={loadingAI} onRefresh={handleRefreshAI} />

        {/* System Monitoring */}
        <div className="absolute top-4 left-4 z-[1000] flex gap-3 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-3 rounded-xl shadow-2xl flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 animate-pulse'}`}></div>
            <div>
              <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Central Ledger</p>
              <p className={`text-xs font-mono font-bold ${backendStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {backendStatus === 'connected' ? 'DB::SYNCED' : 'LOCAL::MODE'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-3 rounded-xl shadow-2xl flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-indigo-500 animate-spin' : 'bg-emerald-500 opacity-20'}`}></div>
             <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">
               {isSyncing ? 'Synchronizing...' : 'IDLE'}
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
