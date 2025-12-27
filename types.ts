
export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'hub' | 'delivery' | 'warehouse';
}

export interface Vehicle {
  id: string;
  /** MongoDB identifier returned from the backend */
  _id?: string;
  regNumber: string;
  driverName: string;
  status: 'active' | 'idle' | 'warning' | 'emergency';
  lat: number;
  lng: number;
  speed: number;
  battery: number;
  cargo: string;
  destination: string;
  lastUpdate: string;
  path: [number, number][];
}

export interface LogEntry {
  id: string;
  /** MongoDB identifier returned from the backend */
  _id?: string;
  timestamp: string;
  vehicleId: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  hash: string;
}

export interface AIResponse {
  summary: string;
  recommendations: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
}
