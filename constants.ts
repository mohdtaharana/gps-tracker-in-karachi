
import { Location } from './types';

export const KARACHI_BOUNDS = {
  center: [24.8607, 67.0011] as [number, number],
  zoom: 12
};

export const KARACHI_LOCATIONS: Location[] = [
  { id: 'h1', name: 'Port Qasim Industrial Area', lat: 24.7758, lng: 67.3340, type: 'hub' },
  { id: 'h2', name: 'S.I.T.E Area', lat: 24.8981, lng: 67.0142, type: 'hub' },
  { id: 'h3', name: 'Korangi Creek Industrial Park', lat: 24.8089, lng: 67.1147, type: 'hub' },
  { id: 'd1', name: 'DHA Phase 8', lat: 24.7954, lng: 67.0543, type: 'delivery' },
  { id: 'd2', name: 'North Nazimabad Block L', lat: 24.9392, lng: 67.0347, type: 'delivery' },
  { id: 'd3', name: 'Gulshan-e-Iqbal Block 13D', lat: 24.9124, lng: 67.0864, type: 'delivery' },
  { id: 'w1', name: 'Super Highway Warehouse', lat: 24.9824, lng: 67.1423, type: 'warehouse' },
  { id: 'w2', name: 'Malir Cantt Warehouse', lat: 24.9174, lng: 67.2023, type: 'warehouse' }
];

export const VEHICLE_ID_PREFIX = 'KHI-LOG-';
