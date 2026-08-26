'use strict';

const { verifyAccessToken } = require('../utils/jwt');
const { Errors, catchAsync } = require('../utils/appError');

// ─────────────────────────────────────────────
//  PROTECT — require valid access token
// ─────────────────────────────────────────────

exports.protect = catchAsync(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) throw Errors.unauthorized('Access token required', 'NO_TOKEN');

  const token   = auth.split(' ')[1];
  const decoded = await verifyAccessToken(token);

  req.user = decoded;   // { sub, username, role, jti, iat, exp }
  next();
});

// ─────────────────────────────────────────────
//  OPTIONAL AUTH — attach user if token present, don't fail if not
//  Used for public feed routes where auth enriches but isn't required
// ─────────────────────────────────────────────

exports.optionalAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const decoded = await verifyAccessToken(auth.split(' ')[1]);
      req.user = decoded;
    }
  } catch (_) { /* ignore — unauthenticated is fine */ }
  next();
};

// ─────────────────────────────────────────────
//  ROLE GUARD — restrict to specific roles
//  Usage: restrictTo('admin', 'superadmin')
// ─────────────────────────────────────────────

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!req.user) throw Errors.unauthorized('Authentication required', 'NO_AUTH');
  if (!roles.includes(req.user.role)) {
    throw Errors.forbidden(
      `Access denied. Required role: ${roles.join(' or ')}`,
      'INSUFFICIENT_ROLE'
    );
  }
  next();
};

// ─────────────────────────────────────────────
//  ACCOUNT STATUS CHECK — ensure account is active
//  Attach full user from DB (use sparingly — DB hit)
// ─────────────────────────────────────────────

exports.requireActiveAccount = catchAsync(async (req, res, next) => {
  const { User } = require('../models');
  const user = await User.findById(req.user.sub).select('accountStatus isDeleted');
  if (!user || user.isDeleted)           throw Errors.notFound('Account not found', 'USER_NOT_FOUND');
  if (user.accountStatus === 'banned')   throw Errors.forbidden('Account has been banned', 'ACCOUNT_BANNED');
  if (user.accountStatus === 'suspended') throw Errors.forbidden('Account is suspended', 'ACCOUNT_SUSPENDED');
  next();
});
