'use strict';

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path    = require('path');

const isProd = process.env.NODE_ENV === 'production';
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

// ─────────────────────────────────────────────
//  CUSTOM FORMAT
// ─────────────────────────────────────────────

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let out = `${timestamp} ${level}: ${message}`;
    if (stack) out += `\n${stack}`;
    const extra = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    if (extra) out += `\n${extra}`;
    return out;
  })
);

// ─────────────────────────────────────────────
//  TRANSPORTS
// ─────────────────────────────────────────────

const transports = [];

// Console — always
transports.push(new winston.transports.Console({
  format: isProd ? jsonFormat : devFormat,
  silent: process.env.NODE_ENV === 'test',
}));

// File rotation — production only
if (isProd) {
  // Combined log (all levels)
  transports.push(new DailyRotateFile({
    filename     : path.join(LOG_DIR, 'app-%DATE%.log'),
    datePattern  : 'YYYY-MM-DD',
    maxSize      : '20m',
    maxFiles     : '14d',
    format       : jsonFormat,
    zippedArchive: true,
  }));

  // Error log (error level only)
  transports.push(new DailyRotateFile({
    filename     : path.join(LOG_DIR, 'error-%DATE%.log'),
    datePattern  : 'YYYY-MM-DD',
    level        : 'error',
    maxSize      : '20m',
    maxFiles     : '30d',
    format       : jsonFormat,
    zippedArchive: true,
  }));
}

// ─────────────────────────────────────────────
//  LOGGER INSTANCE
// ─────────────────────────────────────────────

const logger = winston.createLogger({
  level      : process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  transports,
  exitOnError: false,
});

// ─────────────────────────────────────────────
//  MORGAN STREAM (pipe HTTP logs → Winston)
// ─────────────────────────────────────────────

logger.stream = {
  write: (message) => logger.http(message.trim()),
};

// ─────────────────────────────────────────────
//  REQUEST LOGGER MIDDLEWARE
//  Attaches a correlation ID to every request
//  so logs from the same request can be grouped
// ─────────────────────────────────────────────

const { v4: uuidv4 } = require('uuid');

function requestLogger(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId   = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  const start = Date.now();

  res.on('finish', () => {
    const ms      = Date.now() - start;
    const level   = res.statusCode >= 500 ? 'error'
                  : res.statusCode >= 400 ? 'warn'
                  : 'http';

    logger[level]({
      correlationId,
      method : req.method,
      url    : req.originalUrl,
      status : res.statusCode,
      ms,
      ip     : req.ip,
      ua     : req.headers['user-agent']?.substring(0, 100),
      userId : req.user?.sub || null,
    });
  });

  next();
}

module.exports = { logger, requestLogger };
