'use strict';

const { validationResult } = require('express-validator');
const svc = require('../services/engagement.service');
const { catchAsync, sendSuccess, Errors } = require('../../../utils/appError');

const v = (req) => {
  const e = validationResult(req);
  if (!e.isEmpty()) throw Errors.badRequest(e.array().map(x => x.msg).join(', '), 'VALIDATION_ERROR');
};

// ── Likes ─────────────────────────────────────
exports.toggleLike = catchAsync(async (req, res) => {
  v(req);
  const r = await svc.toggleLike(req.user.sub, req.body.targetType, req.params.targetId, req.body.reactionType);
  sendSuccess(res, r, 200, r.liked ? 'Liked' : 'Unliked');
});

exports.getLikes = catchAsync(async (req, res) => {
  const { targetId, targetType } = req.params;
  const r = await svc.getLikes(targetId, targetType, req.user?.sub);
  sendSuccess(res, r);
});

// ── Comments ──────────────────────────────────
exports.addComment = catchAsync(async (req, res) => {
  v(req);
  const comment = await svc.addComment(req.user.sub, req.params.postId, req.body.content, req.body.parentCommentId);
  sendSuccess(res, { comment }, 201, 'Comment added');
});

exports.getComments = catchAsync(async (req, res) => {
  v(req);
  const r = await svc.getComments(req.params.postId, req.query, req.user?.sub);
  sendSuccess(res, r);
});

exports.deleteComment = catchAsync(async (req, res) => {
  v(req);
  await svc.deleteComment(req.params.commentId, req.user.sub, req.user.role);
  sendSuccess(res, {}, 200, 'Comment deleted');
});

// ── Saves ─────────────────────────────────────
exports.toggleSave = catchAsync(async (req, res) => {
  v(req);
  const r = await svc.toggleSave(req.user.sub, req.body.targetType, req.params.targetId, req.body.collection);
  sendSuccess(res, r, 200, r.saved ? 'Saved' : 'Unsaved');
});

exports.getSaved = catchAsync(async (req, res) => {
  const r = await svc.getSavedPosts(req.user.sub, req.query);
  sendSuccess(res, r);
});

// ── Follows ───────────────────────────────────
exports.toggleFollow = catchAsync(async (req, res) => {
  v(req);
  const r = await svc.toggleFollow(req.user.sub, req.params.userId);
  sendSuccess(res, r, 200, r.following ? 'Following' : 'Unfollowed');
});

exports.getFollowers = catchAsync(async (req, res) => {
  v(req);
  const r = await svc.getFollowers(req.params.userId, req.query);
  sendSuccess(res, r);
});

exports.getFollowing = catchAsync(async (req, res) => {
  const r = await svc.getFollowing(req.params.userId, req.query);
  sendSuccess(res, r);
});

exports.getFollowStatus = catchAsync(async (req, res) => {
  const r = await svc.getFollowStatus(req.user?.sub, req.params.userId);
  sendSuccess(res, r);
});

// ── Views ─────────────────────────────────────
exports.recordView = catchAsync(async (req, res) => {
  v(req);
  const r = await svc.recordView(
    req.params.targetId, req.body.targetType,
    req.user?.sub, req.body.guestId, req.body.source, req.body.audioProgress,
  );
  sendSuccess(res, r, 200);
});

// ── Reports ───────────────────────────────────
exports.report = catchAsync(async (req, res) => {
  v(req);
  const r = await svc.reportContent(req.user.sub, req.body.targetType, req.params.targetId, req.body.reason, req.body.description);
  sendSuccess(res, r, 201, 'Report submitted');
});
