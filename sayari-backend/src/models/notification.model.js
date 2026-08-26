'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─────────────────────────────────────────────
//  NOTIFICATION TYPES
// ─────────────────────────────────────────────

const NOTIFICATION_TYPES = [
  'new_follower',
  'post_liked',
  'post_commented',
  'comment_replied',
  'comment_liked',
  'new_chapter',          // followed author published a chapter
  'series_completed',
  'post_saved',
  'post_featured',        // admin featured your post
  'badge_awarded',        // admin gave you a badge
  'admin_announcement',   // broadcast to all users
  'account_warning',      // admin warned the user
  'account_suspended',
  'scheduled_published',  // your scheduled post went live
  'whatsapp_otp',         // OTP via WhatsApp
  'mention',              // someone mentioned you in a comment
];

// ─────────────────────────────────────────────
//  NOTIFICATION SCHEMA
// ─────────────────────────────────────────────

const NotificationSchema = new Schema({

  // ── Recipient ─────────────────────────────
  recipient      : {
    type    : Schema.Types.ObjectId,
    ref     : 'User',
    required: true,
    index   : true,
  },

  // ── Type & Content ────────────────────────
  type           : {
    type    : String,
    enum    : NOTIFICATION_TYPES,
    required: true,
    index   : true,
  },
  title          : { type: String, required: true, maxlength: 150 },
  body           : { type: String, required: true, maxlength: 500 },

  // ── Actor (who triggered it) ──────────────
  actor          : { type: Schema.Types.ObjectId, ref: 'User', default: null },

  // ── Related entities ──────────────────────
  meta           : {
    postId     : { type: Schema.Types.ObjectId, ref: 'Post',    default: null },
    seriesId   : { type: Schema.Types.ObjectId, ref: 'Series',  default: null },
    commentId  : { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    channelId  : { type: Schema.Types.ObjectId, ref: 'Channel', default: null },
    badgeType  : { type: String, default: null },
    deepLink   : { type: String, default: null },   // app deep link URL
    imageUrl   : { type: String, default: null },   // thumbnail shown in notification
  },

  // ── Delivery channels ─────────────────────
  channels       : {
    inApp     : {
      sent  : { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
    },
    push      : {
      sent    : { type: Boolean, default: false },
      sentAt  : { type: Date, default: null },
      platform: { type: String, enum: ['ios', 'android', 'web', null], default: null },
    },
    whatsapp  : {
      sent         : { type: Boolean, default: false },
      sentAt       : { type: Date, default: null },
      messageId    : { type: String, default: null },   // WhatsApp API message ID
      deliveryStatus: { type: String, enum: ['pending', 'sent', 'delivered', 'read', 'failed', null], default: null },
    },
    email     : {
      sent  : { type: Boolean, default: false },
      sentAt: { type: Date, default: null },
    },
  },

  // ── Read / state ──────────────────────────
  isRead         : { type: Boolean, default: false, index: true },
  readAt         : { type: Date, default: null },
  isAdmin        : { type: Boolean, default: false },   // sent by admin (announcement)

  // ── TTL — auto-delete after 60 days ───────
  expiresAt      : {
    type   : Date,
    default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    index  : { expireAfterSeconds: 0 },
  },

}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'notifications',
});

// ─────────────────────────────────────────────
//  INDEXES
// ─────────────────────────────────────────────

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ 'channels.whatsapp.deliveryStatus': 1 });

// ─────────────────────────────────────────────
//  WHATSAPP OTP SCHEMA
//  Separate from notifications for security
// ─────────────────────────────────────────────

const WhatsAppOtpSchema = new Schema({
  phone          : { type: String, required: true, index: true },
  otp            : { type: String, required: true, select: false },
  purpose        : {
    type : String,
    enum : ['signup', 'login', 'phone_verify', 'password_reset'],
    required: true,
  },
  attempts       : { type: Number, default: 0 },
  isUsed         : { type: Boolean, default: false },
  usedAt         : { type: Date, default: null },
  ip             : { type: String, default: null, select: false },
  // Auto-delete after 10 minutes
  expiresAt      : {
    type   : Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000),
    index  : { expireAfterSeconds: 0 },
  },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'whatsapp_otps',
});

WhatsAppOtpSchema.index({ phone: 1, purpose: 1, createdAt: -1 });

// ─────────────────────────────────────────────
//  ANNOUNCEMENT SCHEMA (Admin broadcast)
// ─────────────────────────────────────────────

const AnnouncementSchema = new Schema({
  title          : { type: String, required: true, trim: true, maxlength: 200 },
  body           : { type: String, required: true, maxlength: 2000 },
  type           : { type: String, enum: ['general', 'feature', 'maintenance', 'celebration'], default: 'general' },
  targetAudience : { type: String, enum: ['all', 'creators', 'new_users', 'specific'], default: 'all' },
  targetUsers    : [{ type: Schema.Types.ObjectId, ref: 'User' }],
  image          : { url: { type: String, default: null }, driveId: { type: String, default: null } },
  isActive       : { type: Boolean, default: true },
  scheduledAt    : { type: Date, default: null },
  publishedAt    : { type: Date, default: null },
  sentCount      : { type: Number, default: 0 },
  createdBy      : { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
  collection: 'announcements',
});

module.exports = {
  Notification  : mongoose.model('Notification',   NotificationSchema),
  WhatsAppOtp   : mongoose.model('WhatsAppOtp',    WhatsAppOtpSchema),
  Announcement  : mongoose.model('Announcement',   AnnouncementSchema),
  NOTIFICATION_TYPES,
};
