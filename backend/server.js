const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

const DEFAULT_ORIGINS = [
  'https://taste-hub-aoz5.vercel.app',
  'https://tastehub-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5500',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5500'
];

function extraOriginsFromEnv() {
  if (!process.env.FRONTEND_URL) return [];
  return process.env.FRONTEND_URL.split(',').map((value) => value.trim()).filter(Boolean);
}

function isAllowedOrigin(origin) {
  if (!origin) return true; // Server-to-server, curl, local health checks
  const allowed = DEFAULT_ORIGINS.concat(extraOriginsFromEnv());
  if (allowed.includes('*') || process.env.FRONTEND_URL === '*') return true;
  if (allowed.includes(origin)) return true;
  // Match any TasteHub Vercel deployment (e.g. taste-hub-aoz5, tastehub-frontend, taste-hub-preview-*)
  if (/^https:\/\/(taste-?hub|tastehub)(-.*)?\.vercel\.app$/i.test(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;
  return false;
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by TasteHub CORS policy.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * MongoDB Atlas Connection Management (Serverless Optimized)
 * Uses global caching to prevent connection storms across Vercel Lambda executions.
 */
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

function sanitizeMongoUri(uri) {
  if (!uri) return 'not set';
  return uri.replace(/:([^:@]+)@/, ':****@');
}

async function connectDB() {
  // If already connected, reuse existing active connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection dropped, disconnected, or disconnecting, reset promise
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.promise = null;
    cached.conn = null;
  }

  if (cached.promise) {
    return cached.promise;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUri) {
    const error = new Error('Database connection string is missing. Please set MONGO_URI in your environment variables.');
    error.isConfigError = true;
    throw error;
  }

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000, // 5s timeout to avoid hanging serverless functions
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    dbName: process.env.DB_NAME || 'tastehub'
  };

  console.log(`[Database] Connecting to MongoDB Atlas (${sanitizeMongoUri(mongoUri)})...`);

  cached.promise = mongoose.connect(mongoUri, opts)
    .then((connection) => {
      console.log('✅ Successfully connected to MongoDB Atlas');
      cached.conn = connection;
      return connection;
    })
    .catch((err) => {
      cached.promise = null;
      cached.conn = null;
      console.error('❌ MongoDB Atlas connection error:', err.message);
      throw err;
    });

  return cached.promise;
}

function isHealthPath(path) {
  return path === '/' || path === '/health' || path === '/api/health';
}

/**
 * Middleware: ensure database is connected before processing data operations
 */
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS' || isHealthPath(req.path)) {
    return next();
  }

  try {
    await connectDB();
    return next();
  } catch (err) {
    const isConfigError = err.isConfigError || !(process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL);
    return res.status(503).json({
      success: false,
      message: isConfigError
        ? 'Database is not configured. Set MONGO_URI in the Vercel backend project environment variables.'
        : 'Database is temporarily unavailable. Please try again.'
    });
  }
});

/**
 * Health Check Endpoint
 * Checks actual database connectivity status rather than returning a static disconnected flag.
 */
app.get(['/', '/health', '/api/health'], async (req, res) => {
  let dbStatus = 'disconnected';

  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch (err) {
    dbStatus = 'disconnected';
  }

  const isHealthy = dbStatus === 'connected';

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'OK' : 'Degraded',
    message: isHealthy 
      ? 'TasteHub API Server is up and running!' 
      : 'TasteHub API Server is running, but database connection is unavailable.',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// API Routes with both /api prefix and root prefix
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message && err.message.includes('CORS') ? err.message : 'Internal Server Error'
  });
});

// Start local listener when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .catch(() => null)
    .finally(() => {
      app.listen(PORT, () => {
        console.log(`TasteHub Server running locally on http://localhost:${PORT}`);
      });
    });
}

module.exports = app;
