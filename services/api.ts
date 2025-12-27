
import { Vehicle, LogEntry } from '../types';

const API_BASE = 'http://localhost:5000/api';

export const fetchFleet = async (): Promise<Vehicle[]> => {
  const res = await fetch(`${API_BASE}/fleet`);
  if (!res.ok) throw new Error('Backend offline');
  return await res.json();
};

export const fetchLogs = async (): Promise<LogEntry[]> => {
  const res = await fetch(`${API_BASE}/logs`);
  if (!res.ok) throw new Error('Backend offline');
  return await res.json();
};

export const seedDatabase = async (): Promise<void> => {
  const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
  if (!res.ok) throw new Error('Seeding failed');
};

export const updateVehicleStatusAPI = async (id: string, status: string) => {
  const res = await fetch(`${API_BASE}/fleet/update-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status })
  });
  if (!res.ok) throw new Error('Update failed');
  return await res.json();
};
