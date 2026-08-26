'use strict';

/**
 * SAYARI PLATFORM — MODEL INDEX
 * ─────────────────────────────
 * Import all models through this single entry point.
 * This ensures mongoose registers every model exactly once.
 *
 * Usage:
 *   const { User, Post, Channel } = require('./models');
 */

const User                                = require('./user.model');
const Channel                             = require('./channel.model');
const Post                                = require('./post.model');
const Series                              = require('./series.model');
const { Template, Asset }                 = require('./template.model');
const { Like, Comment, Save, Follow, View, Report } = require('./engagement.model');
const { Notification, WhatsAppOtp, Announcement }   = require('./notification.model');
const { PostAnalytics, ChannelAnalytics, PlatformAnalytics, Trending } = require('./analytics.model');
const { Session, AdminAction, AppConfig, DriveToken }                   = require('./system.model');

module.exports = {
  // ── Core ──────────────────────────────────
  User,
  Channel,

  // ── Content ───────────────────────────────
  Post,
  Series,

  // ── Creator tools ─────────────────────────
  Template,
  Asset,

  // ── Engagement ────────────────────────────
  Like,
  Comment,
  Save,
  Follow,
  View,
  Report,

  // ── Notifications ─────────────────────────
  Notification,
  WhatsAppOtp,
  Announcement,

  // ── Analytics ─────────────────────────────
  PostAnalytics,
  ChannelAnalytics,
  PlatformAnalytics,
  Trending,

  // ── System / Auth ─────────────────────────
  Session,
  AdminAction,
  AppConfig,
  DriveToken,
};
