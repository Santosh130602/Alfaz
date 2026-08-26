'use strict';

const { validationResult } = require('express-validator');
const svc = require('../services/analytics.service');
const { Channel } = require('../../../models');
const { catchAsync, sendSuccess, Errors } = require('../../../utils/appError');

const v = (req) => {
  const e = validationResult(req);
  if (!e.isEmpty()) throw Errors.badRequest(e.array().map(x => x.msg).join(', '), 'VALIDATION_ERROR');
};

// ── Resolve channelId from authenticated user ──
async function resolveChannel(userId) {
  const channel = await Channel.findOne({ owner: userId, isActive: true }).select('_id');
  if (!channel) throw Errors.notFound('Channel not found. Please create your channel first.', 'CHANNEL_NOT_FOUND');
  return channel._id;
}

// ─────────────────────────────────────────────

exports.channelOverview = catchAsync(async (req, res) => {
  v(req);
  const channelId = await resolveChannel(req.user.sub);
  const result    = await svc.getChannelOverview(channelId, req.user.sub, req.query.period);
  sendSuccess(res, result);
});

exports.followerGrowth = catchAsync(async (req, res) => {
  v(req);
  const result = await svc.getFollowerGrowth(req.user.sub, req.query.period);
  sendSuccess(res, result);
});

exports.viewsChart = catchAsync(async (req, res) => {
  v(req);
  const channelId = await resolveChannel(req.user.sub);
  const result    = await svc.getViewsChart(channelId, req.query.period);
  sendSuccess(res, result);
});

exports.topPosts = catchAsync(async (req, res) => {
  v(req);
  const channelId = await resolveChannel(req.user.sub);
  const result    = await svc.getTopPosts(channelId, req.query.period, req.query.sortBy, req.query.limit);
  sendSuccess(res, result);
});

exports.engagementBreakdown = catchAsync(async (req, res) => {
  v(req);
  const channelId = await resolveChannel(req.user.sub);
  const result    = await svc.getEngagementBreakdown(channelId, req.query.period);
  sendSuccess(res, result);
});

exports.audioAnalytics = catchAsync(async (req, res) => {
  v(req);
  const channelId = await resolveChannel(req.user.sub);
  const result    = await svc.getAudioAnalytics(channelId, req.query.period);
  sendSuccess(res, result);
});

exports.seriesAnalytics = catchAsync(async (req, res) => {
  v(req);
  const channelId = await resolveChannel(req.user.sub);
  const result    = await svc.getSeriesAnalytics(channelId, req.query.period);
  sendSuccess(res, result);
});

exports.postAnalytics = catchAsync(async (req, res) => {
  v(req);
  const result = await svc.getPostAnalytics(req.params.postId, req.user.sub, req.query.period);
  if (!result) throw Errors.notFound('Post not found or not yours', 'POST_NOT_FOUND');
  sendSuccess(res, result);
});

exports.bestPostingTimes = catchAsync(async (req, res) => {
  const result = await svc.getBestPostingTimes(req.user.sub);
  sendSuccess(res, result);
});
