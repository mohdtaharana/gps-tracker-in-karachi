
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import AIDashboard from './components/AIDashboard';
import { analyzeLogistics } from './services/geminiService';
import { fetchFleet, fetchLogs, updateVehicleStatusAPI, seedDatabase } from './services/api';
import { Vehicle, LogEntry, AIResponse } from './types';
import { VEHICLE_ID_PREFIX } from './constants';

const INITIAL_SIM_VEHICLES: Vehicle[] = [
  {
    id: 'sim_1',
    regNumber: `${VEHICLE_ID_PREFIX}ALPHA-1`,
    driverName: 'Zubair Ali',
    status: 'active',
    lat: 24.8607,
    lng: 67.0011,
    speed: 45,
    battery: 92,
    cargo: 'Electronics',
    destination: 'Saddar',
    lastUpdate: new Date().toISOString(),
    path: [[24.8607, 67.0011]]
  },
  {
    id: 'sim_2',
    regNumber: `${VEHICLE_ID_PREFIX}BETA-2`,
    driverName: 'Ahmed Khan',
    status: 'warning',
    lat: 24.8100,
    lng: 67.0500,
    speed: 15,
    battery: 45,
    cargo: 'Textiles',
    destination: 'Port Qasim',
    lastUpdate: new Date().toISOString(),
    path: [[24.8100, 67.0500]]
  }
];

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_SIM_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'boot_1',
      timestamp: new Date().toLocaleTimeString(),
      vehicleId: 'SYSTEM',
      message: 'KHI SECURE Command Node initialized. Secure link standby.',
      severity: 'info',
      hash: 'BOOT_SIG_' + Math.random().toString(16).slice(2, 10)
    }
  ]);
  const [aiAnalysis, setAiAnalysis] = useState<AIResponse | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'simulated'>('simulated');
  
  const simulationIntervalRef = useRef<number | null>(null);

  const syncData = useCallback(async () => {
    try {
      const data = await fetchFleet();
      if (data && data.length > 0) {
        setVehicles(data);
        setBackendStatus('connected');
        const logData = await fetchLogs();
        if (logData.length > 0) setLogs(logData);
      } else {
        await seedDatabase().catch(() => {});
      }
    } catch (err) {
      setBackendStatus('simulated');
    }
  }, []);

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 5000);

    // Background Heartbeat simulation to keep logs active
    const heartbeatInterval = setInterval(() => {
      const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
      const heartbeatLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        vehicleId: randomVehicle.regNumber,
        message: `TELEMETRY_SYNC: Unit ${randomVehicle.regNumber} signal verified via Sector-021 relay.`,
        severity: 'info',
        hash: 'SHA256_' + Math.random().toString(16).slice(2, 12)
      };
      setLogs(prev => [heartbeatLog, ...prev].slice(0, 50));
    }, 15000);

    simulationIntervalRef.current = window.setInterval(() => {
      if (backendStatus === 'simulated') {
        setVehicles(prev => prev.map(v => {
          const newLat = v.lat + (Math.random() - 0.5) * 0.0008;
          const newLng = v.lng + (Math.random() - 0.5) * 0.0008;
          return {
            ...v,
            lat: newLat,
            lng: newLng,
            speed: Math.max(0, Math.min(80, v.speed + (Math.random() - 0.5) * 10)),
            battery: Math.max(0, v.battery - 0.02),
            path: [...v.path, [newLat, newLng]].slice(-30) as [number, number][]
          };
        }));
      }
    }, 2500);

    return () => {
      clearInterval(interval);
      clearInterval(heartbeatInterval);
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, [syncData, backendStatus, vehicles.length]);

  const handleUpdateStatus = async (id: string, newStatus: Vehicle['status']) => {
    if (backendStatus === 'connected') {
      try {
        const { vehicle, log } = await updateVehicleStatusAPI(id, newStatus);
        setVehicles(prev => prev.map(v => (v._id || v.id) === id ? vehicle : v));
        setLogs(prev => [log, ...prev]);
        return;
      } catch (e) { console.error(e); }
    }
    
    setVehicles(prev => prev.map(v => {
      const vId = v._id || v.id;
      if (vId === id) {
        const newLog: LogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          vehicleId: v.regNumber,
          message: `MANUAL_OVERRIDE: [${v.regNumber}] protocol set to ${newStatus.toUpperCase()}`,
          severity: newStatus === 'emergency' ? 'critical' : newStatus === 'warning' ? 'warning' : 'info',
          hash: 'LOCAL_SIG_' + Math.random().toString(16).slice(2, 10)
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50));
        return { ...v, status: newStatus };
      }
      return v;
    }));
  };

  const handleEstablishLink = (v: Vehicle) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      vehicleId: v.regNumber,
      message: `HANDSHAKE_SUCCESS: Encrypted telemetry link established with unit ${v.regNumber}.`,
      severity: 'info',
      hash: 'RSA_SIG_' + Math.random().toString(16).slice(2, 14)
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const handleRefreshAI = async () => {
    setLoadingAI(true);
    const analysis = await analyzeLogistics(vehicles);
    setAiAnalysis(analysis);
    setLoadingAI(false);
  };

  const selectedVehicle = vehicles.find(v => (v._id || v.id) === selectedVehicleId) || null;

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-100 overflow-hidden font-sans selection:bg-emerald-500/30">
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
          onEstablishLink={handleEstablishLink}
        />
        
        {/* <AIDashboard analysis={aiAnalysis} loading={loadingAI} onRefresh={handleRefreshAI} /> */}

        <div className="absolute top-6 left-6 z-[1000]">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] flex items-center gap-4 transition-all hover:border-emerald-500/30 border-l-4 border-l-emerald-500/50">
            <div className={`w-3 h-3 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'} animate-pulse`}></div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Grid Link Status</p>
              <p className={`text-sm font-mono font-black ${backendStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {backendStatus === 'connected' ? 'CENTRAL_NODE_ONLINE' : 'DISTRIBUTED_EDGE_MODE'}
              </p>
            </div>
          </div>
        </div>

        {aiAnalysis?.riskLevel === 'High' && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-rose-500/20 backdrop-blur-xl border border-rose-500/50 px-8 py-4 rounded-2xl shadow-2xl animate-pulse">
            <p className="text-xs font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              Operational Threat Alert
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
