'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ═════════════════════════════════════════════
//  SESSION / REFRESH TOKEN SCHEMA
//  JWT access tokens are stateless;
//  refresh tokens are stored for revocation
// ═════════════════════════════════════════════

const SessionSchema = new Schema({
  user           : { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  refreshToken   : { type: String, required: true, unique: true, select: false },
  deviceInfo     : {
    platform  : { type: String, enum: ['ios', 'android', 'web', 'unknown'], default: 'unknown' },
    deviceName: { type: String, default: null },
    userAgent : { type: String, default: null, select: false },
    ip        : { type: String, default: null, select: false },
  },
  isRevoked      : { type: Boolean, default: false, index: true },
  revokedAt      : { type: Date, default: null },
  lastUsedAt     : { type: Date, default: Date.now },
  previousRefreshToken: { type: String, default: null, select: false },
  previousRotatedAt   : { type: Date, default: null },
  // Auto-delete 30 days after last use
  expiresAt      : {
    type   : Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    index  : { expireAfterSeconds: 0 },
  },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'sessions',
});

SessionSchema.index({ user: 1, isRevoked: 1 });


// ═════════════════════════════════════════════
//  ADMIN ACTION LOG SCHEMA
//  Every admin action is logged for audit trail
// ═════════════════════════════════════════════

const AdminActionSchema = new Schema({
  admin          : { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  actionType     : {
    type : String,
    enum : [
      'ban_user', 'unban_user', 'suspend_user', 'delete_user',
      'edit_user_profile', 'verify_user', 'assign_badge', 'change_user_role',
      'delete_post', 'edit_post', 'feature_post', 'hide_post', 'review_report',
      'delete_series', 'upload_template', 'delete_template',
      'upload_asset', 'delete_asset',
      'send_announcement', 'dismiss_report',
      'platform_config_change',
    ],
    required: true,
    index: true,
  },
  targetType     : { type: String, enum: ['user', 'post', 'series', 'channel', 'template', 'asset', 'report', 'platform'], default: null },
  targetId       : { type: Schema.Types.ObjectId, default: null },
  reason         : { type: String, maxlength: 1000, default: '' },
  before         : { type: Schema.Types.Mixed, default: null, select: false },  // snapshot before change
  after          : { type: Schema.Types.Mixed, default: null, select: false },  // snapshot after change
  ip             : { type: String, default: null, select: false },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'admin_actions',
});

AdminActionSchema.index({ admin: 1, createdAt: -1 });
AdminActionSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
AdminActionSchema.index({ actionType: 1, createdAt: -1 });


// ═════════════════════════════════════════════
//  APP CONFIG SCHEMA
//  Platform-wide settings controlled by admin
//  Single document, loaded at startup + cached in Redis
// ═════════════════════════════════════════════

const AppConfigSchema = new Schema({
  key            : { type: String, required: true, unique: true, index: true },
  value          : { type: Schema.Types.Mixed, required: true },
  valueType      : { type: String, enum: ['string', 'number', 'boolean', 'object', 'array'], default: 'string' },
  description    : { type: String, default: '' },
  isPublic       : { type: Boolean, default: false },  // expose to frontend?
  updatedBy      : { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'app_configs',
});

// Default config keys (seed these on first deploy):
// maintenance_mode: false
// max_post_image_size_mb: 10
// max_audio_size_mb: 100
// allowed_audio_formats: ['mp3', 'wav', 'm4a', 'ogg']
// trending_recalc_interval_mins: 60
// whatsapp_otp_enabled: true
// new_user_welcome_message: '...'
// max_tags_per_post: 10
// max_stickers_per_post: 5


// ═════════════════════════════════════════════
//  GOOGLE DRIVE TOKEN SCHEMA
//  Stores OAuth2 tokens for Google Drive API
//  (service account tokens, not user tokens)
// ═════════════════════════════════════════════

const DriveTokenSchema = new Schema({
  label          : { type: String, required: true, unique: true },  // e.g. 'primary', 'backup'
  accessToken    : { type: String, required: true, select: false },
  refreshToken   : { type: String, required: true, select: false },
  expiresAt      : { type: Date, required: true },
  email          : { type: String, required: true },   // Google account email
  driveQuotaUsed : { type: Number, default: 0 },       // bytes used
  driveQuotaTotal: { type: Number, default: 5368709120000 }, // 5TB in bytes
  folders        : {
    posts      : { type: String, default: null },  // Google Drive folder ID for post images
    audio      : { type: String, default: null },  // folder ID for audio files
    covers     : { type: String, default: null },  // folder ID for audio covers
    avatars    : { type: String, default: null },  // folder ID for user avatars
    templates  : { type: String, default: null },  // folder ID for templates
    assets     : { type: String, default: null },  // folder ID for stickers/logos
  },
  isActive       : { type: Boolean, default: true },
  lastSyncedAt   : { type: Date, default: null },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'drive_tokens',
});


module.exports = {
  Session    : mongoose.model('Session',     SessionSchema),
  AdminAction: mongoose.model('AdminAction', AdminActionSchema),
  AppConfig  : mongoose.model('AppConfig',   AppConfigSchema),
  DriveToken : mongoose.model('DriveToken',  DriveTokenSchema),
};
