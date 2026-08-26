'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────
//  ENUMS (exported for reuse in controllers)
// ─────────────────────────────────────────────

const POST_TYPES    = ['sayari', 'kavita', 'ghazal', 'nazm', 'story_chapter', 'book_chapter', 'audio', 'quote', 'shayari'];
const POST_STATUS   = ['draft', 'published', 'scheduled', 'archived', 'under_review'];
const VISIBILITY    = ['public', 'private', 'followers_only'];
const LANGUAGES     = ['ur', 'hi', 'en', 'pa', 'mixed'];
const MOODS         = ['ishq', 'dard', 'khushi', 'udaasi', 'gussa', 'ummeed', 'motivational', 'romantic', 'funny', 'religious', 'patriotic', 'nature'];

// ─────────────────────────────────────────────
//  SUB-SCHEMAS
// ─────────────────────────────────────────────

// The rendered image output (what user actually sees)
const RenderedImageSchema = new Schema({
  url          : { type: String, required: true },    // Google Drive / CDN URL
  driveId      : { type: String, required: true },    // Google Drive file ID
  driveParentId: { type: String, default: null },     // folder ID on Drive
  thumbnail    : { type: String, default: null },     // 300px thumbnail URL
  width        : { type: Number, default: 1080 },
  height       : { type: Number, default: 1080 },
  sizeBytes    : { type: Number, default: null },
  mimeType     : { type: String, default: 'image/png' },
  renderedAt   : { type: Date, default: Date.now },
}, { _id: false });

// Canvas editor state (saved so user can re-edit later)
const CanvasStateSchema = new Schema({
  templateId     : { type: Schema.Types.ObjectId, ref: 'Template', default: null },
  backgroundType : { type: String, enum: ['color', 'gradient', 'template_image', 'custom_image'], default: 'color' },
  backgroundColor: { type: String, default: '#FFFFFF' },
  backgroundImage: {
    url    : { type: String, default: null },
    driveId: { type: String, default: null },
  },
  canvasWidth    : { type: Number, default: 1080 },
  canvasHeight   : { type: Number, default: 1080 },
  fabricJson     : { type: Schema.Types.Mixed, default: null }, // raw Fabric.js JSON state
  stickersUsed   : [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
  fontsUsed      : [{ type: String }],
}, { _id: false });

// Audio-specific fields
const AudioMetaSchema = new Schema({
  fileUrl      : { type: String, default: null },        // Google Drive / CDN URL
  driveId      : { type: String, default: null },
  driveFolderId: { type: String, default: null },
  duration     : { type: Number, default: 0 },           // seconds
  sizeBytes    : { type: Number, default: null },
  mimeType     : { type: String, default: 'audio/mpeg' },
  bitrate      : { type: Number, default: null },
  coverImage   : {
    url      : { type: String, default: null },
    driveId  : { type: String, default: null },
    thumbnail: { type: String, default: null },
  },
  waveformData : { type: [Number], default: [] },        // pre-computed waveform points
  narrator     : { type: String, default: null },
  isProcessed  : { type: Boolean, default: false },      // FFmpeg processing done?
}, { _id: false });

// Engagement counts (denormalised)
const StatsSchema = new Schema({
  viewCount   : { type: Number, default: 0, min: 0 },
  likeCount   : { type: Number, default: 0, min: 0 },
  commentCount: { type: Number, default: 0, min: 0 },
  saveCount   : { type: Number, default: 0, min: 0 },
  shareCount  : { type: Number, default: 0, min: 0 },
  playCount   : { type: Number, default: 0, min: 0 },  // audio only
  repostCount : { type: Number, default: 0, min: 0 },
}, { _id: false });

// ─────────────────────────────────────────────
//  MAIN POST SCHEMA
// ─────────────────────────────────────────────

const PostSchema = new Schema({

  // ── Ownership ─────────────────────────────
  author         : {
    type    : Schema.Types.ObjectId,
    ref     : 'User',
    required: true,
    index   : true,
  },
  channel        : {
    type    : Schema.Types.ObjectId,
    ref     : 'Channel',
    required: true,
    index   : true,
  },

  // ── Type & Status ─────────────────────────
  type           : { type: String, enum: POST_TYPES, required: true, index: true },
  status         : { type: String, enum: POST_STATUS, default: 'draft', index: true },
  visibility     : { type: String, enum: VISIBILITY, default: 'public', index: true },

  // ── Content identity ──────────────────────
  title          : { type: String, trim: true, maxlength: 200, default: '' },
  slug           : { type: String, trim: true, lowercase: true, index: true },

  // ── Image output (ALL non-audio posts) ────
  renderedImage  : { type: RenderedImageSchema, default: null },
  canvasState    : { type: CanvasStateSchema, default: null },   // for re-editing

  // ── Audio (audio posts only) ──────────────
  audio          : { type: AudioMetaSchema, default: null },

  // ── Tagging & Discovery ───────────────────
  language       : { type: String, enum: LANGUAGES, default: 'hi', index: true },
  mood           : { type: [{ type: String, enum: MOODS }], default: [], index: true },
  tags           : { type: [{ type: String, trim: true, lowercase: true }], default: [], index: true },
  genre          : {
    type : String,
    enum : ['sayari', 'kavita', 'ghazal', 'nazm', 'story', 'novel', 'audiobook', 'motivation', 'comedy', 'religious', 'mixed'],
    index: true,
  },

  // ── Series / Chapter ──────────────────────
  series         : {
    type    : Schema.Types.ObjectId,
    ref     : 'Series',
    default : null,
    index   : true,
  },
  chapterNumber  : { type: Number, default: null },
  chapterTitle   : { type: String, trim: true, maxlength: 200, default: null },

  // ── Scheduling ────────────────────────────
  scheduledAt    : { type: Date, default: null, index: true },
  publishedAt    : { type: Date, default: null, index: true },

  // ── Engagement Stats ──────────────────────
  stats          : { type: StatsSchema, default: () => ({}) },

  // ── Watermark ─────────────────────────────
  watermark      : {
    enabled  : { type: Boolean, default: true },
    logoId   : { type: Schema.Types.ObjectId, ref: 'Asset', default: null },  // admin logo
    position : { type: String, enum: ['bottom_right', 'bottom_left', 'top_right', 'top_left', 'center'], default: 'bottom_right' },
    opacity  : { type: Number, default: 0.7, min: 0, max: 1 },
  },

  // ── Moderation ────────────────────────────
  isFeatured     : { type: Boolean, default: false, index: true },
  isTrending     : { type: Boolean, default: false, index: true },
  isReported     : { type: Boolean, default: false, index: true },
  reportCount    : { type: Number, default: 0, min: 0 },
  adminNote      : { type: String, default: null, select: false },
  moderatedBy    : { type: Schema.Types.ObjectId, ref: 'User', default: null },
  moderatedAt    : { type: Date, default: null },

  // ── Soft delete ───────────────────────────
  isDeleted      : { type: Boolean, default: false, index: true },
  deletedAt      : { type: Date, default: null },
  deletedBy      : { type: Schema.Types.ObjectId, ref: 'User', default: null },

}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'posts',
});

