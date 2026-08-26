'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const { User, Channel, Session } = require('../../../models');
const { generateTokenPair, verifyRefreshToken, revokeAccessToken, expiryToSeconds, REFRESH_EXP } = require('../../../utils/jwt');
const { sendWhatsAppOtp, verifyWhatsAppOtp } = require('../../../utils/otp');
const { setCache, getCache, delCache } = require('../../../config/redis');
const { AppError, Errors } = require('../../../utils/appError');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
const googleClient  = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─────────────────────────────────────────────
//  INTERNAL HELPERS
// ─────────────────────────────────────────────

/**
 * Create a channel for a newly registered user (1:1 relationship)
 */
async function _createDefaultChannel(user) {
  const channel = await Channel.create({
    owner      : user._id,
    handle     : user.username,
    name       : user.displayName,
    tagline    : '',
    isPublic   : true,
    isActive   : true,
  });
  user.channel = channel._id;
  user.role    = 'creator';
  await user.save({ validateBeforeSave: false });
  return channel;
}

/**
 * Create session document + return token pair
 */
async function _createSession(user, deviceInfo = {}, ip = null) {
  const session = await Session.create({
    user      : user._id,
    refreshToken: 'placeholder', // updated below
    deviceInfo: {
      platform  : deviceInfo.platform   || 'unknown',
      deviceName: deviceInfo.deviceName || null,
      userAgent : deviceInfo.userAgent  || null,
      ip,
    },
    lastUsedAt: new Date(),
    expiresAt : new Date(Date.now() + expiryToSeconds(REFRESH_EXP) * 1000),
  });

  const tokens = generateTokenPair(user, session._id);

  // Hash refresh token before storing
  const rtHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
  session.refreshToken = rtHash;
  await session.save();

  // Cache active session in Redis
  await setCache(`session:${session._id}`, { userId: user._id.toString(), role: user.role }, expiryToSeconds(REFRESH_EXP));

  return { tokens, session };
}

// ─────────────────────────────────────────────
//  1. EMAIL + PASSWORD REGISTER
// ─────────────────────────────────────────────

async function registerWithEmail(data, ip) {
  const { email, password, username, displayName, language = 'hi' } = data;

  // Check duplicates
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    if (existing.email === email)     throw Errors.conflict('Email already registered', 'EMAIL_EXISTS');
    if (existing.username === username) throw Errors.conflict('Username already taken', 'USERNAME_EXISTS');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({
    email, username, displayName, language,
    passwordHash,
    authProvider  : 'local',
    emailVerified : false,
    accountStatus : 'active',
  });

  // Create channel
  await _createDefaultChannel(user);

  const { tokens, session } = await _createSession(user, {}, ip);

  return {
    user    : user.toPublicJSON(),
    channel : user.channel,
    tokens,
    sessionId: session._id,
  };
}

// ─────────────────────────────────────────────
//  2. EMAIL + PASSWORD LOGIN
// ─────────────────────────────────────────────

async function loginWithEmail(data, ip) {
  const { email, password, deviceInfo } = data;

  const user = await User.findOne({ email, isDeleted: false }).select('+passwordHash');
  if (!user || !user.passwordHash) throw Errors.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  if (user.accountStatus === 'banned')     throw Errors.forbidden('Account has been banned', 'ACCOUNT_BANNED');
  if (user.accountStatus === 'suspended')  throw Errors.forbidden('Account is suspended', 'ACCOUNT_SUSPENDED');

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw Errors.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');

  // Update last login
  user.lastLoginAt = new Date();
  user.lastLoginIp = ip;
  await user.save({ validateBeforeSave: false });

  const { tokens, session } = await _createSession(user, deviceInfo || {}, ip);

  return {
    user     : user.toPublicJSON(),
    tokens,
    sessionId: session._id,
  };
}

// ─────────────────────────────────────────────
//  3. WHATSAPP OTP — SEND
// ─────────────────────────────────────────────

