'use strict';

const { validationResult } = require('express-validator');
const svc = require('../services/creator.service');
const { catchAsync, sendSuccess, Errors } = require('../../../utils/appError');

const v = (req) => {
  const e = validationResult(req);
  if (!e.isEmpty()) throw Errors.badRequest(e.array().map(x => x.msg).join(', '), 'VALIDATION_ERROR');
};

// ── Public channel page ───────────────────────

exports.getChannelPage = catchAsync(async (req, res) => {
  v(req);
  const result = await svc.getChannelPage(req.params.handle, req.user?.sub);
  sendSuccess(res, result);
});

exports.getChannelPosts = catchAsync(async (req, res) => {
  v(req);
  const result = await svc.getChannelPosts(req.params.handle, req.query, req.user?.sub, req.user?.role);
  sendSuccess(res, result);
});

exports.getChannelSeries = catchAsync(async (req, res) => {
  v(req);
  const result = await svc.getChannelSeries(req.params.handle, req.query, req.user?.sub, req.user?.role);
  sendSuccess(res, result);
});

exports.getSimilarChannels = catchAsync(async (req, res) => {
  v(req);
  const channels = await svc.getSimilarChannels(req.params.channelId, req.query.limit);
  sendSuccess(res, { channels });
});

// ── My channel management ─────────────────────

exports.updateChannel = catchAsync(async (req, res) => {
  v(req);
  const channel = await svc.updateChannel(req.user.sub, req.body);
  sendSuccess(res, { channel }, 200, 'Channel updated');
});

exports.setFeaturedPost = catchAsync(async (req, res) => {
  v(req);
  const result = await svc.setFeaturedPost(req.user.sub, req.body.postId || null);
  sendSuccess(res, result, 200, req.body.postId ? 'Featured post set' : 'Featured post removed');
});

exports.getMyChannel = catchAsync(async (req, res) => {
  const { Channel } = require('../../../models');
  const channel = await Channel.findOne({ owner: req.user.sub, isDeleted: false })
    .populate('owner', 'username displayName avatar isVerified stats')
    .populate('featuredPost', 'title type renderedImage stats');
  if (!channel) throw Errors.notFound('Channel not found', 'CHANNEL_NOT_FOUND');
  sendSuccess(res, { channel });
});

// ── Public user profile ───────────────────────

exports.getUserProfile = catchAsync(async (req, res) => {
  v(req);
  const result = await svc.getUserProfile(req.params.username, req.user?.sub);
  sendSuccess(res, result);
});

exports.updateUserProfile = catchAsync(async (req, res) => {
  v(req);
  const user = await svc.updateUserProfile(req.user.sub, req.body);
  sendSuccess(res, { user }, 200, 'Profile updated');
});

exports.getMyProfile = catchAsync(async (req, res) => {
  const { User } = require('../../../models');
  const user = await User.findById(req.user.sub)
    .select('-passwordHash -emailVerifyToken -passwordResetToken -passwordResetExpiry')
    .populate('channel', 'handle name logo stats isVerified');
  if (!user) throw Errors.notFound('User not found', 'USER_NOT_FOUND');
  sendSuccess(res, { user: user.toPublicJSON() });
});
