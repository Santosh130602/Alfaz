'use strict';

const mongoSanitize = require('express-mongo-sanitize');
// const xssClean      = require('xss-clean');
const xssSanitize = require('xss-sanitize');

const hpp           = require('hpp');
const helmet        = require('helmet');
const rateLimit     = require('express-rate-limit');
const { AppError }  = require('../utils/appError');

const helmetConfig = helmet({
  contentSecurityPolicy: false, // handled by Nginx in production
  crossOriginEmbedderPolicy: false,
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : parseInt(process.env.RATE_LIMIT_MAX || '200'),
  message : { success: false, code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' },
  standardHeaders: true, legacyHeaders: false,
  skip: (req) => ['/health', '/ready', '/live'].includes(req.path),
});

const authLimiter = rateLimit({
  windowMs             : 15 * 60 * 1000,
  max                  : parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10'),
  message              : { success: false, code: 'AUTH_RATE_LIMITED', message: 'Too many auth attempts.' },
  skipSuccessfulRequests: true,
  standardHeaders: true, legacyHeaders: false,
});

const uploadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 50 });
const viewLimiter   = rateLimit({ windowMs: 60 * 1000, max: 120 });

const mongoSanitizer = mongoSanitize({ replaceWith: '_' });
// const xssCleaner     = xssClean();
const xssCleaner     = xssSanitize();
const hppProtect     = hpp({ whitelist: ['mood', 'tags', 'languages', 'type'] });

const SUSPICIOUS = [/(\.\.[/\\]){2,}/,/<script[\s>]/i,/javascript:/i,/\$where/i,/\$function/i];
function suspiciousRequestDetector(req, res, next) {
  const str = JSON.stringify({ body: req.body, query: req.query, params: req.params });
  for (const p of SUSPICIOUS) {
    if (p.test(str)) return next(new AppError('Request blocked', 400, 'REQUEST_BLOCKED'));
  }
  next();
}

module.exports = { helmetConfig, globalLimiter, authLimiter, uploadLimiter, viewLimiter, mongoSanitizer, xssCleaner, hppProtect, suspiciousRequestDetector };