async function sendOtp(phone, purpose, ip) {
  // For login: ensure user exists
  if (purpose === 'login') {
    const user = await User.findOne({ 'whatsapp.number': phone, isDeleted: false });
    if (!user) throw Errors.notFound('No account found with this WhatsApp number', 'WA_USER_NOT_FOUND');
    if (user.accountStatus === 'banned') throw Errors.forbidden('Account has been banned', 'ACCOUNT_BANNED');
  }

  return sendWhatsAppOtp(phone, purpose, ip);
}

// ─────────────────────────────────────────────
//  4. WHATSAPP OTP — VERIFY (pre-signup/login)
// ─────────────────────────────────────────────

async function verifyOtp(phone, otp, purpose) {
  await verifyWhatsAppOtp(phone, otp, purpose);

  // Issue a short-lived "OTP verified" session token stored in Redis
  // This proves phone ownership before account creation completes
  const otpSessionToken = crypto.randomBytes(32).toString('hex');
  await setCache(`otp_verified:${phone}:${purpose}`, { phone, purpose, verified: true }, 15 * 60); // 15 min

  if (purpose === 'login') {
    const user = await User.findOne({ 'whatsapp.number': phone, isDeleted: false });
    if (!user) throw Errors.notFound('User not found', 'WA_USER_NOT_FOUND');

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const { tokens, session } = await _createSession(user, {});
    return { verified: true, action: 'logged_in', user: user.toPublicJSON(), tokens, sessionId: session._id };
  }

  return { verified: true, action: 'proceed_signup', otpSessionToken, phone };
}

// ─────────────────────────────────────────────
//  5. WHATSAPP SIGNUP — complete after OTP verify
// ─────────────────────────────────────────────

async function completeWhatsappSignup(data, ip) {
  const { phone, username, displayName, language = 'hi' } = data;

  // Confirm OTP was verified
  const session = await getCache(`otp_verified:${phone}:signup`);
  if (!session?.verified) throw Errors.unauthorized('Phone verification required', 'WA_NOT_VERIFIED');

  // Check duplicates
  const existing = await User.findOne({ $or: [{ 'whatsapp.number': phone }, { username }] });
  if (existing) {
    if (existing.whatsapp?.number === phone) throw Errors.conflict('WhatsApp number already registered', 'WA_EXISTS');
    if (existing.username === username)       throw Errors.conflict('Username already taken', 'USERNAME_EXISTS');
  }

  const user = await User.create({
    username,
    displayName,
    language,
    whatsapp      : { number: phone, isVerified: true },
    authProvider  : 'local',
    accountStatus : 'active',
  });

  await _createDefaultChannel(user);
  await delCache(`otp_verified:${phone}:signup`);

  const { tokens, session: dbSession } = await _createSession(user, {}, ip);
  return { user: user.toPublicJSON(), tokens, sessionId: dbSession._id };
}

// ─────────────────────────────────────────────
//  6. GOOGLE OAUTH
// ─────────────────────────────────────────────

async function loginWithGoogle(idToken, deviceInfo, ip) {
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch {
    throw Errors.unauthorized('Invalid Google token', 'GOOGLE_TOKEN_INVALID');
  }

  const payload = ticket.getPayload();
  const { sub: oauthId, email, name, picture } = payload;

  // Find or create user
  let user = await User.findOne({ $or: [{ oauthId }, { email }], isDeleted: false });
  let isNew = false;

  if (!user) {
    // New user via Google
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '').substring(0, 25);
    let username = baseUsername;
    let counter  = 1;
    while (await User.exists({ username })) {
      username = `${baseUsername}${counter++}`;
    }

    user = await User.create({
      username,
      displayName  : name,
      email,
      emailVerified: true,
      oauthId,
      authProvider : 'google',
      avatar       : { url: picture, thumbnail: picture },
      accountStatus: 'active',
    });
    await _createDefaultChannel(user);
    isNew = true;
  } else {
    // Existing — update OAuth fields if needed
    if (!user.oauthId) { user.oauthId = oauthId; user.authProvider = 'google'; }
    if (!user.emailVerified) { user.emailVerified = true; }
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    await user.save({ validateBeforeSave: false });

    if (user.accountStatus === 'banned')    throw Errors.forbidden('Account has been banned', 'ACCOUNT_BANNED');
    if (user.accountStatus === 'suspended') throw Errors.forbidden('Account is suspended', 'ACCOUNT_SUSPENDED');
  }

  const { tokens, session } = await _createSession(user, deviceInfo || {}, ip);
  return { user: user.toPublicJSON(), tokens, sessionId: session._id, isNew };
}

