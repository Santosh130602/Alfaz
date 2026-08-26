'use strict';

/**
 * SAYARI PLATFORM — DATABASE SEEDER
 * Run once on first deploy: node scripts/seed.js
 *
 * Creates:
 *   1. Superadmin user account
 *   2. Default AppConfig key-value entries
 *   3. Google Drive folder structure
 */

require('dotenv').config();

const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');

// ─────────────────────────────────────────────
//  CONNECT
// ─────────────────────────────────────────────

async function connect() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ MongoDB connected');
}

// ─────────────────────────────────────────────
//  SEED 1: SUPERADMIN USER
// ─────────────────────────────────────────────

async function seedAdmin() {
  const { User, Channel } = require('../src/models');

  const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    || 'admin@sayari.app';
  const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
  const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME || 'sayari_admin';

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('⚠  Admin user already exists — skipping');
    return existing;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await User.create({
    username     : ADMIN_USERNAME,
    displayName  : 'Sayari Admin',
    email        : ADMIN_EMAIL,
    passwordHash,
    authProvider : 'local',
    emailVerified: true,
    role         : 'superadmin',
    accountStatus: 'active',
    isVerified   : true,
    badges       : [{ type: 'verified', awardedAt: new Date() }],
  });

  // Create admin channel
  const channel = await Channel.create({
    owner      : admin._id,
    handle     : ADMIN_USERNAME,
    name       : 'Sayari Official',
    tagline    : 'Official channel of the Sayari platform',
    isPublic   : true,
    isVerified : true,
    verifiedAt : new Date(),
    verifiedBy : admin._id,
  });

  admin.channel = channel._id;
  admin.role    = 'superadmin';
  await admin.save({ validateBeforeSave: false });

  console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
  console.log(`   Username : ${ADMIN_USERNAME}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
  console.log(`   ⚠  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION`);
  return admin;
}

// ─────────────────────────────────────────────
//  SEED 2: APP CONFIG DEFAULTS
// ─────────────────────────────────────────────

async function seedAppConfig() {
  const { AppConfig } = require('../src/models');

  const defaults = [
    { key: 'maintenance_mode',            value: false,     valueType: 'boolean', description: 'Enable maintenance mode — all API requests return 503', isPublic: true },
    { key: 'max_post_image_size_mb',      value: 15,        valueType: 'number',  description: 'Max size for post images in MB', isPublic: true },
    { key: 'max_audio_size_mb',           value: 100,       valueType: 'number',  description: 'Max size for audio uploads in MB', isPublic: true },
    { key: 'max_tags_per_post',           value: 10,        valueType: 'number',  description: 'Max number of tags allowed per post', isPublic: true },
    { key: 'max_stickers_per_canvas',     value: 10,        valueType: 'number',  description: 'Max stickers on a single canvas post', isPublic: true },
    { key: 'allowed_audio_formats',       value: ['mp3','wav','m4a','ogg'], valueType: 'array', description: 'Allowed audio file extensions', isPublic: true },
    { key: 'trending_recalc_interval_m',  value: 60,        valueType: 'number',  description: 'How often trending scores are recalculated (minutes)' },
    { key: 'whatsapp_otp_enabled',        value: true,      valueType: 'boolean', description: 'Enable WhatsApp OTP login/signup', isPublic: true },
    { key: 'google_oauth_enabled',        value: true,      valueType: 'boolean', description: 'Enable Google OAuth login', isPublic: true },
    { key: 'apple_oauth_enabled',         value: true,      valueType: 'boolean', description: 'Enable Apple OAuth login', isPublic: true },
    { key: 'new_user_welcome_message',    value: 'Sayari mein aapka swagat hai! 🎉', valueType: 'string', description: 'Welcome message sent to new users', isPublic: false },
    { key: 'canvas_default_width',        value: 1080,      valueType: 'number',  description: 'Default canvas width in pixels', isPublic: true },
    { key: 'canvas_default_height',       value: 1080,      valueType: 'number',  description: 'Default canvas height in pixels', isPublic: true },
    { key: 'registration_open',           value: true,      valueType: 'boolean', description: 'Allow new user registrations', isPublic: true },
    { key: 'analytics_retention_days',    value: 90,        valueType: 'number',  description: 'Days to retain raw view events before auto-deletion' },
    { key: 'notification_retention_days', value: 60,        valueType: 'number',  description: 'Days to retain notification documents' },
    { key: 'min_app_version_ios',         value: '1.0.0',   valueType: 'string',  description: 'Minimum iOS app version required', isPublic: true },
    { key: 'min_app_version_android',     value: '1.0.0',   valueType: 'string',  description: 'Minimum Android app version required', isPublic: true },
    { key: 'force_update_enabled',        value: false,     valueType: 'boolean', description: 'Force users to update to minimum app version', isPublic: true },
  ];

  let created = 0;
  for (const config of defaults) {
    const exists = await AppConfig.findOne({ key: config.key });
    if (!exists) {
      await AppConfig.create(config);
      created++;
    }
  }

  console.log(`✅ App configs: ${created} created, ${defaults.length - created} already existed`);
}

// ─────────────────────────────────────────────
//  SEED 3: GOOGLE DRIVE FOLDER STRUCTURE
// ─────────────────────────────────────────────

async function seedDriveFolders() {
  // Only run if Drive credentials are configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('⚠  Google OAuth not configured — skipping Drive folder setup');
    return;
  }

  try {
    const { ensureFolder, getDriveClient } = require('../src/config/drive');
    const { DriveToken } = require('../src/models');

    const existing = await DriveToken.findOne({ label: 'primary' });
    if (!existing) {
      console.log('⚠  No DriveToken found — skipping folder setup (add one via admin panel)');
      return;
    }

    console.log('📁 Setting up Google Drive folders...');

    // Root folder
    const rootId     = await ensureFolder('Sayari Platform');

    // Sub-folders
    const [postsId, audioId, coversId, avatarsId, templatesId, assetsId] = await Promise.all([
      ensureFolder('posts',     rootId),
      ensureFolder('audio',     rootId),
      ensureFolder('covers',    rootId),
      ensureFolder('avatars',   rootId),
      ensureFolder('templates', rootId),
      ensureFolder('assets',    rootId),
    ]);

    await DriveToken.findOneAndUpdate(
      { label: 'primary' },
      { folders: { posts: postsId, audio: audioId, covers: coversId, avatars: avatarsId, templates: templatesId, assets: assetsId } }
    );

    console.log('✅ Google Drive folders created and saved to DriveToken');
    console.log(`   Root      : ${rootId}`);
    console.log(`   Posts     : ${postsId}`);
    console.log(`   Audio     : ${audioId}`);
    console.log(`   Covers    : ${coversId}`);
    console.log(`   Avatars   : ${avatarsId}`);
    console.log(`   Templates : ${templatesId}`);
    console.log(`   Assets    : ${assetsId}`);

  } catch (err) {
    console.warn('⚠  Drive folder setup skipped:', err.message);
  }
}

// ─────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════╗');
  console.log('║   SAYARI PLATFORM — DB SEEDER    ║');
  console.log('╚══════════════════════════════════╝\n');

  try {
    await connect();
    await seedAdmin();
    await seedAppConfig();
    await seedDriveFolders();

    console.log('\n✅ Seeding complete. Platform is ready.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
