const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes/index');
const { sendError, AppError } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' },
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // tighter limit on auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many auth attempts, please wait 15 minutes.' },
  },
});

app.use('/api', globalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ── Request Logging (dev only) ────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      const color = res.statusCode >= 500 ? '\x1b[31m'
        : res.statusCode >= 400 ? '\x1b[33m'
        : '\x1b[32m';
      console.log(`${color}${req.method}\x1b[0m ${req.originalUrl} ${res.statusCode} — ${ms}ms`);
    });
    next();
  });
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} does not exist`,
    },
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log unexpected errors
  if (!err.isOperational) {
    console.error('\x1b[31m[UNHANDLED ERROR]\x1b[0m', err);
  }

  sendError(res, err);
});

// ── Start Server ──────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\x1b[32m✔ Finance Dashboard API running on http://localhost:${PORT}/api/v1\x1b[0m`);
    console.log(`  Health check → http://localhost:${PORT}/api/v1/health`);
    console.log(`  Environment  → ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;