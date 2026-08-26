'use strict';

const { AppError } = require('../utils/appError');

let logger;
try { logger = require('../config/logger').logger; } catch { logger = console; }

function transform(err) {
  if (err.name === 'ValidationError') {
    return new AppError(Object.values(err.errors).map(e => e.message).join(', '), 400, 'VALIDATION_ERROR');
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return new AppError(`${field} already exists`, 409, 'DUPLICATE_KEY');
  }
  if (err.name === 'CastError')         return new AppError(`Invalid ${err.path}`, 400, 'INVALID_ID');
  if (err.name === 'JsonWebTokenError') return new AppError('Invalid token', 401, 'TOKEN_INVALID');
  if (err.name === 'TokenExpiredError') return new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  if (err.code === 'LIMIT_FILE_SIZE')   return new AppError('File too large', 413, 'FILE_TOO_LARGE');
  return err;
}

module.exports = (err, req, res, next) => {
  const error       = transform(err);
  error.statusCode  = error.statusCode || 500;
  error.code        = error.code || 'ERR_INTERNAL';

  const meta = { method: req.method, url: req.originalUrl, statusCode: error.statusCode, ip: req.ip, userId: req.user?.sub || null };
  if (error.statusCode >= 500) logger.error ? logger.error(error.message, { ...meta, stack: error.stack }) : console.error(error.message);
  else if (error.statusCode >= 400) logger.warn ? logger.warn(error.message, meta) : console.warn(error.message);

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false, code: error.code, message: error.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
    });
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({ success: false, code: 'ERR_INTERNAL', message: error.message, stack: error.stack });
  }
  return res.status(500).json({ success: false, code: 'ERR_INTERNAL', message: 'Something went wrong. Please try again.' });
};