// ─────────────────────────────────────────────
//  7. APPLE OAUTH
// ─────────────────────────────────────────────

async function loginWithApple(identityToken, appleUser, deviceInfo, ip) {
  let decoded;
  try {
    // Apple public keys — verify signature (simplified; use apple-signin-auth package in production)
    decoded = jwt.decode(identityToken);
    if (!decoded?.sub) throw new Error('No sub in token');
  } catch {
    throw Errors.unauthorized('Invalid Apple identity token', 'APPLE_TOKEN_INVALID');
  }

  const oauthId = decoded.sub;
  const email   = decoded.email || appleUser?.email || null;

  let user = await User.findOne({ $or: [{ oauthId }, ...(email ? [{ email }] : [])], isDeleted: false });
  let isNew = false;

  if (!user) {
    const fullName = appleUser?.name ? `${appleUser.name.firstName || ''} ${appleUser.name.lastName || ''}`.trim() : 'Sayari User';
    const baseUsername = (email ? email.split('@')[0] : oauthId.substring(0, 15)).toLowerCase().replace(/[^a-z0-9_.]/g, '');
    let username = baseUsername || 'user';
    let counter  = 1;
    while (await User.exists({ username })) username = `${baseUsername}${counter++}`;

    user = await User.create({
      username,
      displayName  : fullName,
      email        : email || null,
      emailVerified: !!email,
      oauthId,
      authProvider : 'apple',
      accountStatus: 'active',
    });
    await _createDefaultChannel(user);
    isNew = true;
  } else {
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });
    if (user.accountStatus === 'banned') throw Errors.forbidden('Account has been banned', 'ACCOUNT_BANNED');
  }

  const { tokens, session } = await _createSession(user, deviceInfo || {}, ip);
  return { user: user.toPublicJSON(), tokens, sessionId: session._id, isNew };
}

// ─────────────────────────────────────────────
//  8. REFRESH ACCESS TOKEN
// ─────────────────────────────────────────────

// async function refreshTokens(refreshToken, ip) {
//   const decoded = verifyRefreshToken(refreshToken);

//   // Look up session by ID
//   const session = await Session.findById(decoded.sid);
//   if (!session || session.isRevoked) throw Errors.unauthorized('Session expired or revoked', 'SESSION_INVALID');

//   // Verify stored hash matches
//   const rtHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
//   if (rtHash !== session.refreshToken) throw Errors.unauthorized('Token mismatch', 'TOKEN_MISMATCH');

//   // Get user
//   const user = await User.findById(decoded.sub);
//   if (!user || user.isDeleted)           throw Errors.unauthorized('User not found', 'USER_NOT_FOUND');
//   if (user.accountStatus === 'banned')   throw Errors.forbidden('Account banned', 'ACCOUNT_BANNED');

//   // Rotate tokens (refresh token rotation for security)
//   const tokens = generateTokenPair(user, session._id);
//   const newRtHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
//   session.refreshToken = newRtHash;
//   session.lastUsedAt   = new Date();
//   await session.save();


//   return { tokens, user: user.toPublicJSON() };
// }


