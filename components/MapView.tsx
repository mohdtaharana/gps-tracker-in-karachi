
import React, { useEffect, useRef } from 'react';
// Added Leaflet import and CSS to fix 'L' related errors
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { KARACHI_BOUNDS, KARACHI_LOCATIONS } from '../constants';
import { Vehicle } from '../types';

interface MapViewProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
}

const MapView: React.FC<MapViewProps> = ({ vehicles, selectedVehicle }) => {
  // Using L types from imported Leaflet package
  const mapRef = useRef<L.Map | null>(null);
  const vehicleMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<{ [key: string]: L.Polyline }>({});

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        zoomControl: false,
        attributionControl: false
      }).setView(KARACHI_BOUNDS.center, KARACHI_BOUNDS.zoom);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);

      // Add Karachi Landmarks/Hubs
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
          .bindTooltip(loc.name, { permanent: false, direction: 'top' });
      });

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    vehicles.forEach(v => {
      // Use MongoDB _id if available, fallback to simulated id
      const vId = v._id || v.id;

      // Update or create marker
      const icon = L.divIcon({
        className: 'vehicle-icon',
        html: `<div class="relative">
          <div class="absolute -inset-2 bg-emerald-500/20 rounded-full animate-ping"></div>
          <div class="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-white shadow-xl transform rotate-45">
             <div class="transform -rotate-45 text-[10px] text-white font-bold">V</div>
          </div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (vehicleMarkersRef.current[vId]) {
        vehicleMarkersRef.current[vId].setLatLng([v.lat, v.lng]);
      } else {
        vehicleMarkersRef.current[vId] = L.marker([v.lat, v.lng], { icon })
          .addTo(mapRef.current!)
          .bindTooltip(v.regNumber, { permanent: true, direction: 'right', className: 'bg-slate-900 border-slate-700 text-emerald-400 font-mono px-2 py-0.5 text-xs' });
      }

      // Update polyline path
      if (polylineRef.current[vId]) {
        polylineRef.current[vId].setLatLngs(v.path);
      } else {
        polylineRef.current[vId] = L.polyline(v.path, { color: '#10b981', weight: 2, opacity: 0.3, dashArray: '5, 10' }).addTo(mapRef.current!);
      }
    });

    if (selectedVehicle) {
      mapRef.current.flyTo([selectedVehicle.lat, selectedVehicle.lng], 15, { animate: true, duration: 1.5 });
    }
  }, [vehicles, selectedVehicle]);

  return (
    <div className="relative flex-1 bg-slate-950 overflow-hidden">
      <div id="map" className="absolute inset-0"></div>
      
      {/* Map Overlays */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
        <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-lg border border-slate-700 shadow-2xl">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Map Legend</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span>Industrial Hub</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>Warehouse</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Retail Hub</span>
            </div>
          </div>
        </div>
      </div>

      {selectedVehicle && (
        <div className="absolute bottom-6 left-6 z-50 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-emerald-500/50 shadow-2xl w-80">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-lg font-bold text-emerald-400">{selectedVehicle.regNumber}</h2>
              <p className="text-xs text-slate-400">Heading to: {selectedVehicle.destination}</p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-1 rounded font-bold">ENCRYPTED</div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800 my-2">
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Speed</p>
              <p className="font-mono text-sm">{selectedVehicle.speed} km/h</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Load Type</p>
              <p className="font-mono text-sm">{selectedVehicle.cargo}</p>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 rounded font-semibold transition-colors">
              Contact Driver
            </button>
            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded font-semibold transition-colors">
              Route Re-calc
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
