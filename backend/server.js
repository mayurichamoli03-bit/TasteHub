const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Configure CORS
const allowedOrigins = process.env.FRONTEND_URL;
if (allowedOrigins && allowedOrigins !== '*') {
  const origins = allowedOrigins.split(',').map(o => o.trim());
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (origins.indexOf(origin) !== -1 || origins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local development ease
    },
    credentials: true
  }));
} else {
  // Allow all origins by default for easy local development
  app.use(cors());
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TasteHub API Server is running happily!',
    documentation: {
      auth: '/api/auth',
      dishes: '/api/dishes',
      orders: '/api/orders'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});






  
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing from the .env file');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 TasteHub Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

