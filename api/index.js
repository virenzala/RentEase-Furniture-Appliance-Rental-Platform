const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('../backend/routes/authRoutes');
const productRoutes = require('../backend/routes/productRoutes');
const rentalRoutes = require('../backend/routes/rentalRoutes');
const maintenanceRoutes = require('../backend/routes/maintenanceRoutes');
const { checkDbHealth } = require('../backend/config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/products', '/products'], productRoutes);
app.use(['/api/rentals', '/rentals'], rentalRoutes);
app.use(['/api/maintenance', '/maintenance'], maintenanceRoutes);

app.get(['/api/health', '/health'], async (req, res) => {
  const dbHealth = await checkDbHealth();
  res.json({
    status: dbHealth.connected ? 'healthy' : 'degraded',
    message: 'RentEase Full-Stack Backend running successfully',
    timestamp: new Date().toISOString(),
    database: {
      provider: 'Supabase PostgreSQL',
      connected: dbHealth.connected,
      dbTimestamp: dbHealth.timestamp,
      error: dbHealth.error || null
    }
  });
});

app.use((req, res, next) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  const statusCode = (res.statusCode && res.statusCode !== 200) ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

module.exports = app;
