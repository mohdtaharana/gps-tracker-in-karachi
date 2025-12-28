
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { KARACHI_BOUNDS, KARACHI_LOCATIONS } from '../constants';
import { Vehicle } from '../types';

interface MapViewProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onEstablishLink: (v: Vehicle) => void;
}

const getHexColor = (status: string) => {
  switch (status) {
    case 'emergency': return '#f43f5e'; // rose-500
    case 'warning': return '#fbbf24';   // amber-400 (brighter for map)
    case 'active': return '#10b981';    // emerald-500
    default: return '#64748b';          // slate-500
  }
};

const MapView: React.FC<MapViewProps> = ({ vehicles, selectedVehicle, onEstablishLink }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const vehicleMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<{ [key: string]: L.Polyline }>({});
  const [isLinking, setIsLinking] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    setIsLinked(false);
    setIsLinking(false);
  }, [selectedVehicle?.id, selectedVehicle?._id]);

  const handleLinkClick = () => {
    if (!selectedVehicle || isLinked) return;
    setIsLinking(true);
    setTimeout(() => {
      setIsLinking(false);
      setIsLinked(true);
      onEstablishLink(selectedVehicle);
    }, 1500);
  };

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true
      }).setView(KARACHI_BOUNDS.center, KARACHI_BOUNDS.zoom);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);

      KARACHI_LOCATIONS.forEach(loc => {
        const icon = L.divIcon({
          className: 'custom-hub-icon',
          html: `<div class="w-4 h-4 rounded-full border-2 border-slate-900 shadow-lg ${
            loc.type === 'hub' ? 'bg-indigo-500' : loc.type === 'warehouse' ? 'bg-amber-500' : 'bg-emerald-500'
          }"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        L.marker([loc.lat, loc.lng], { icon })
          .addTo(mapRef.current!)
          .bindTooltip(loc.name, { direction: 'top', className: 'bg-slate-900 border-slate-800 text-white text-[10px] rounded-lg px-2' });
      });

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    vehicles.forEach(v => {
      const vId = v._id || v.id;
      const hexColor = getHexColor(v.status);
      
      // Explicitly define color classes for Tailwind
      const statusBgClass = v.status === 'emergency' ? 'bg-rose-500' : 
                            v.status === 'warning' ? 'bg-amber-400' : 
                            v.status === 'idle' ? 'bg-slate-500' : 'bg-emerald-500';

      const icon = L.divIcon({
        // Adding status to className forces Leaflet to update the DOM node
        className: `vehicle-icon status-${v.status}`,
        html: `<div class="relative">
          ${v.status === 'emergency' ? `<div class="absolute -inset-4 bg-rose-500/40 rounded-full animate-ping"></div>` : ''}
          ${v.status === 'warning' ? `<div class="absolute -inset-3 bg-amber-400/30 rounded-full animate-pulse"></div>` : ''}
          ${v.status === 'active' ? `<div class="absolute -inset-2 bg-emerald-500/20 rounded-full animate-pulse"></div>` : ''}
          <div class="w-8 h-8 ${statusBgClass} rounded-xl flex items-center justify-center border-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.6)] transform rotate-45 transition-all duration-500">
             <div class="transform -rotate-45 text-[11px] text-white font-black">${v.status === 'emergency' ? '!' : 'V'}</div>
          </div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (vehicleMarkersRef.current[vId]) {
        vehicleMarkersRef.current[vId].setLatLng([v.lat, v.lng]);
        vehicleMarkersRef.current[vId].setIcon(icon);
      } else {
        vehicleMarkersRef.current[vId] = L.marker([v.lat, v.lng], { icon })
          .addTo(mapRef.current!)
          .bindTooltip(v.regNumber, { 
            permanent: false, 
            direction: 'right', 
            className: 'bg-slate-900 border-slate-700 text-white font-mono px-2 py-1 text-[10px] rounded-md shadow-2xl' 
          });
      }

      if (v.path && v.path.length > 0) {
        if (polylineRef.current[vId]) {
          polylineRef.current[vId].setLatLngs(v.path);
          polylineRef.current[vId].setStyle({ 
            color: hexColor,
            opacity: v.status === 'emergency' ? 0.9 : 0.6
          });
        } else {
          polylineRef.current[vId] = L.polyline(v.path, { 
            color: hexColor, 
            weight: 3, 
            opacity: 0.6, 
            dashArray: v.status === 'idle' ? '5, 10' : 'none'
          }).addTo(mapRef.current!);
        }
      }
    });

    if (selectedVehicle) {
      mapRef.current.flyTo([selectedVehicle.lat, selectedVehicle.lng], 15, { animate: true, duration: 1.2 });
    }
  }, [vehicles, selectedVehicle]);

  const isCriticalBattery = selectedVehicle && selectedVehicle.battery < 15;

  return (
    <div className="relative flex-1 bg-[#020617] overflow-hidden">
      <div ref={containerRef} id="map" className="absolute inset-0"></div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none z-0">
        <h1 className="text-[20rem] font-black tracking-[-0.05em] text-white leading-none uppercase">Sector-K</h1>
      </div>
      
      <div className="absolute top-6 right-6 z-[500]">
        <div className="bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 border-b border-slate-800 pb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Telemetry Grid
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-md bg-rose-500 rotate-45 border border-white/20"></div>
              <span className="text-[10px] font-black text-slate-300 tracking-wider">PANIC_SIGNAL</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-md bg-amber-400 rotate-45 border border-white/20"></div>
              <span className="text-[10px] font-black text-slate-300 tracking-wider">WARN_ADVISORY</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-md bg-emerald-500 rotate-45 border border-white/20"></div>
              <span className="text-[10px] font-black text-slate-300 tracking-wider">GRID_STABLE</span>
            </div>
          </div>
        </div>
      </div>

      {selectedVehicle && (
        <div className={`absolute bottom-8 left-8 z-[500] bg-slate-900/98 backdrop-blur-2xl p-6 rounded-3xl border transition-all duration-500 w-[340px] ${
          selectedVehicle.status === 'emergency' ? 'border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)]' : 
          selectedVehicle.status === 'warning' ? 'border-amber-400/50 shadow-[0_0_50px_rgba(251,191,36,0.2)]' :
          'border-emerald-500/30 shadow-[0_30px_60px_rgba(0,0,0,0.6)]'
        } animate-in slide-in-from-bottom-8`}>
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedVehicle.status === 'emergency' ? 'bg-rose-500 animate-ping' : 
                  selectedVehicle.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'
                }`}></span>
                <h2 className="text-2xl font-black text-white tracking-tighter leading-none">{selectedVehicle.regNumber}</h2>
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">OP_UNIT: {selectedVehicle.driverName}</p>
            </div>
            <div className={`px-2.5 py-1 rounded-lg border text-[8px] font-black tracking-widest uppercase transition-all ${
              isLinked ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              {isLinked ? 'SYNC_ACTIVE' : 'LINK_STANDBY'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-5 border-y border-slate-800/60 my-6">
            <div className="space-y-1">
              <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Velocity</p>
              <p className="font-mono text-lg font-black text-slate-100">{Math.round(selectedVehicle.speed)} <span className="text-[10px] text-slate-600 font-bold">KM/H</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Sector Cargo</p>
              <p className="text-sm font-black text-slate-200 uppercase tracking-tight">{selectedVehicle.cargo}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className={isCriticalBattery ? 'text-rose-500 animate-pulse' : 'text-slate-500'}>Energy Core Status</span>
              <span className={isCriticalBattery ? 'text-rose-400' : 'text-emerald-400'}>{Math.round(selectedVehicle.battery)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
              <div className={`h-full transition-all duration-1000 ${
                isCriticalBattery ? 'bg-gradient-to-r from-rose-600 to-rose-400' : 
                selectedVehicle.status === 'warning' ? 'bg-gradient-to-r from-amber-500 to-amber-300' :
                'bg-gradient-to-r from-emerald-600 to-emerald-400'
              }`} style={{ width: `${selectedVehicle.battery}%` }}></div>
            </div>
          </div>

          <button 
            onClick={handleLinkClick}
            disabled={isLinking || isLinked}
            className={`w-full mt-8 text-[11px] py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
              isLinked ? 'bg-slate-800/50 text-slate-500 border border-emerald-500/20 shadow-none' : 
              isLinking ? 'bg-indigo-600 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-900/20 active:scale-[0.98]'
            }`}
          >
            {isLinking ? 'ENCRYPTING LINK...' : isLinked ? 'LINK ESTABLISHED' : 'ESTABLISH SECURE LINK'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MapView;
