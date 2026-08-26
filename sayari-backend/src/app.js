'use strict';

require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const morgan      = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const {
  helmetConfig, globalLimiter, mongoSanitizer,
  xssCleaner, hppProtect, suspiciousRequestDetector,
} = require('./middlewares/security.middleware');
const { maintenanceMode, appVersionGate } = require('./middlewares/system.middleware');
const errorHandler = require('./middlewares/errorHandler');
const routes       = require('./routes/index');
const proxyRouter = require('./routes/proxy');
const { AppError } = require('./utils/appError');

let logger;
try { logger = require('./config/logger').logger; } catch { logger = console; }
let requestLogger;
try { requestLogger = require('./config/logger').requestLogger; } catch { requestLogger = (req,res,next) => next(); }

const app = express();

// ── Trust proxy (Nginx / Docker) ──────────────
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────
app.use(helmetConfig);

// ── CORS ──────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',').map(o => o.trim());

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new AppError(`Origin ${origin} not allowed by CORS`, 403, 'CORS_BLOCKED'));
  },
  credentials  : true,
  methods      : ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-app-version','x-app-platform','x-correlation-id'],
  exposedHeaders: ['x-correlation-id'],
}));

// ── Compression ───────────────────────────────
app.use(compression());

// ── Raw body for webhooks (before JSON parser) ─
app.use('/api/v1/webhooks', (req, res, next) => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    req.rawBody = data;
    try { req.body = JSON.parse(data); } catch { req.body = {}; }
    next();
  });
});

// ── Body parsers ──────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ── Input sanitisation ────────────────────────
// app.use(mongoSanitizer);
app.use(xssCleaner);
app.use(hppProtect);
app.use(suspiciousRequestDetector);

// ── Request logging ───────────────────────────
app.use(requestLogger);
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Global rate limit ─────────────────────────
app.use('/api/', globalLimiter);

// ── System middleware ─────────────────────────
app.use(maintenanceMode);
app.use(appVersionGate);

// ── Health probes ─────────────────────────────
app.get('/health', (req, res) => res.json({
  status : 'ok',
  service: 'Sayari Platform API',
  version: process.env.npm_package_version || '1.0.0',
  env    : process.env.NODE_ENV,
  uptime : Math.floor(process.uptime()),
  ts     : new Date().toISOString(),
}));

app.get('/ready', async (req, res) => {
  try {
    const mongoose     = require('mongoose');
    const { getRedis } = require('./config/redis');
    const redis        = getRedis();
    await redis.ping();
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ status: 'not_ready', reason: 'db_not_connected' });
    }
    res.json({ status: 'ready', db: 'connected', cache: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'not_ready', reason: err.message });
  }
});

app.get('/live', (req, res) =>
  res.json({ status: 'alive', pid: process.pid, uptime: Math.floor(process.uptime()) })
);

// ── Swagger docs ──────────────────────────────
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DOCS === 'true') {
  try {
    const { setupSwagger } = require('./docs/swagger');
    setupSwagger(app);
  } catch { /* swagger optional */ }
}

// ── API routes ────────────────────────────────
app.use('/api/v1', routes);
app.use('/api/proxy', proxyRouter);

// ── 404 ──────────────────────────────────────
app.all('/{*path}', (req, res, next) =>
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND'))
);

// ── Error handler ─────────────────────────────
app.use(errorHandler);

module.exports = app;




