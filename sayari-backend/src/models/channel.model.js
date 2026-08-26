'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────
//  SUB-SCHEMAS
// ─────────────────────────────────────────────

const ChannelThemeSchema = new Schema({
  bannerImage   : {
    url     : { type: String, default: null },
    driveId : { type: String, default: null },
  },
  profileRing   : { type: String, default: null },  // colour hex or gradient id
  accentColor   : { type: String, default: '#6C63FF' },
}, { _id: false });

const ChannelCategorySchema = new Schema({
  primary  : {
    type : String,
    enum : ['sayari', 'kavita', 'ghazal', 'nazm', 'story', 'novel', 'audiobook', 'motivation', 'comedy', 'religious', 'mixed'],
    default: 'mixed',
  },
  secondary: [{ type: String }],
}, { _id: false });

// ─────────────────────────────────────────────
//  MAIN CHANNEL SCHEMA
// ─────────────────────────────────────────────

const ChannelSchema = new Schema({

  // ── Ownership ─────────────────────────────
  owner          : {
    type    : Schema.Types.ObjectId,
    ref     : 'User',
    required: true,
    index   : true,
    unique  : true,   // one channel per user
  },

  // ── Identity ──────────────────────────────
  handle         : {
    type     : String,
    required : true,
    unique   : true,
    trim     : true,
    lowercase: true,
    minlength: 3,
    maxlength: 40,
    match    : [/^[a-z0-9_.]+$/, 'Handle can only contain letters, numbers, _ and .'],
    index    : true,
  },
  name           : { type: String, required: true, trim: true, maxlength: 80 },
  tagline        : { type: String, maxlength: 160, default: '' },
  description    : { type: String, maxlength: 2000, default: '' },

  // ── Branding ──────────────────────────────
  logo           : {
    url     : { type: String, default: null },
    driveId : { type: String, default: null },
    thumbnail: { type: String, default: null },
  },
  theme          : { type: ChannelThemeSchema, default: () => ({}) },

  // ── Category & Language ───────────────────
  category       : { type: ChannelCategorySchema, default: () => ({}) },
  languages      : {
    type   : [{ type: String, enum: ['ur', 'hi', 'en', 'pa', 'mixed'] }],
    default: ['hi'],
  },

  // ── Status ────────────────────────────────
  isPublic       : { type: Boolean, default: true, index: true },
  isActive       : { type: Boolean, default: true, index: true },

  // ── Stats (denormalised) ──────────────────
  stats          : {
    followersCount: { type: Number, default: 0, min: 0 },
    postsCount    : { type: Number, default: 0, min: 0 },
    seriesCount   : { type: Number, default: 0, min: 0 },
    audioCount    : { type: Number, default: 0, min: 0 },
    totalViews    : { type: Number, default: 0, min: 0 },
    totalLikes    : { type: Number, default: 0, min: 0 },
  },

  // ── Featured post (pinned to top) ─────────
  featuredPost   : { type: Schema.Types.ObjectId, ref: 'Post', default: null },

  // ── Admin ─────────────────────────────────
  isVerified     : { type: Boolean, default: false },
  verifiedAt     : { type: Date, default: null },
  verifiedBy     : { type: Schema.Types.ObjectId, ref: 'User', default: null },
  adminNote      : { type: String, default: null, select: false },

  // ── Soft delete ───────────────────────────
  isDeleted      : { type: Boolean, default: false, index: true },
  deletedAt      : { type: Date, default: null },

}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'channels',
});

// ─────────────────────────────────────────────
//  INDEXES
// ─────────────────────────────────────────────

ChannelSchema.index({ handle: 1 });
ChannelSchema.index({ owner: 1 });
ChannelSchema.index({ isPublic: 1, isActive: 1, isDeleted: 1 });
ChannelSchema.index({ 'stats.followersCount': -1 });
ChannelSchema.index({ 'category.primary': 1 });
ChannelSchema.index({ createdAt: -1 });

// Text search on channel fields
ChannelSchema.index(
  { name: 'text', tagline: 'text', description: 'text', handle: 'text' },
  { weights: { name: 10, handle: 8, tagline: 5, description: 1 }, name: 'channel_text_idx' }
);

module.exports = mongoose.model('Channel', ChannelSchema);
