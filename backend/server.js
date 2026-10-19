const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

const DEFAULT_ORIGINS = [
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
  if (!origin) return true;
  const allowed = DEFAULT_ORIGINS.concat(extraOriginsFromEnv());
  if (allowed.includes(origin)) return true;
  if (/^https:\/\/tastehub-frontend(-[a-z0-9-]+)?\.vercel\.app$/i.test(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;
  return false;
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let connectPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectPromise) {
    return connectPromise;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not configured');
  }

  connectPromise = mongoose.connect(mongoUri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 5
  }).then((connection) => {
    console.log('MongoDB connected');
    return connection;
  }).catch((err) => {
    connectPromise = null;
    console.error('MongoDB connection error:', err.message);
    throw err;
  });

  return connectPromise;
}

function isHealthPath(path) {
  return path === '/' || path === '/health' || path === '/api/health';
}

app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS' || isHealthPath(req.path)) {
    return next();
  }

  try {
    await connectDB();
    return next();
  } catch (err) {
    const missingUri = !process.env.MONGO_URI;
    return res.status(503).json({
      success: false,
      message: missingUri
        ? 'Database is not configured. Set MONGO_URI in the Vercel backend project environment variables.'
        : 'Database is temporarily unavailable. Please try again.'
    });
  }
});

app.get(['/', '/health', '/api/health'], (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'TasteHub API Server is up and running!',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

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
