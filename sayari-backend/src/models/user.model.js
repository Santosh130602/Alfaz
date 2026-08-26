'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────
//  SUB-SCHEMAS
// ─────────────────────────────────────────────

const SocialLinksSchema = new Schema({
  instagram : { type: String, trim: true, default: null },
  youtube   : { type: String, trim: true, default: null },
  twitter   : { type: String, trim: true, default: null },
  website   : { type: String, trim: true, default: null },
}, { _id: false });

const NotificationPrefsSchema = new Schema({
  newFollower       : { type: Boolean, default: true },
  newComment        : { type: Boolean, default: true },
  newLike           : { type: Boolean, default: true },
  newChapter        : { type: Boolean, default: true },
  adminAnnouncement : { type: Boolean, default: true },
  whatsapp          : { type: Boolean, default: false },
  push              : { type: Boolean, default: true },
  email             : { type: Boolean, default: false },
}, { _id: false });

const BadgeSchema = new Schema({
  type      : {
    type    : String,
    enum    : ['verified', 'rising_star', 'top_creator', 'voice_artist', 'author', 'admin_pick'],
    required: true,
  },
  awardedAt : { type: Date, default: Date.now },
  awardedBy : { type: Schema.Types.ObjectId, ref: 'User', default: null }, // admin who gave it
}, { _id: true });

const DeviceTokenSchema = new Schema({
  token     : { type: String, required: true },
  platform  : { type: String, enum: ['ios', 'android', 'web'], required: true },
  addedAt   : { type: Date, default: Date.now },
}, { _id: false });

// ─────────────────────────────────────────────
//  MAIN USER SCHEMA
// ─────────────────────────────────────────────

const UserSchema = new Schema({

  // ── Identity ──────────────────────────────
  username       : {
    type     : String,
    required : true,
    unique   : true,
    trim     : true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match    : [/^[a-z0-9_.]+$/, 'Username can only contain letters, numbers, _ and .'],
    index    : true,
  },
  displayName    : { type: String, required: true, trim: true, maxlength: 60 },
  email          : {
    type     : String,
    unique   : true,
    sparse   : true,   // allow null (whatsapp-only users won't have email)
    trim     : true,
    lowercase: true,
    index    : true,
  },
  phone          : {
    number      : { type: String, trim: true, default: null },
    countryCode : { type: String, trim: true, default: '+91' },
    isVerified  : { type: Boolean, default: false },
  },
  whatsapp       : {
    number      : { type: String, trim: true, default: null },
    isVerified  : { type: Boolean, default: false },
    lastOtpSentAt: { type: Date, default: null },
    otpAttempts : { type: Number, default: 0 },
  },

  // ── Auth ──────────────────────────────────
  passwordHash   : { type: String, select: false },               // null for OAuth users
  authProvider   : {
    type   : String,
    enum   : ['local', 'google', 'apple'],
    default: 'local',
  },
  oauthId        : { type: String, sparse: true, index: true },   // Google / Apple sub

  // ── Profile ───────────────────────────────
  avatar         : {
    url      : { type: String, default: null },       // Google Drive / CDN URL
    driveId  : { type: String, default: null },       // Google Drive file ID
    thumbnail: { type: String, default: null },
  },
  bio            : { type: String, maxlength: 300, default: '' },
  language       : {
    type   : String,
    enum   : ['ur', 'hi', 'en', 'mixed'],
    default: 'hi',
  },
  socialLinks    : { type: SocialLinksSchema, default: () => ({}) },

  // ── Role & Status ─────────────────────────
  role           : {
    type   : String,
    enum   : ['user', 'creator', 'moderator', 'admin', 'superadmin'],
    default: 'user',
    index  : true,
  },
  accountStatus  : {
    type   : String,
    enum   : ['active', 'suspended', 'banned', 'deactivated', 'pending_verification'],
    default: 'active',
    index  : true,
  },
  banInfo        : {
    reason     : { type: String, default: null },
    bannedAt   : { type: Date, default: null },
    bannedBy   : { type: Schema.Types.ObjectId, ref: 'User', default: null },
    banExpiresAt: { type: Date, default: null },   // null = permanent
  },

  // ── Channel (every user gets one channel) ─
  channel        : {
    type: Schema.Types.ObjectId,
    ref : 'Channel',
    default: null,
    index: true,
  },

  // ── Stats (denormalised for feed perf) ────
  stats          : {
    followersCount : { type: Number, default: 0, min: 0 },
    followingCount : { type: Number, default: 0, min: 0 },
    postsCount     : { type: Number, default: 0, min: 0 },
    totalLikes     : { type: Number, default: 0, min: 0 },
    totalViews     : { type: Number, default: 0, min: 0 },
    totalPlays     : { type: Number, default: 0, min: 0 },
  },

  // ── Badges ────────────────────────────────
  badges         : { type: [BadgeSchema], default: [] },
  isVerified     : { type: Boolean, default: false, index: true },

  // ── Notifications ─────────────────────────
  notificationPrefs : { type: NotificationPrefsSchema, default: () => ({}) },
  deviceTokens      : { type: [DeviceTokenSchema], default: [] },

  // ── Security ──────────────────────────────
  emailVerified     : { type: Boolean, default: false },
  emailVerifyToken  : { type: String, select: false, default: null },
  passwordResetToken: { type: String, select: false, default: null },
  passwordResetExpiry: { type: Date, select: false, default: null },
  twoFactorEnabled  : { type: Boolean, default: false },
  lastLoginAt       : { type: Date, default: null },
  lastLoginIp       : { type: String, default: null, select: false },

  // ── Soft delete ───────────────────────────
  isDeleted  : { type: Boolean, default: false, index: true },
  deletedAt  : { type: Date, default: null },

}, {
  timestamps : true,   // createdAt, updatedAt
  collection : 'users',
});

// ─────────────────────────────────────────────
//  INDEXES
// ─────────────────────────────────────────────

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ 'phone.number': 1 });
UserSchema.index({ 'whatsapp.number': 1 });
UserSchema.index({ role: 1, accountStatus: 1 });
UserSchema.index({ isDeleted: 1, accountStatus: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'stats.followersCount': -1 });

// ─────────────────────────────────────────────
//  VIRTUALS
// ─────────────────────────────────────────────

UserSchema.virtual('isActive').get(function () {
  return !this.isDeleted && this.accountStatus === 'active';
});

UserSchema.virtual('profileUrl').get(function () {
  return `/u/${this.username}`;
});

// ─────────────────────────────────────────────
//  METHODS
// ─────────────────────────────────────────────

UserSchema.methods.toPublicJSON = function () {
  return {
    _id        : this._id,
    username   : this.username,
    displayName: this.displayName,
    avatar     : this.avatar,
    bio        : this.bio,
    isVerified : this.isVerified,
    badges     : this.badges,
    stats      : this.stats,
    channel    : this.channel,
    role       : this.role,
    createdAt  : this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);