// ─────────────────────────────────────────────
//  INDEXES
// ─────────────────────────────────────────────

// Feed queries
PostSchema.index({ channel: 1, status: 1, visibility: 1, isDeleted: 1, publishedAt: -1 });
PostSchema.index({ author: 1, status: 1, isDeleted: 1, publishedAt: -1 });

// Discovery
PostSchema.index({ type: 1, language: 1, status: 1, visibility: 1, isDeleted: 1, 'stats.likeCount': -1 });
PostSchema.index({ mood: 1, status: 1, visibility: 1, isDeleted: 1 });
PostSchema.index({ tags: 1, status: 1, visibility: 1, isDeleted: 1 });
PostSchema.index({ genre: 1, language: 1, status: 1, visibility: 1, publishedAt: -1 });

// Trending
PostSchema.index({ isTrending: 1, type: 1, publishedAt: -1 });
PostSchema.index({ isFeatured: 1, publishedAt: -1 });

// Series
PostSchema.index({ series: 1, chapterNumber: 1 });

// Scheduled jobs
PostSchema.index({ status: 1, scheduledAt: 1 });

// Admin moderation
PostSchema.index({ isReported: 1, reportCount: -1 });

// Text search (on metadata - content is image)
PostSchema.index(
  { title: 'text', tags: 'text', chapterTitle: 'text' },
  { weights: { title: 10, chapterTitle: 5, tags: 3 }, name: 'post_text_idx', default_language: 'none' }
);

// ─────────────────────────────────────────────
//  VIRTUALS
// ─────────────────────────────────────────────

PostSchema.virtual('isPublished').get(function () {
  return this.status === 'published' && !this.isDeleted;
});

PostSchema.virtual('isAudio').get(function () {
  return this.type === 'audio';
});

// ─────────────────────────────────────────────
//  PRE-SAVE HOOKS
// ─────────────────────────────────────────────

PostSchema.pre('save', async function () {
  // Auto-set publishedAt when status flips to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  // Auto-generate slug from title
  if (this.isModified('title') && this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80) + '-' + this._id.toString().slice(-6);
  }
  // next(); 
});

module.exports = mongoose.model('Post', PostSchema);
module.exports.POST_TYPES  = POST_TYPES;
module.exports.POST_STATUS = POST_STATUS;
module.exports.VISIBILITY  = VISIBILITY;
module.exports.MOODS       = MOODS;
