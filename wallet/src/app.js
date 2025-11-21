/**
 * Express Application Configuration
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./utils/logger');

// Routes
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const walletRouter = require('./routes/wallet');
const transactionsRouter = require('./routes/transactions');
const userTransactionsRouter = require('./routes/userTransactions');

const app = express();

// Trust proxy (for rate limiting behind NGINX)
app.set('trust proxy', 1);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Stricter limit for auth endpoints
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Moderate limit for payment endpoints
  message: 'Too many payment attempts, please try again later',
});

// Apply rate limiters
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/wallet/pay/', paymentLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/users', userTransactionsRouter);

// Wallet Routes (HTML pages + API)
app.use('/wallet', walletRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Mock Wallet Payment Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      createPayment: 'POST /wallet/pay',
      paymentPage: 'GET /wallet/pay/:transaction_id',
      processPayment: 'POST /wallet/pay/:transaction_id',
      topup: 'POST /wallet/topup',
      createUser: 'POST /api/users',
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      getTransaction: 'GET /api/transactions/:transaction_id',
      getUserTransactions: 'GET /api/users/:userId/transactions',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate Entry',
      field: Object.keys(err.keyPattern)[0],
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
