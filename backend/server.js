const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files routing (for uploaded images, if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const { checkDbHealth } = require('./config/db');

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
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

// Serve frontend build static files in production if needed, or fallback error
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Server Configuration
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 RentEase Server running on port ${PORT}`);
    console.log(`📂 Database: Supabase PostgreSQL Cloud Database`);
    console.log(`⚡ API Health URL: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
