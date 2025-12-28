
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/karachi_logistics';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to Karachi Secure MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Vehicle Schema
const VehicleSchema = new mongoose.Schema({
  regNumber: String,
  driverName: String,
  status: { type: String, enum: ['active', 'idle', 'warning', 'emergency'], default: 'active' },
  lat: Number,
  lng: Number,
  speed: Number,
  battery: Number,
  cargo: String,
  destination: String,
  path: [[Number, Number]],
  lastUpdate: { type: Date, default: Date.now }
});

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

// Security Log Schema
const LogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  vehicleId: String,
  message: String,
  severity: { type: String, enum: ['info', 'warning', 'critical'] },
  hash: String
});

const Log = mongoose.model('Log', LogSchema);

// Seeding Route
app.post('/api/seed', async (req, res) => {
  try {
    await Vehicle.deleteMany({});
    const initialData = [
      {
        regNumber: 'KHI-LOG-A24',
        driverName: 'Mohammad Ali',
        status: 'active',
        lat: 24.8607,
        lng: 67.0011,
        speed: 45,
        battery: 88,
        cargo: 'Medical Supplies',
        destination: 'North Nazimabad',
        path: [[24.8607, 67.0011]]
      },
      {
        regNumber: 'KHI-LOG-B92',
        driverName: 'Zeeshan Khan',
        status: 'active',
        lat: 24.8100,
        lng: 67.0500,
        speed: 32,
        battery: 42,
        cargo: 'FMCG Goods',
        destination: 'DHA Phase 8',
        path: [[24.8100, 67.0500]]
      },
      {
        regNumber: 'KHI-LOG-E99',
        driverName: 'Imran Ahmed',
        status: 'emergency',
        lat: 24.7800,
        lng: 67.3300,
        speed: 0,
        battery: 5,
        cargo: 'Heavy Machinery',
        destination: 'Port Qasim Hub',
        path: [[24.7800, 67.3300]]
      }
    ];
    const created = await Vehicle.insertMany(initialData);
    res.json({ message: 'Database seeded successfully', count: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Endpoints
app.get('/api/fleet', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/fleet/update-status', async (req, res) => {
  const { id, status } = req.body;
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(id, { status, lastUpdate: Date.now() }, { new: true });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    
    // Create audit log using imported crypto
    const newLog = new Log({
      vehicleId: vehicle.regNumber,
      message: `Status updated to ${status.toUpperCase()}`,
      severity: status === 'emergency' ? 'critical' : status === 'warning' ? 'warning' : 'info',
      hash: crypto.randomBytes(16).toString('hex')
    });
    await newLog.save();
    res.json({ vehicle, log: newLog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Secure Backend running on port ${PORT}`));
