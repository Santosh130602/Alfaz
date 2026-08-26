'use strict';

const { body, param } = require('express-validator');

// ─────────────────────────────────────────────
//  REUSABLE FIELD VALIDATORS
// ─────────────────────────────────────────────

const phoneField = (field = 'phone') =>
  body(field)
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{7,14}$/).withMessage('Invalid phone number format (include country code e.g. +91XXXXXXXXXX)');

const otpField = () =>
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only digits');

const passwordField = (field = 'password') =>
  body(field)
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number');

const emailField = (field = 'email') =>
  body(field)
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail();

const usernameField = () =>
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[a-z0-9_.]+$/).withMessage('Username can only contain lowercase letters, numbers, _ and .')
    .toLowerCase();

const displayNameField = () =>
  body('displayName')
    .trim()
    .notEmpty().withMessage('Display name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Display name must be 2–60 characters');

// ─────────────────────────────────────────────
//  VALIDATION RULE SETS PER ENDPOINT
// ─────────────────────────────────────────────

module.exports = {
  // POST /auth/register (email+password)
  registerEmail: [
    emailField(),
    passwordField(),
    usernameField(),
    displayNameField(),
    body('language').optional().isIn(['ur', 'hi', 'en', 'mixed']).withMessage('Invalid language'),
  ],

  // POST /auth/login (email+password)
  loginEmail: [
    emailField(),
    body('password').notEmpty().withMessage('Password is required'),
    body('deviceInfo').optional().isObject(),
  ],

  // POST /auth/whatsapp/send-otp
  sendOtp: [
    phoneField(),
    body('purpose')
      .notEmpty().withMessage('Purpose is required')
      .isIn(['signup', 'login', 'phone_verify', 'password_reset'])
      .withMessage('Invalid OTP purpose'),
  ],

  // POST /auth/whatsapp/verify-otp
  verifyOtp: [
    phoneField(),
    otpField(),
    body('purpose').notEmpty().isIn(['signup', 'login', 'phone_verify', 'password_reset']),
  ],

  // POST /auth/whatsapp/complete-signup (after OTP verified)
  completeWhatsappSignup: [
    phoneField(),
    body('otpToken').notEmpty().withMessage('OTP session token is required'),
    usernameField(),
    displayNameField(),
    body('language').optional().isIn(['ur', 'hi', 'en', 'mixed']),
  ],

  // POST /auth/refresh
  // refreshToken: [
  //   body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  // ],

  refreshToken: [],

  // POST /auth/logout
  logout: [
    body('refreshToken').optional(),
    body('allDevices').optional().isBoolean(),
  ],

  // POST /auth/forgot-password
  forgotPassword: [
    emailField(),
  ],

  // POST /auth/reset-password
  resetPassword: [
    body('token').notEmpty().withMessage('Reset token is required'),
    passwordField('newPassword'),
    body('confirmPassword')
      .notEmpty().withMessage('Confirm password is required')
      .custom((val, { req }) => {
        if (val !== req.body.newPassword) throw new Error('Passwords do not match');
        return true;
      }),
  ],

  // POST /auth/change-password
  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    passwordField('newPassword'),
  ],

  // POST /auth/google  (token from frontend Google sign-in)
  googleAuth: [
    body('idToken').notEmpty().withMessage('Google ID token is required'),
    body('deviceInfo').optional().isObject(),
  ],

  // POST /auth/apple
  appleAuth: [
    body('identityToken').notEmpty().withMessage('Apple identity token is required'),
    body('user').optional().isObject(),
    body('deviceInfo').optional().isObject(),
  ],
};
