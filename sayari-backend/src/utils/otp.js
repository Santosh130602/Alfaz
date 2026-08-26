'use strict';

const crypto = require('crypto');
const axios  = require('axios');
const { setCache, getCache, delCache, incr } = require('../config/redis');
const { WhatsAppOtp } = require('../models');
const { AppError } = require('./appError');

const OTP_LENGTH    = parseInt(process.env.OTP_LENGTH   || '6');
const OTP_EXPIRY    = parseInt(process.env.OTP_EXPIRY_MINS || '10') * 60; // seconds
const MAX_ATTEMPTS  = parseInt(process.env.OTP_MAX_ATTEMPTS || '3');
const RESEND_COOLDOWN = parseInt(process.env.OTP_RESEND_COOLDOWN_SECS || '60');

// ─────────────────────────────────────────────
//  GENERATE SECURE OTP
// ─────────────────────────────────────────────

function generateOtp() {
  // Cryptographically secure random OTP
  const max = Math.pow(10, OTP_LENGTH);
  const otp = (crypto.randomInt(0, max)).toString().padStart(OTP_LENGTH, '0');
  return otp;
}

// ─────────────────────────────────────────────
//  REDIS KEYS
// ─────────────────────────────────────────────

const keys = {
  otp      : (phone, purpose) => `otp:${purpose}:${phone}`,
  attempts : (phone, purpose) => `otp_attempts:${purpose}:${phone}`,
  cooldown : (phone, purpose) => `otp_cooldown:${purpose}:${phone}`,
};

// ─────────────────────────────────────────────
//  CREATE & SEND OTP
// ─────────────────────────────────────────────

async function sendWhatsAppOtp(phone, purpose, ip = null) {
  // Check resend cooldown
  const cooldownKey = keys.cooldown(phone, purpose);
  const onCooldown  = await getCache(cooldownKey);
  if (onCooldown) {
    throw new AppError(
      `Please wait ${RESEND_COOLDOWN} seconds before requesting another OTP`,
      429,
      'OTP_COOLDOWN'
    );
  }

  const otp  = generateOtp();
  const hash = crypto.createHash('sha256').update(otp + process.env.JWT_ACCESS_SECRET).digest('hex');

  // Store in Redis (fast lookup for verification)
  await setCache(keys.otp(phone, purpose), { hash, purpose }, OTP_EXPIRY);

  // Set cooldown
  await setCache(cooldownKey, '1', RESEND_COOLDOWN);

  // Reset attempt counter
  await delCache(keys.attempts(phone, purpose));

  // Also store in MongoDB for audit trail
  await WhatsAppOtp.findOneAndUpdate(
    { phone, purpose, isUsed: false },
    { phone, purpose, otp: hash, isUsed: false, ip, attempts: 0, expiresAt: new Date(Date.now() + OTP_EXPIRY * 1000) },
    { upsert: true, new: true }
  );

  // Send via WhatsApp
  await dispatchWhatsAppMessage(phone, otp);

  return { phone, otpSent: true, expiresInMinutes: OTP_EXPIRY / 60 };
}

// ─────────────────────────────────────────────
//  VERIFY OTP
// ─────────────────────────────────────────────

async function verifyWhatsAppOtp(phone, otp, purpose) {
  const attemptsKey = keys.attempts(phone, purpose);
  const otpKey      = keys.otp(phone, purpose);

  // Check attempt count
  const attempts = parseInt(await getCache(attemptsKey) || '0');
  if (attempts >= MAX_ATTEMPTS) {
    throw new AppError('Too many incorrect attempts. Please request a new OTP.', 429, 'OTP_MAX_ATTEMPTS');
  }

  // Get stored OTP
  const stored = await getCache(otpKey);
  if (!stored) {
    throw new AppError('OTP expired or not found. Please request a new one.', 400, 'OTP_EXPIRED');
  }

  // Verify hash
  const inputHash = crypto.createHash('sha256').update(otp + process.env.JWT_ACCESS_SECRET).digest('hex');
  if (inputHash !== stored.hash) {
    await incr(attemptsKey, OTP_EXPIRY);
    const remaining = MAX_ATTEMPTS - (attempts + 1);
    throw new AppError(
      remaining > 0 ? `Incorrect OTP. ${remaining} attempt(s) remaining.` : 'Incorrect OTP.',
      400,
      'OTP_INVALID'
    );
  }

  // Valid — clean up
  await delCache(otpKey);
  await delCache(attemptsKey);

  // Mark used in MongoDB
  await WhatsAppOtp.findOneAndUpdate(
    { phone, purpose, isUsed: false },
    { isUsed: true, usedAt: new Date() }
  );

  return true;
}

// ─────────────────────────────────────────────
//  WHATSAPP DISPATCH (WATI provider)
//  Swap this function body for Twilio or Meta API
// ─────────────────────────────────────────────

async function dispatchWhatsAppMessage(phone, otp) {
  const provider = process.env.WHATSAPP_PROVIDER || 'wati';

  if (provider === 'wati') {
    await axios.post(
      `${process.env.WATI_API_URL}/api/v1/sendTemplateMessage`,
      {
        template_name: process.env.WATI_OTP_TEMPLATE_NAME || 'sayari_otp',
        broadcast_name: `otp_${Date.now()}`,
        receivers: [{ whatsappNumber: phone.replace('+', ''), customParams: [{ name: 'otp', value: otp }] }],
      },
      { headers: { Authorization: `Bearer ${process.env.WATI_ACCESS_TOKEN}`, 'Content-Type': 'application/json' } }
    );
  } else if (provider === 'console') {
    // Development fallback — print to console
    console.log(`\n🔑 [DEV] WhatsApp OTP for ${phone}: ${otp}\n`);
  } else {
    throw new AppError('WhatsApp provider not configured', 500, 'WA_PROVIDER_MISSING');
  }
}

module.exports = { sendWhatsAppOtp, verifyWhatsAppOtp, generateOtp };
