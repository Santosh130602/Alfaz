'use strict';

const badgesService = require('../services/badges.service');
const { AppConfig }  = require('../../../models');
const { getCache, delCache } = require('../../../config/redis');
const { catchAsync, sendSuccess, Errors } = require('../../../utils/appError');

// ── Badges ────────────────────────────────────

exports.getBadgeProgress = catchAsync(async (req, res) => {
  const result = await badgesService.getUserBadgeProgress(req.user.sub);
  if (!result) throw Errors.notFound('User not found', 'USER_NOT_FOUND');
  sendSuccess(res, result);
});

exports.getBadgeLeaderboard = catchAsync(async (req, res) => {
  const { badgeType } = req.params;
  const VALID = ['rising_star', 'top_creator', 'voice_artist', 'author', 'verified', 'admin_pick'];
  if (!VALID.includes(badgeType)) throw Errors.badRequest('Invalid badge type', 'INVALID_BADGE');
  const result = await badgesService.getBadgeLeaderboard(badgeType, req.query.limit);
  sendSuccess(res, result);
});

// ── App Config (public) ───────────────────────

exports.getPublicConfig = catchAsync(async (req, res) => {
  const cacheKey = 'appconfig:public:all';
  const cached   = await getCache(cacheKey);
  if (cached) return sendSuccess(res, { config: cached });
  const configs = await AppConfig.find({ isPublic: true }).select('key value').lean();
  const map     = configs.reduce((a, c) => { a[c.key] = c.value; return a; }, {});
  sendSuccess(res, { config: map });
});

exports.getAllConfig = catchAsync(async (req, res) => {
  const configs = await AppConfig.find().lean();
  sendSuccess(res, { configs });
});

exports.updateConfig = catchAsync(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  if (value === undefined) throw Errors.badRequest('value is required', 'VALUE_REQUIRED');
  const config = await AppConfig.findOneAndUpdate(
    { key },
    { $set: { value, updatedBy: req.user.sub } },
    { new: true, upsert: false }
  );
  if (!config) throw Errors.notFound(`Config '${key}' not found`, 'CONFIG_NOT_FOUND');
  await delCache(`appconfig:${key}`);
  await delCache('appconfig:public:all');
  sendSuccess(res, { config }, 200, 'Config updated');
});
