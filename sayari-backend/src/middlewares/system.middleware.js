'use strict';

const { AppConfig } = require('../models');
const { getCache, setCache } = require('../config/redis');
const { AppError } = require('../utils/appError');
const { logger }   = require('../config/logger');

const CONFIG_CACHE_TTL = 60; // 1 min

// ─────────────────────────────────────────────
//  CONFIG LOADER
//  Loads AppConfig from Redis cache → MongoDB
// ─────────────────────────────────────────────

async function getConfig(key) {
  const cacheKey = `appconfig:${key}`;
  const cached   = await getCache(cacheKey);
  if (cached !== null) return cached;

  const doc = await AppConfig.findOne({ key }).lean();
  const val  = doc ? doc.value : null;
  await setCache(cacheKey, val, CONFIG_CACHE_TTL);
  return val;
}

// ─────────────────────────────────────────────
//  1. MAINTENANCE MODE MIDDLEWARE
//  Reads maintenance_mode from AppConfig
//  Returns 503 if enabled (except for health + admin)
// ─────────────────────────────────────────────

async function maintenanceMode(req, res, next) {
  // Never block health checks or admin routes
  const bypass = ['/health', '/ready', '/live'];
  if (bypass.includes(req.path)) return next();
  if (req.path.startsWith('/api/v1/admin')) return next();

  try {
    const isEnabled = await getConfig('maintenance_mode');
    if (isEnabled === true) {
      return res.status(503).json({
        success: false,
        code   : 'MAINTENANCE_MODE',
        message: 'Platform is under maintenance. Please try again later.',
        retryAfter: 300,
      });
    }
    next();
  } catch (err) {
    // If AppConfig is unreachable, don't block the platform
    logger.warn('[Middleware] Could not check maintenance_mode:', { error: err.message });
    next();
  }
}

// ─────────────────────────────────────────────
//  2. APP VERSION GATE MIDDLEWARE
//  Reads min_app_version from AppConfig
//  If force_update_enabled = true AND client version < min,
//  returns 426 Upgrade Required
// ─────────────────────────────────────────────

function semverLt(a, b) {
  // Returns true if version a < version b
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) < (pb[i] || 0)) return true;
    if ((pa[i] || 0) > (pb[i] || 0)) return false;
  }
  return false;
}

async function appVersionGate(req, res, next) {
  // Only check mobile clients (they send X-App-Version header)
  const clientVersion = req.headers['x-app-version'];
  const platform      = req.headers['x-app-platform']; // ios | android

  if (!clientVersion || !platform) return next();

  // Skip health checks and auth
  if (req.path.startsWith('/health') || req.path === '/api/v1/auth/refresh') return next();

  try {
    const [forceEnabled, minIos, minAndroid] = await Promise.all([
      getConfig('force_update_enabled'),
      getConfig('min_app_version_ios'),
      getConfig('min_app_version_android'),
    ]);

    if (!forceEnabled) return next();

    const minVersion = platform === 'ios' ? minIos : minAndroid;
    if (!minVersion) return next();

    if (semverLt(clientVersion, minVersion)) {
      return res.status(426).json({
        success       : false,
        code          : 'UPDATE_REQUIRED',
        message       : 'Please update the Sayari app to continue.',
        currentVersion: clientVersion,
        minVersion,
        platform,
      });
    }

    next();
  } catch (err) {
    logger.warn('[Middleware] Version gate error:', { error: err.message });
    next();
  }
}

// ─────────────────────────────────────────────
//  3. REGISTRATION GATE MIDDLEWARE
//  Blocks new account creation if registration_open = false
// ─────────────────────────────────────────────

async function registrationGate(req, res, next) {
  try {
    const isOpen = await getConfig('registration_open');
    if (isOpen === false) {
      return res.status(403).json({
        success: false,
        code   : 'REGISTRATION_CLOSED',
        message: 'New registrations are temporarily closed. Please try again later.',
      });
    }
    next();
  } catch (err) {
    next(); // fail open
  }
}

// ─────────────────────────────────────────────
//  4. PUBLIC CONFIG ENDPOINT HANDLER
//  Returns all isPublic: true AppConfig entries to frontend
// ─────────────────────────────────────────────

async function getPublicConfig(req, res) {
  const cacheKey = 'appconfig:public:all';
  const cached   = await getCache(cacheKey);
  if (cached) return res.json({ success: true, data: { config: cached } });

  const configs = await AppConfig.find({ isPublic: true }).select('key value valueType').lean();
  const map = configs.reduce((a, c) => { a[c.key] = c.value; return a; }, {});

  await setCache(cacheKey, map, CONFIG_CACHE_TTL);
  res.json({ success: true, data: { config: map } });
}

module.exports = { maintenanceMode, appVersionGate, registrationGate, getPublicConfig, getConfig };