async function refreshTokens(refreshToken, ip) {
  const decoded = verifyRefreshToken(refreshToken);

  // 🔍 TEMP DEBUG
  // console.log('=== REFRESH DEBUG START ===');
  // console.log('Incoming token (first 40 chars):', refreshToken.substring(0, 40));
  // console.log('Decoded sid:', decoded.sid);
  // console.log('Decoded sub:', decoded.sub);
  // console.log('Decoded jti:', decoded.jti);

  // Look up session by ID
  const session = await Session.findById(decoded.sid).select('+refreshToken');

  if (!session) {
    // console.log('❌ Session NOT FOUND for sid:', decoded.sid);
    // console.log('=== REFRESH DEBUG END ===');
    throw Errors.unauthorized('Session expired or revoked', 'SESSION_INVALID');
  }

  // console.log('Session found. isRevoked:', session.isRevoked);
  // console.log('Session lastUsedAt:', session.lastUsedAt);

  if (session.isRevoked) {
    console.log('❌ Session IS REVOKED');
    console.log('=== REFRESH DEBUG END ===');
    throw Errors.unauthorized('Session expired or revoked', 'SESSION_INVALID');
  }

  // Verify stored hash matches
  const rtHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  // console.log('Computed hash (incoming) :', rtHash);
  // console.log('Stored hash (in session) :', session.refreshToken);
  // console.log('Hashes match?', rtHash === session.refreshToken);
  // console.log('=== REFRESH DEBUG END ===');

  if (rtHash !== session.refreshToken) throw Errors.unauthorized('Token mismatch', 'TOKEN_MISMATCH');

  // Get user
  const user = await User.findById(decoded.sub);
  if (!user || user.isDeleted)           throw Errors.unauthorized('User not found', 'USER_NOT_FOUND');
  if (user.accountStatus === 'banned')   throw Errors.forbidden('Account banned', 'ACCOUNT_BANNED');

  // Rotate tokens (refresh token rotation for security)
  const tokens = generateTokenPair(user, session._id);
  const newRtHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
  session.refreshToken = newRtHash;
  session.lastUsedAt   = new Date();
  await session.save();

  return { tokens, user: user.toPublicJSON() };
}

// ─────────────────────────────────────────────
//  9. LOGOUT
// ─────────────────────────────────────────────

async function logout(userId, accessToken, refreshToken, allDevices = false) {
  // Blacklist current access token
  if (accessToken) await revokeAccessToken(accessToken);

  if (allDevices) {
    // Revoke all sessions for this user
    await Session.updateMany({ user: userId, isRevoked: false }, { isRevoked: true, revokedAt: new Date() });
  } else if (refreshToken) {
    // Revoke only the current session
    const rtHash  = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await Session.findOne({ user: userId, refreshToken: rtHash });
    if (session) {
      session.isRevoked = true;
      session.revokedAt = new Date();
      await session.save();
      await delCache(`session:${session._id}`);
    }
  }

  return { loggedOut: true };
}

// ─────────────────────────────────────────────
//  10. FORGOT PASSWORD (email)
// ─────────────────────────────────────────────

async function forgotPassword(email) {
  const user = await User.findOne({ email, authProvider: 'local', isDeleted: false });
  // Always return same response to prevent user enumeration
  if (!user) return { sent: true };

  const token  = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  user.passwordResetToken  = hashed;
  user.passwordResetExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save({ validateBeforeSave: false });

  // TODO: send email with reset link
  // await EmailService.sendPasswordReset(user.email, token);

  console.log(`[DEV] Password reset token for ${email}: ${token}`);
  return { sent: true };
}

// ─────────────────────────────────────────────
//  11. RESET PASSWORD
// ─────────────────────────────────────────────

async function resetPassword(token, newPassword) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user   = await User.findOne({
    passwordResetToken : hashed,
    passwordResetExpiry: { $gt: Date.now() },
    isDeleted          : false,
  });

  if (!user) throw Errors.badRequest('Reset token is invalid or expired', 'RESET_TOKEN_INVALID');

  user.passwordHash        = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  user.passwordResetToken  = undefined;
  user.passwordResetExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  // Invalidate all active sessions
  await Session.updateMany({ user: user._id, isRevoked: false }, { isRevoked: true, revokedAt: new Date() });

  return { reset: true };
}

// ─────────────────────────────────────────────
//  12. CHANGE PASSWORD (authenticated)
// ─────────────────────────────────────────────

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !user.passwordHash) throw Errors.badRequest('Password change not available for OAuth accounts', 'NO_PASSWORD');

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) throw Errors.unauthorized('Current password is incorrect', 'WRONG_PASSWORD');

  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await user.save({ validateBeforeSave: false });

  return { changed: true };
}

module.exports = {
  registerWithEmail,
  loginWithEmail,
  sendOtp,
  verifyOtp,
  completeWhatsappSignup,
  loginWithGoogle,
  loginWithApple,
  refreshTokens,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};
