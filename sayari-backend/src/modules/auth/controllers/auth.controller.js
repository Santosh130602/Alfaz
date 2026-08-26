// 'use strict';

// const { validationResult } = require('express-validator');
// const authService = require('../services/auth.service');
// const { catchAsync, sendSuccess, Errors } = require('../../../utils/appError');

// // ─── Validation error handler ─────────────────
// const validate = (req) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const messages = errors.array().map(e => e.msg).join(', ');
//     throw Errors.badRequest(messages, 'VALIDATION_ERROR');
//   }
// };

// // ─── Extract client IP ────────────────────────
// const getIp = (req) => req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || null;

// // ─────────────────────────────────────────────
// //  CONTROLLERS
// // ─────────────────────────────────────────────

// exports.registerEmail = catchAsync(async (req, res) => {
//   validate(req);
//   const result = await authService.registerWithEmail(req.body, getIp(req));
//   sendSuccess(res, result, 201, 'Account created successfully');
// });

// exports.loginEmail = catchAsync(async (req, res) => {
//   validate(req);
//   const result = await authService.loginWithEmail(req.body, getIp(req));
//   sendSuccess(res, result, 200, 'Login successful');
// });

// exports.sendOtp = catchAsync(async (req, res) => {
//   validate(req);
//   const { phone, purpose } = req.body;
//   const result = await authService.sendOtp(phone, purpose, getIp(req));
//   sendSuccess(res, result, 200, 'OTP sent via WhatsApp');
// });

// exports.verifyOtp = catchAsync(async (req, res) => {
//   validate(req);
//   const { phone, otp, purpose } = req.body;
//   const result = await authService.verifyOtp(phone, otp, purpose);
//   sendSuccess(res, result, 200, result.action === 'logged_in' ? 'Login successful' : 'OTP verified');
// });

// exports.completeWhatsappSignup = catchAsync(async (req, res) => {
//   validate(req);
//   const result = await authService.completeWhatsappSignup(req.body, getIp(req));
//   sendSuccess(res, result, 201, 'Account created successfully');
// });

// exports.googleAuth = catchAsync(async (req, res) => {
//   validate(req);
//   const { idToken, deviceInfo } = req.body;
//   const result = await authService.loginWithGoogle(idToken, deviceInfo, getIp(req));
//   sendSuccess(res, result, result.isNew ? 201 : 200, result.isNew ? 'Account created' : 'Login successful');
// });

// exports.appleAuth = catchAsync(async (req, res) => {
//   validate(req);
//   const { identityToken, user: appleUser, deviceInfo } = req.body;
//   const result = await authService.loginWithApple(identityToken, appleUser, deviceInfo, getIp(req));
//   sendSuccess(res, result, result.isNew ? 201 : 200, result.isNew ? 'Account created' : 'Login successful');
// });

// exports.refreshToken = catchAsync(async (req, res) => {
//   validate(req);
//   const result = await authService.refreshTokens(req.body.refreshToken, getIp(req));
//   sendSuccess(res, result, 200, 'Token refreshed');
// });

// exports.logout = catchAsync(async (req, res) => {
//   const accessToken  = req.headers.authorization?.split(' ')[1];
//   const { refreshToken, allDevices } = req.body;
//   await authService.logout(req.user?.sub, accessToken, refreshToken, allDevices);
//   sendSuccess(res, {}, 200, 'Logged out successfully');
// });

// exports.forgotPassword = catchAsync(async (req, res) => {
//   validate(req);
//   const result = await authService.forgotPassword(req.body.email);
//   sendSuccess(res, result, 200, 'If that email is registered, a reset link has been sent');
// });

// exports.resetPassword = catchAsync(async (req, res) => {
//   validate(req);
//   const { token, newPassword } = req.body;
//   await authService.resetPassword(token, newPassword);
//   sendSuccess(res, {}, 200, 'Password reset successful');
// });

// exports.changePassword = catchAsync(async (req, res) => {
//   validate(req);
//   const { currentPassword, newPassword } = req.body;
//   await authService.changePassword(req.user.sub, currentPassword, newPassword);
//   sendSuccess(res, {}, 200, 'Password changed successfully');
// });

// exports.me = catchAsync(async (req, res) => {
//   const { User } = require('../../../models');
//   const user = await User.findById(req.user.sub).populate('channel', 'handle name logo stats');
//   if (!user) throw Errors.notFound('User not found', 'USER_NOT_FOUND');
//   sendSuccess(res, { user: user.toPublicJSON() }, 200);
// });





'use strict';

const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const { catchAsync, sendSuccess, Errors } = require('../../../utils/appError');
const { expiryToSeconds, REFRESH_EXP } = require('../../../utils/jwt');

// ─── Validation error handler ─────────────────
const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg).join(', ');
    throw Errors.badRequest(messages, 'VALIDATION_ERROR');
  }
};

// ─── Extract client IP ────────────────────────
const getIp = (req) => req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || null;

// ─── Cookie helpers ────────────────────────────
const REFRESH_COOKIE_NAME = 'sayari_refresh_token';

