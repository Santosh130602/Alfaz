'use strict';

const { User, Post, Follow, Like, Series } = require('../../../models');
const { setCache, getCache }               = require('../../../config/redis');
const { logger }                           = require('../../../config/logger');

// ─────────────────────────────────────────────
//  BADGE RULES
//  Each rule: { type, check(userId) → bool }
//  Checked after relevant events
// ─────────────────────────────────────────────

const BADGE_RULES = [
  {
    type : 'rising_star',
    label: '🌟 Rising Star',
    check: async (userId) => {
      const user = await User.findById(userId).select('stats createdAt').lean();
      if (!user) return false;
      const daysSinceJoin = (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
      return daysSinceJoin <= 30 && (user.stats?.followersCount || 0) >= 100;
    },
  },
  {
    type : 'top_creator',
    label: '🏆 Top Creator',
    check: async (userId) => {
      const user = await User.findById(userId).select('stats').lean();
      return (user?.stats?.totalLikes || 0) >= 10000;
    },
  },
  {
    type : 'voice_artist',
    label: '🎙️ Voice Artist',
    check: async (userId) => {
      const count = await Post.countDocuments({ author: userId, type: 'audio', status: 'published', isDeleted: false });
      return count >= 10;
    },
  },
  {
    type : 'author',
    label: '📚 Author',
    check: async (userId) => {
      const completed = await Series.countDocuments({ author: userId, completionStatus: 'completed', isDeleted: false });
      return completed >= 1;
    },
  },
];

// ─────────────────────────────────────────────
//  CHECK AND AWARD BADGES
//  Called after: new follower, new like, new post, series completed
// ─────────────────────────────────────────────

async function checkAndAwardBadges(userId) {
  try {
    const user = await User.findById(userId).select('badges role').lean();
    if (!user || user.role === 'admin' || user.role === 'superadmin') return;

    const existingTypes = new Set((user.badges || []).map(b => b.type));
    const toAward = [];

    for (const rule of BADGE_RULES) {
      if (existingTypes.has(rule.type)) continue; // already has it
      const earned = await rule.check(userId);
      if (earned) toAward.push({ type: rule.type, awardedAt: new Date() });
    }

    if (!toAward.length) return;

    await User.findByIdAndUpdate(userId, { $push: { badges: { $each: toAward } } });

    // Queue notification for each badge
    const { queueNotification } = require('../../../jobs/notification.queue');
    for (const badge of toAward) {
      await queueNotification(userId, {
        type  : 'badge_awarded',
        title : '🎉 Badge Mila!',
        body  : `Mubarak ho! Aapko "${badge.type.replace(/_/g,' ')}" badge mila`,
        meta  : { badgeType: badge.type, deepLink: '/profile/badges' },
      }).catch(() => {});
      logger.info(`[Badges] Awarded ${badge.type} to user ${userId}`);
    }
  } catch (err) {
    logger.error('[Badges] checkAndAwardBadges error', { userId, error: err.message });
  }
}

// ─────────────────────────────────────────────
//  GET BADGE LEADERBOARD
// ─────────────────────────────────────────────

async function getBadgeLeaderboard(badgeType, limit = 20) {
  const cacheKey = `badges:leaderboard:${badgeType}:${limit}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const users = await User.find({
    'badges.type': badgeType,
    isDeleted    : false,
    accountStatus: 'active',
  })
    .select('username displayName avatar isVerified stats badges')
    .sort({ 'stats.followersCount': -1 })
    .limit(parseInt(limit))
    .lean();

  const result = { badgeType, users };
  await setCache(cacheKey, result, 300);
  return result;
}

// ─────────────────────────────────────────────
//  GET USER BADGES + PROGRESS
// ─────────────────────────────────────────────

async function getUserBadgeProgress(userId) {
  const cacheKey = `badges:progress:${userId}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const user = await User.findById(userId).select('badges stats createdAt').lean();
  if (!user) return null;

  const existingTypes = new Set((user.badges || []).map(b => b.type));

  // Build progress for each badge rule
  const progress = await Promise.all(BADGE_RULES.map(async (rule) => {
    const earned = existingTypes.has(rule.type);
    let progressData = {};

    // Compute progress toward each badge
    switch (rule.type) {
      case 'rising_star': {
        const followers = user.stats?.followersCount || 0;
        const daysSince = (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
        progressData = { followers, target: 100, daysRemaining: Math.max(0, 30 - Math.floor(daysSince)) };
        break;
      }
      case 'top_creator': {
        const likes = user.stats?.totalLikes || 0;
        progressData = { likes, target: 10000, pct: Math.min(100, Math.floor((likes / 10000) * 100)) };
        break;
      }
      case 'voice_artist': {
        const count = await Post.countDocuments({ author: userId, type: 'audio', status: 'published', isDeleted: false });
        progressData = { audioPosts: count, target: 10, pct: Math.min(100, Math.floor((count / 10) * 100)) };
        break;
      }
      case 'author': {
        const count = await Series.countDocuments({ author: userId, completionStatus: 'completed', isDeleted: false });
        progressData = { completedSeries: count, target: 1, pct: count >= 1 ? 100 : 0 };
        break;
      }
    }

    return { type: rule.type, label: rule.label, earned, ...progressData };
  }));

  const result = { earned: user.badges || [], progress };
  await setCache(cacheKey, result, 120);
  return result;
}

module.exports = { checkAndAwardBadges, getBadgeLeaderboard, getUserBadgeProgress };
