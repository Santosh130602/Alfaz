'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ═════════════════════════════════════════════
//  LIKE SCHEMA
//  Supports multiple reaction types (desi flavour)
// ═════════════════════════════════════════════

const LikeSchema = new Schema({
  user           : { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetType     : { type: String, enum: ['post', 'series', 'comment'], required: true, index: true },
  target         : { type: Schema.Types.ObjectId, required: true, index: true },
  reactionType   : {
    type   : String,
    enum   : ['like', 'wah_wah', 'dil', 'kya_baat', 'rula_diya', 'haha'],
    default: 'like',
  },
  // Denormalised for feed queries
  targetAuthor   : { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'likes',
});

LikeSchema.index({ user: 1, target: 1, targetType: 1 }, { unique: true });
LikeSchema.index({ target: 1, targetType: 1, reactionType: 1 });
LikeSchema.index({ targetAuthor: 1, createdAt: -1 });


// ═════════════════════════════════════════════
//  COMMENT SCHEMA
//  Supports threaded replies (1 level deep)
// ═════════════════════════════════════════════

const CommentSchema = new Schema({
  author         : { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  postId         : { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  parentComment  : { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
  content        : { type: String, required: true, trim: true, maxlength: 1000 },
  mentionedUsers : [{ type: Schema.Types.ObjectId, ref: 'User' }],

  // ── Stats ─────────────────────────────────
  likeCount      : { type: Number, default: 0, min: 0 },
  replyCount     : { type: Number, default: 0, min: 0 },

  // ── Moderation ────────────────────────────
  isReported     : { type: Boolean, default: false, index: true },
  reportCount    : { type: Number, default: 0, min: 0 },
  isHidden       : { type: Boolean, default: false },   // admin hides without deleting
  hiddenBy       : { type: Schema.Types.ObjectId, ref: 'User', default: null },

  // ── Soft delete ───────────────────────────
  isDeleted      : { type: Boolean, default: false, index: true },
  deletedAt      : { type: Date, default: null },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'comments',
});

CommentSchema.index({ postId: 1, parentComment: 1, isDeleted: 1, createdAt: -1 });
CommentSchema.index({ author: 1, isDeleted: 1 });


// ═════════════════════════════════════════════
//  SAVE (BOOKMARK) SCHEMA
// ═════════════════════════════════════════════

const SaveSchema = new Schema({
  user           : { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetType     : { type: String, enum: ['post', 'series', 'audio'], required: true },
  target         : { type: Schema.Types.ObjectId, required: true, index: true },
  collection     : { type: String, trim: true, maxlength: 100, default: 'Saved' },  // user-named folder
  targetAuthor   : { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'saves',
});

SaveSchema.index({ user: 1, target: 1, targetType: 1 }, { unique: true });
SaveSchema.index({ user: 1, collection: 1, createdAt: -1 });


// ═════════════════════════════════════════════
//  FOLLOW SCHEMA
// ═════════════════════════════════════════════

const FollowSchema = new Schema({
  follower       : { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  following      : { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // For channel follows
  channel        : { type: Schema.Types.ObjectId, ref: 'Channel', default: null, index: true },
  notifyNewPosts : { type: Boolean, default: true },   // get push on new post from this channel
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'follows',
});

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
FollowSchema.index({ following: 1, createdAt: -1 });
FollowSchema.index({ follower: 1, createdAt: -1 });


// ═════════════════════════════════════════════
//  VIEW SCHEMA
//  Tracks unique views (rate-limited per user+post)
// ═════════════════════════════════════════════

const ViewSchema = new Schema({
  viewer         : { type: Schema.Types.ObjectId, ref: 'User', default: null },  // null = guest
  guestId        : { type: String, default: null },   // fingerprint for guests
  targetType     : { type: String, enum: ['post', 'series', 'channel'], required: true },
  target         : { type: Schema.Types.ObjectId, required: true, index: true },
  targetAuthor   : { type: Schema.Types.ObjectId, ref: 'User', required: true },
  source         : { type: String, enum: ['feed', 'profile', 'search', 'trending', 'direct', 'share'], default: 'direct' },
  // For audio: how many seconds played
  audioProgress  : { type: Number, default: null },
  watchedFull    : { type: Boolean, default: false },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'views',
});

// TTL: auto-delete raw views after 90 days (keep aggregated analytics)
ViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
ViewSchema.index({ target: 1, targetType: 1, viewer: 1 });
ViewSchema.index({ targetAuthor: 1, createdAt: -1 });


// ═════════════════════════════════════════════
//  REPORT SCHEMA
// ═════════════════════════════════════════════

const ReportSchema = new Schema({
  reporter       : { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetType     : { type: String, enum: ['post', 'comment', 'user', 'series'], required: true, index: true },
  target         : { type: Schema.Types.ObjectId, required: true, index: true },
  reason         : {
    type : String,
    enum : ['spam', 'abusive', 'hate_speech', 'inappropriate', 'copyright', 'misinformation', 'other'],
    required: true,
  },
  description    : { type: String, maxlength: 500, default: '' },
  status         : {
    type   : String,
    enum   : ['pending', 'reviewed', 'action_taken', 'dismissed'],
    default: 'pending',
    index  : true,
  },
  reviewedBy     : { type: Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt     : { type: Date, default: null },
  adminNote      : { type: String, default: null },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'reports',
});

ReportSchema.index({ reporter: 1, target: 1, targetType: 1 }, { unique: true });
ReportSchema.index({ status: 1, targetType: 1, createdAt: -1 });
ReportSchema.index({ target: 1 });

module.exports = {
  Like   : mongoose.model('Like',    LikeSchema),
  Comment: mongoose.model('Comment', CommentSchema),
  Save   : mongoose.model('Save',    SaveSchema),
  Follow : mongoose.model('Follow',  FollowSchema),
  View   : mongoose.model('View',    ViewSchema),
  Report : mongoose.model('Report',  ReportSchema),
};
