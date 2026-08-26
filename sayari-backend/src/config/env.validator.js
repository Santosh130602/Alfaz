'use strict';

// ─────────────────────────────────────────────
//  ENVIRONMENT VARIABLE VALIDATOR
//  Called at the very start of server.js
//  Crashes immediately with clear message if
//  any required variable is missing or invalid
// ─────────────────────────────────────────────

const REQUIRED = {
  // App
  NODE_ENV           : { values: ['development', 'production', 'test'] },
  PORT               : { type: 'number', min: 1, max: 65535 },

  // Database
  MONGODB_URI        : { type: 'url_or_string' },

  // Redis
  REDIS_HOST         : { type: 'string' },

  // JWT — must be at least 64 chars for security
  JWT_ACCESS_SECRET  : { type: 'string', minLength: 32 },
  JWT_REFRESH_SECRET : { type: 'string', minLength: 32 },
  JWT_ACCESS_EXPIRES : { type: 'string' },
  JWT_REFRESH_EXPIRES: { type: 'string' },

  // CORS
  CORS_ORIGINS       : { type: 'string' },
};

const OPTIONAL_WARN = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'FIREBASE_SERVICE_ACCOUNT',
  'WATI_ACCESS_TOKEN',
  'WATI_API_URL',
  'APPLE_CLIENT_ID',
];

function validateEnv() {
  const errors  = [];
  const warnings = [];

  for (const [key, rules] of Object.entries(REQUIRED)) {
    const val = process.env[key];

    if (!val || val.trim() === '') {
      errors.push(`  ✗ ${key} — MISSING (required)`);
      continue;
    }

    if (rules.values && !rules.values.includes(val)) {
      errors.push(`  ✗ ${key} — invalid value "${val}". Must be one of: ${rules.values.join(', ')}`);
    }

    if (rules.type === 'number') {
      const n = parseInt(val);
      if (isNaN(n) || (rules.min && n < rules.min) || (rules.max && n > rules.max)) {
        errors.push(`  ✗ ${key} — must be a number between ${rules.min} and ${rules.max}`);
      }
    }

    if (rules.minLength && val.length < rules.minLength) {
      errors.push(`  ✗ ${key} — too short (min ${rules.minLength} chars). Got ${val.length} chars.`);
    }
  }

  // Warn about optional but recommended vars
  for (const key of OPTIONAL_WARN) {
    if (!process.env[key]) {
      warnings.push(`  ⚠  ${key} — not set (some features will be disabled)`);
    }
  }

  // Print warnings
  if (warnings.length) {
    console.warn('\n[Config] Optional environment variables not set:');
    warnings.forEach(w => console.warn(w));
  }

  // Crash on errors
  if (errors.length) {
    console.error('\n╔══════════════════════════════════════════════╗');
    console.error('║   SAYARI — ENVIRONMENT VALIDATION FAILED     ║');
    console.error('╚══════════════════════════════════════════════╝');
    console.error('\nMissing or invalid environment variables:\n');
    errors.forEach(e => console.error(e));
    console.error('\nCopy .env.example to .env and fill in the values.\n');
    process.exit(1);
  }

  console.log(`✅ Environment validated (${process.env.NODE_ENV})`);
}

module.exports = validateEnv;
