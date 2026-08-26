'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ═════════════════════════════════════════════
//  TEMPLATE SCHEMA
//  Admin uploads background templates that users
//  pick in the post creator canvas editor
// ═════════════════════════════════════════════

const TemplateSchema = new Schema({

  // ── Identity ──────────────────────────────
  name           : { type: String, required: true, trim: true, maxlength: 100 },
  description    : { type: String, maxlength: 500, default: '' },

  // ── Category ──────────────────────────────
  category       : {
    type : String,
    enum : ['sayari', 'kavita', 'ghazal', 'story', 'audio_cover', 'eid', 'festival', 'nature', 'minimal', 'dark', 'light', 'vintage', 'modern', 'religious', 'romantic', 'all'],
    default: 'all',
    index: true,
  },
  tags           : { type: [{ type: String, trim: true, lowercase: true }], default: [], index: true },
  mood           : { type: [String], default: [] },

  // ── Canvas dimensions ─────────────────────
  orientation    : {
    type   : String,
    enum   : ['square', 'portrait', 'landscape', 'story'],
    default: 'square',
    index  : true,
  },
  dimensions     : {
    width : { type: Number, default: 1080 },
    height: { type: Number, default: 1080 },
  },

  // ── Image file ────────────────────────────
  image          : {
    url      : { type: String, required: true },   // Google Drive / CDN URL
    driveId  : { type: String, required: true },
    thumbnail: { type: String, default: null },    // 300px preview for picker
    sizeBytes: { type: Number, default: null },
    mimeType : { type: String, default: 'image/jpeg' },
  },

  // ── Canvas defaults ───────────────────────
  // Pre-configured text zones so text is placed optimally on this BG
  defaultTextZones: [{
    id       : { type: String },
    x        : { type: Number },
    y        : { type: Number },
    width    : { type: Number },
    height   : { type: Number },
    textAlign: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
    fontColor: { type: String, default: '#FFFFFF' },
    fontSize : { type: Number, default: 48 },
    fontFamily: { type: String, default: 'Noto Nastaliq Urdu' },
  }],

  // ── Status ────────────────────────────────
  isActive       : { type: Boolean, default: true, index: true },
  isPremium      : { type: Boolean, default: false, index: true }, // future monetisation
  usageCount     : { type: Number, default: 0, min: 0 },          // how many posts used this
  sortOrder      : { type: Number, default: 0 },                   // admin can reorder

  // ── Ownership ─────────────────────────────
  uploadedBy     : { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy      : { type: Schema.Types.ObjectId, ref: 'User', default: null },

  // ── Soft delete ───────────────────────────
  isDeleted      : { type: Boolean, default: false, index: true },
  deletedAt      : { type: Date, default: null },

}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'templates',
});

TemplateSchema.index({ category: 1, isActive: 1, isDeleted: 1, sortOrder: 1 });
TemplateSchema.index({ tags: 1, isActive: 1 });
TemplateSchema.index({ orientation: 1, isActive: 1 });
TemplateSchema.index({ usageCount: -1 });


// ═════════════════════════════════════════════
//  ASSET SCHEMA
//  Stickers, logos, font files, icons
//  uploaded by admin, used in canvas editor
// ═════════════════════════════════════════════

const AssetSchema = new Schema({

  // ── Identity ──────────────────────────────
  name           : { type: String, required: true, trim: true, maxlength: 100 },
  description    : { type: String, maxlength: 300, default: '' },

  // ── Type ──────────────────────────────────
  assetType      : {
    type : String,
    enum : ['sticker', 'logo', 'font', 'icon', 'frame', 'divider', 'watermark'],
    required: true,
    index: true,
  },

  // ── Category ──────────────────────────────
  category       : {
    type : String,
    enum : ['dil', 'sitaara', 'phool', 'patta', 'moon', 'sun', 'bird', 'urdu_calligraphy', 'islamic', 'festival', 'nature', 'abstract', 'emoji_style', 'brand', 'other'],
    default: 'other',
    index: true,
  },
  tags           : { type: [{ type: String, trim: true, lowercase: true }], default: [], index: true },

  // ── File ──────────────────────────────────
  file           : {
    url      : { type: String, required: true },    // Google Drive / CDN
    driveId  : { type: String, required: true },
    thumbnail: { type: String, default: null },
    sizeBytes: { type: Number, default: null },
    mimeType : { type: String, default: 'image/png' },
    width    : { type: Number, default: null },
    height   : { type: Number, default: null },
  },

  // ── Font-specific ─────────────────────────
  fontMeta       : {
    fontFamily   : { type: String, default: null },
    fontStyle    : { type: String, enum: ['regular', 'bold', 'italic', 'bold_italic'], default: 'regular' },
    supportsUrdu : { type: Boolean, default: false },
    supportsHindi: { type: Boolean, default: false },
    previewText  : { type: String, default: 'نمونہ متن' },   // Urdu/Hindi sample text
  },

  // ── Status ────────────────────────────────
  isActive       : { type: Boolean, default: true, index: true },
  isPremium      : { type: Boolean, default: false },
  usageCount     : { type: Number, default: 0, min: 0 },
  sortOrder      : { type: Number, default: 0 },

  // ── Ownership ─────────────────────────────
  uploadedBy     : { type: Schema.Types.ObjectId, ref: 'User', required: true },

  // ── Soft delete ───────────────────────────
  isDeleted      : { type: Boolean, default: false, index: true },
  deletedAt      : { type: Date, default: null },

}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'assets',
});

AssetSchema.index({ assetType: 1, category: 1, isActive: 1, isDeleted: 1, sortOrder: 1 });
AssetSchema.index({ tags: 1, isActive: 1 });
AssetSchema.index({ usageCount: -1 });

module.exports = {
  Template: mongoose.model('Template', TemplateSchema),
  Asset   : mongoose.model('Asset',    AssetSchema),
};
