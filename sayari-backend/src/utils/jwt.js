'use strict';

const jwt  = require('jsonwebtoken');
const { randomUUID: uuidv4 } = require('crypto');
const { blacklistToken, isBlacklisted } = require('../config/redis');
const { AppError } = require('./appError');

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXP     = process.env.JWT_ACCESS_EXPIRES  || '15m';
const REFRESH_EXP    = process.env.JWT_REFRESH_EXPIRES || '30d';

// ─────────────────────────────────────────────
//  SIGN TOKENS
// ─────────────────────────────────────────────

/**
 * Generate access token (short-lived, stateless)
 * Payload carries user identity + role for middleware
 */
function signAccessToken(user) {
  const payload = {
    sub     : user._id.toString(),
    username: user.username,
    role    : user.role,
    jti     : uuidv4(),           // unique token ID for blacklisting
  };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXP, algorithm: 'HS256' });
}

/**
 * Generate refresh token (long-lived, stored in DB + Redis)
 */
function signRefreshToken(userId, sessionId) {
  const payload = {
    sub : userId.toString(),
    sid : sessionId.toString(),    // links to Session document
    jti : uuidv4(),
    type: 'refresh',
  };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXP, algorithm: 'HS256' });
}

// ─────────────────────────────────────────────
//  VERIFY TOKENS
// ─────────────────────────────────────────────

/**
 * Verify access token — throws AppError on failure
 */
async function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] });

    // Check blacklist (for logged-out tokens)
    if (await isBlacklisted(decoded.jti)) {
      throw new AppError('Token has been revoked', 401, 'TOKEN_REVOKED');
    }

    return decoded;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err.name === 'TokenExpiredError') throw new AppError('Access token expired', 401, 'TOKEN_EXPIRED');
    if (err.name === 'JsonWebTokenError')  throw new AppError('Invalid token', 401, 'TOKEN_INVALID');
    throw new AppError('Token verification failed', 401, 'TOKEN_FAILED');
  }
}

/**
 * Verify refresh token — throws AppError on failure
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new AppError('Refresh token expired, please login again', 401, 'REFRESH_EXPIRED');
    throw new AppError('Invalid refresh token', 401, 'REFRESH_INVALID');
  }
}

// ─────────────────────────────────────────────
//  REVOKE ACCESS TOKEN (logout)
//  We blacklist the JTI so it can't be reused
//  within its remaining lifetime
// ─────────────────────────────────────────────

async function revokeAccessToken(token) {
  try {
    const decoded  = jwt.decode(token);
    if (!decoded?.jti || !decoded?.exp) return;
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) await blacklistToken(decoded.jti, ttl);
  } catch (_) { /* ignore decode errors on logout */ }
}

// ─────────────────────────────────────────────
//  TOKEN PAIR HELPER
// ─────────────────────────────────────────────

function generateTokenPair(user, sessionId) {
  return {
    accessToken : signAccessToken(user),
    refreshToken: signRefreshToken(user._id, sessionId),
  };
}

// Parse expiry string like '30d' into seconds
function expiryToSeconds(exp) {
  const units = { s: 1, m: 60, h: 3600, d: 86400 };
  const match = String(exp).match(/^(\d+)([smhd])$/);
  if (!match) return 86400;
  return parseInt(match[1]) * (units[match[2]] || 86400);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeAccessToken,
  generateTokenPair,
  expiryToSeconds,
  REFRESH_EXP,
};
