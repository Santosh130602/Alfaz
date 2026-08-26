'use strict';

// ─────────────────────────────────────────────
//  CUSTOM APP ERROR
// ─────────────────────────────────────────────

class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code       = code || `ERR_${statusCode}`;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─────────────────────────────────────────────
//  COMMON ERROR FACTORIES
// ─────────────────────────────────────────────

const Errors = {
  badRequest      : (msg = 'Bad request',          code) => new AppError(msg, 400, code),
  unauthorized    : (msg = 'Unauthorized',          code) => new AppError(msg, 401, code),
  forbidden       : (msg = 'Forbidden',             code) => new AppError(msg, 403, code),
  notFound        : (msg = 'Not found',             code) => new AppError(msg, 404, code),
  conflict        : (msg = 'Conflict',              code) => new AppError(msg, 409, code),
  tooMany         : (msg = 'Too many requests',     code) => new AppError(msg, 429, code),
  internal        : (msg = 'Internal server error', code) => new AppError(msg, 500, code),
};

// ─────────────────────────────────────────────
//  ASYNC WRAPPER — eliminates try/catch boilerplate
// ─────────────────────────────────────────────

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ─────────────────────────────────────────────
//  SUCCESS RESPONSE HELPER
// ─────────────────────────────────────────────

const sendSuccess = (res, data = {}, statusCode = 200, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

module.exports = { AppError, Errors, catchAsync, sendSuccess };
