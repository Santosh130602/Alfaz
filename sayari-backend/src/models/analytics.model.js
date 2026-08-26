'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ═════════════════════════════════════════════
//  POST ANALYTICS SCHEMA
//  Daily rollup per post — fed by Kafka consumer
// ═════════════════════════════════════════════

const PostAnalyticsSchema = new Schema({
  post           : { type: Schema.Types.ObjectId, ref: 'Post',    required: true, index: true },
  author         : { type: Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
  channel        : { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },

  // ── Time bucket (one doc per post per day) ─
  date           : { type: Date, required: true, index: true },    // midnight UTC

  // ── Counters for this day ─────────────────
  views          : { type: Number, default: 0 },
  uniqueViews    : { type: Number, default: 0 },
  likes          : { type: Number, default: 0 },
  comments       : { type: Number, default: 0 },
  saves          : { type: Number, default: 0 },
  shares         : { type: Number, default: 0 },
  plays          : { type: Number, default: 0 },   // audio
  totalPlayTime  : { type: Number, default: 0 },   // audio: seconds

  // ── Traffic sources ───────────────────────
  sources        : {
    feed    : { type: Number, default: 0 },
    search  : { type: Number, default: 0 },
    profile : { type: Number, default: 0 },
    trending: { type: Number, default: 0 },
    direct  : { type: Number, default: 0 },
    share   : { type: Number, default: 0 },
  },

  // ── Audience ──────────────────────────────
  audienceLanguages: { type: Map, of: Number, default: {} },  // { hi: 40, ur: 10 }
  audienceCountries: { type: Map, of: Number, default: {} },  // { IN: 45, PK: 5 }

}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'post_analytics',
});

PostAnalyticsSchema.index({ post: 1, date: -1 }, { unique: true });
PostAnalyticsSchema.index({ author: 1, date: -1 });
PostAnalyticsSchema.index({ channel: 1, date: -1 });


// ═════════════════════════════════════════════
//  CHANNEL ANALYTICS SCHEMA
//  Daily rollup per channel
// ═════════════════════════════════════════════

const ChannelAnalyticsSchema = new Schema({
  channel        : { type: Schema.Types.ObjectId, ref: 'Channel', required: true, index: true },
  owner          : { type: Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
  date           : { type: Date, required: true },

  newFollowers   : { type: Number, default: 0 },
  lostFollowers  : { type: Number, default: 0 },
  profileViews   : { type: Number, default: 0 },
  totalPostViews : { type: Number, default: 0 },
  totalLikes     : { type: Number, default: 0 },
  totalComments  : { type: Number, default: 0 },
  totalPlays     : { type: Number, default: 0 },
  newPosts       : { type: Number, default: 0 },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'channel_analytics',
});

ChannelAnalyticsSchema.index({ channel: 1, date: -1 }, { unique: true });
ChannelAnalyticsSchema.index({ owner: 1, date: -1 });


// ═════════════════════════════════════════════
//  PLATFORM ANALYTICS SCHEMA
//  Daily platform-wide stats for admin dashboard
// ═════════════════════════════════════════════

const PlatformAnalyticsSchema = new Schema({
  date           : { type: Date, required: true, unique: true },

  // ── Users ─────────────────────────────────
  newUsers       : { type: Number, default: 0 },
  activeUsers    : { type: Number, default: 0 },    // DAU
  totalUsers     : { type: Number, default: 0 },

  // ── Content ───────────────────────────────
  newPosts       : { type: Number, default: 0 },
  newSeries      : { type: Number, default: 0 },
  totalPosts     : { type: Number, default: 0 },

  // ── Engagement ────────────────────────────
  totalViews     : { type: Number, default: 0 },
  totalLikes     : { type: Number, default: 0 },
  totalComments  : { type: Number, default: 0 },
  totalAudioPlays: { type: Number, default: 0 },

  // ── Content type breakdown ────────────────
  postsByType    : { type: Map, of: Number, default: {} },  // { sayari: 100, audio: 40 }

  // ── Top performers ────────────────────────
  topPosts       : [{ postId: Schema.Types.ObjectId, views: Number }],
  topChannels    : [{ channelId: Schema.Types.ObjectId, newFollowers: Number }],

}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'platform_analytics',
});

PlatformAnalyticsSchema.index({ date: -1 });


// ═════════════════════════════════════════════
//  TRENDING SCORE SCHEMA
//  Recalculated every hour by Kafka consumer
//  Algorithm: (likes×3 + saves×2 + comments×2 + shares×4 + views) / age_hours^1.5
// ═════════════════════════════════════════════

const TrendingSchema = new Schema({
  targetType     : { type: String, enum: ['post', 'series', 'channel'], required: true, index: true },
  target         : { type: Schema.Types.ObjectId, required: true, index: true },
  score          : { type: Number, required: true, index: true },
  period         : { type: String, enum: ['hourly', 'daily', 'weekly'], required: true, index: true },
  genre          : { type: String, default: null, index: true },
  language       : { type: String, default: null, index: true },
  type           : { type: String, default: null },  // post type for filtering
  computedAt     : { type: Date, default: Date.now, index: true },
  // TTL: auto-expire old trending scores after 8 days
  expiresAt      : {
    type   : Date,
    default: () => new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    index  : { expireAfterSeconds: 0 },
  },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'trending',
});

TrendingSchema.index({ targetType: 1, period: 1, language: 1, score: -1 });
TrendingSchema.index({ targetType: 1, period: 1, genre: 1, score: -1 });
TrendingSchema.index({ target: 1, targetType: 1, period: 1 }, { unique: true });

module.exports = {
  PostAnalytics    : mongoose.model('PostAnalytics',     PostAnalyticsSchema),
  ChannelAnalytics : mongoose.model('ChannelAnalytics',  ChannelAnalyticsSchema),
  PlatformAnalytics: mongoose.model('PlatformAnalytics', PlatformAnalyticsSchema),
  Trending         : mongoose.model('Trending',          TrendingSchema),
};