const cookieOptions = () => ({
  httpOnly: true,
  secure  : process.env.COOKIE_SECURE === 'true',
  sameSite: process.env.COOKIE_SAMESITE || 'lax',
  maxAge  : expiryToSeconds(REFRESH_EXP) * 1000,   // ms में चाहिए
  path    : '/api/v1/auth',   // सिर्फ auth routes को cookie भेजी जाए, हर request में नहीं
});

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
}

// यह response में जाने वाले tokens object से refreshToken हटाकर
// सिर्फ accessToken रखता है — refreshToken अलग से cookie में जाएगा
function stripRefreshToken(result) {
  if (!result?.tokens) return result;
  const { refreshToken, ...accessOnly } = result.tokens;
  return { ...result, tokens: accessOnly };
}

// ─────────────────────────────────────────────
//  CONTROLLERS
// ─────────────────────────────────────────────

exports.registerEmail = catchAsync(async (req, res) => {
  validate(req);
  const result = await authService.registerWithEmail(req.body, getIp(req));
  setRefreshCookie(res, result.tokens.refreshToken);
  sendSuccess(res, stripRefreshToken(result), 201, 'Account created successfully');
});

exports.loginEmail = catchAsync(async (req, res) => {
  validate(req);
  const result = await authService.loginWithEmail(req.body, getIp(req));
  setRefreshCookie(res, result.tokens.refreshToken);
  sendSuccess(res, stripRefreshToken(result), 200, 'Login successful');
});

exports.sendOtp = catchAsync(async (req, res) => {
  validate(req);
  const { phone, purpose } = req.body;
  const result = await authService.sendOtp(phone, purpose, getIp(req));
  sendSuccess(res, result, 200, 'OTP sent via WhatsApp');
});

exports.verifyOtp = catchAsync(async (req, res) => {
  validate(req);
  const { phone, otp, purpose } = req.body;
  const result = await authService.verifyOtp(phone, otp, purpose);

  // सिर्फ login वाले case में tokens बनते हैं
  if (result.action === 'logged_in' && result.tokens) {
    setRefreshCookie(res, result.tokens.refreshToken);
  }

  sendSuccess(res, stripRefreshToken(result), 200, result.action === 'logged_in' ? 'Login successful' : 'OTP verified');
});

exports.completeWhatsappSignup = catchAsync(async (req, res) => {
  validate(req);
  const result = await authService.completeWhatsappSignup(req.body, getIp(req));
  setRefreshCookie(res, result.tokens.refreshToken);
  sendSuccess(res, stripRefreshToken(result), 201, 'Account created successfully');
});

exports.googleAuth = catchAsync(async (req, res) => {
  validate(req);
  const { idToken, deviceInfo } = req.body;
  const result = await authService.loginWithGoogle(idToken, deviceInfo, getIp(req));
  setRefreshCookie(res, result.tokens.refreshToken);
  sendSuccess(res, stripRefreshToken(result), result.isNew ? 201 : 200, result.isNew ? 'Account created' : 'Login successful');
});

exports.appleAuth = catchAsync(async (req, res) => {
  validate(req);
  const { identityToken, user: appleUser, deviceInfo } = req.body;
  const result = await authService.loginWithApple(identityToken, appleUser, deviceInfo, getIp(req));
  setRefreshCookie(res, result.tokens.refreshToken);
  sendSuccess(res, stripRefreshToken(result), result.isNew ? 201 : 200, result.isNew ? 'Account created' : 'Login successful');
});

exports.refreshToken = catchAsync(async (req, res) => {
  // अब body से नहीं, cookie से पढ़ो
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!refreshToken) throw Errors.unauthorized('Refresh token required', 'REFRESH_REQUIRED');

  const result = await authService.refreshTokens(refreshToken, getIp(req));

  // नया refresh token फिर से cookie में सेट करो (rotation)
  setRefreshCookie(res, result.tokens.refreshToken);

  sendSuccess(res, stripRefreshToken(result), 200, 'Token refreshed');
});

exports.logout = catchAsync(async (req, res) => {
  const accessToken  = req.headers.authorization?.split(' ')[1];
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const { allDevices } = req.body;

  await authService.logout(req.user?.sub, accessToken, refreshToken, allDevices);

  clearRefreshCookie(res);
  sendSuccess(res, {}, 200, 'Logged out successfully');
});

exports.forgotPassword = catchAsync(async (req, res) => {
  validate(req);
  const result = await authService.forgotPassword(req.body.email);
  sendSuccess(res, result, 200, 'If that email is registered, a reset link has been sent');
});

exports.resetPassword = catchAsync(async (req, res) => {
  validate(req);
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  sendSuccess(res, {}, 200, 'Password reset successful');
});

exports.changePassword = catchAsync(async (req, res) => {
  validate(req);
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.sub, currentPassword, newPassword);
  sendSuccess(res, {}, 200, 'Password changed successfully');
});

exports.me = catchAsync(async (req, res) => {
  const { User } = require('../../../models');
  const user = await User.findById(req.user.sub).populate('channel', 'handle name logo stats');
  if (!user) throw Errors.notFound('User not found', 'USER_NOT_FOUND');
  sendSuccess(res, { user: user.toPublicJSON() }, 200);
});