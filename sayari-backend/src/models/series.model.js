'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const SeriesSchema = new Schema({

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

  // ── Identity ──────────────────────────────
  title          : { type: String, required: true, trim: true, maxlength: 200 },
  slug           : { type: String, trim: true, lowercase: true, index: true },
  description    : { type: String, maxlength: 3000, default: '' },
  type           : {
    type : String,
    enum : ['story', 'novel', 'poetry_collection', 'audiobook', 'audio_series', 'book'],
    required: true,
    index: true,
  },

  // ── Cover ─────────────────────────────────
  cover          : {
    url      : { type: String, default: null },
    driveId  : { type: String, default: null },
    thumbnail: { type: String, default: null },
  },

  // ── Metadata ──────────────────────────────
  language       : { type: String, enum: ['ur', 'hi', 'en', 'pa', 'mixed'], default: 'hi', index: true },
  genre          : {
    type : String,
    enum : ['romance', 'horror', 'comedy', 'thriller', 'drama', 'religious', 'historical', 'fantasy', 'biography', 'motivational', 'other'],
    index: true,
  },
  tags           : { type: [{ type: String, trim: true, lowercase: true }], default: [], index: true },
  mood           : { type: [String], default: [] },

  // ── Chapter management ────────────────────
  chapters       : [{
    postId        : { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    chapterNumber : { type: Number, required: true },
    title         : { type: String, trim: true, maxlength: 200 },
    publishedAt   : { type: Date, default: null },
    status        : { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft' },
    scheduledAt   : { type: Date, default: null },
  }],

  totalChapters  : { type: Number, default: 0, min: 0 },
  publishedChapters: { type: Number, default: 0, min: 0 },

  // ── Completion ────────────────────────────
  completionStatus: {
    type   : String,
    enum   : ['ongoing', 'completed', 'on_hiatus', 'dropped'],
    default: 'ongoing',
    index  : true,
  },
  completedAt    : { type: Date, default: null },
  estimatedChapters: { type: Number, default: null },

  // ── Visibility ────────────────────────────
  visibility     : {
    type   : String,
    enum   : ['public', 'private', 'followers_only'],
    default: 'public',
    index  : true,
  },
  status         : {
    type   : String,
    enum   : ['draft', 'published', 'archived'],
    default: 'draft',
    index  : true,
  },

  // ── Stats ─────────────────────────────────
  stats          : {
    viewCount      : { type: Number, default: 0, min: 0 },
    likeCount      : { type: Number, default: 0, min: 0 },
    saveCount      : { type: Number, default: 0, min: 0 },
    commentCount   : { type: Number, default: 0, min: 0 },
    totalPlayTime  : { type: Number, default: 0, min: 0 }, // audio series: seconds
  },

  // ── Moderation ────────────────────────────
  isFeatured     : { type: Boolean, default: false, index: true },
  adminNote      : { type: String, default: null, select: false },

  // ── Soft delete ───────────────────────────
  isDeleted      : { type: Boolean, default: false, index: true },
  deletedAt      : { type: Date, default: null },

}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'series',
});

// ─────────────────────────────────────────────
//  INDEXES
// ─────────────────────────────────────────────

SeriesSchema.index({ author: 1, status: 1, isDeleted: 1 });
SeriesSchema.index({ channel: 1, status: 1, visibility: 1, isDeleted: 1 });
SeriesSchema.index({ type: 1, language: 1, completionStatus: 1, status: 1, 'stats.viewCount': -1 });
SeriesSchema.index({ tags: 1, status: 1, visibility: 1 });
SeriesSchema.index({ isFeatured: 1 });

SeriesSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 10, tags: 4, description: 1 }, name: 'series_text_idx' }
);

SeriesSchema.pre('save', function (next) {
  if (this.isModified('title') && this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80) + '-' + this._id.toString().slice(-6);
  }
  next();
});

module.exports = mongoose.model('Series', SeriesSchema);
