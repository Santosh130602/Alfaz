'use strict';

const { validationResult } = require('express-validator');
const seriesService = require('../services/series.service');
const { uploadFile } = require('../../../config/drive');
const { User }       = require('../../../models');
const { catchAsync, sendSuccess, Errors } = require('../../../utils/appError');
const sharp = require('sharp');

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw Errors.badRequest(errors.array().map(e => e.msg).join(', '), 'VALIDATION_ERROR');
};

// ── Series ────────────────────────────────────

exports.createSeries = catchAsync(async (req, res) => {
  validate(req);
  const series = await seriesService.createSeries(req.user.sub, req.body);
  sendSuccess(res, { series }, 201, 'Series created');
});

exports.updateSeries = catchAsync(async (req, res) => {
  const series = await seriesService.updateSeries(req.params.id, req.user.sub, req.user.role, req.body);
  sendSuccess(res, { series }, 200, 'Series updated');
});

exports.uploadCover = catchAsync(async (req, res) => {
  if (!req.file) throw Errors.badRequest('Cover image is required', 'NO_FILE');
  const series = await seriesService.uploadCover(req.params.id, req.user.sub, req.user.role, req.file);
  sendSuccess(res, { series }, 200, 'Cover uploaded');
});

exports.publishSeries = catchAsync(async (req, res) => {
  const series = await seriesService.publishSeries(req.params.id, req.user.sub, req.user.role);
  sendSuccess(res, { series }, 200, 'Series published');
});

exports.deleteSeries = catchAsync(async (req, res) => {
  await seriesService.deleteSeries(req.params.id, req.user.sub, req.user.role);
  sendSuccess(res, {}, 200, 'Series deleted');
});

exports.getSeries = catchAsync(async (req, res) => {
  const series = await seriesService.getSeries(req.params.id, req.user?.sub, req.user?.role);
  sendSuccess(res, { series });
});

exports.listSeries = catchAsync(async (req, res) => {
  const result = await seriesService.listSeries(req.query, req.user?.sub, req.user?.role);
  sendSuccess(res, result);
});

exports.getChapters = catchAsync(async (req, res) => {
  const result = await seriesService.getChapters(req.params.id, req.user?.sub, req.user?.role);
  sendSuccess(res, result);
});

exports.reorderChapters = catchAsync(async (req, res) => {
  const { orderedPostIds } = req.body;
  if (!Array.isArray(orderedPostIds) || !orderedPostIds.length) {
    throw Errors.badRequest('orderedPostIds array is required', 'INVALID_ORDER');
  }
  const result = await seriesService.reorderChapters(req.params.id, req.user.sub, req.user.role, orderedPostIds);
  sendSuccess(res, result, 200, 'Chapters reordered');
});

// ── Avatar Upload ─────────────────────────────

exports.uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) throw Errors.badRequest('Image file is required', 'NO_FILE');

  // Resize to 400x400 square
  const resized = await sharp(req.file.buffer)
    .resize(400, 400, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85 })
    .toBuffer();

  const thumbBuf = await sharp(req.file.buffer)
    .resize(100, 100, { fit: 'cover' })
    .jpeg({ quality: 70 })
    .toBuffer();

  const [imgResult, thumbResult] = await Promise.all([
    uploadFile(resized,   `avatar_${req.user.sub}_${Date.now()}.jpg`, 'image/jpeg', 'avatars'),
    uploadFile(thumbBuf,  `avatar_thumb_${req.user.sub}_${Date.now()}.jpg`, 'image/jpeg', 'avatars'),
  ]);

  // Clean old avatar from Drive
  const user = await User.findById(req.user.sub).select('avatar');
  if (user?.avatar?.driveId) {
    const { addCleanupJob } = require('../../../config/queues');
    await addCleanupJob([user.avatar.driveId]);
  }

  const updated = await User.findByIdAndUpdate(
    req.user.sub,
    { avatar: { url: imgResult.url, driveId: imgResult.driveId, thumbnail: thumbResult.url } },
    { new: true }
  ).select('username displayName avatar');

  sendSuccess(res, { avatar: updated.avatar }, 200, 'Avatar updated');
});
