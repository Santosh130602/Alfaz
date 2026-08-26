'use strict';

const { validationResult } = require('express-validator');
const svc = require('../services/notification.service');
const { catchAsync, sendSuccess, Errors } = require('../../../utils/appError');

const v = (req) => {
  const e = validationResult(req);
  if (!e.isEmpty()) throw Errors.badRequest(e.array().map(x => x.msg).join(', '), 'VALIDATION_ERROR');
};

// ── Notification inbox ────────────────────────

exports.getNotifications = catchAsync(async (req, res) => {
  v(req);
  const result = await svc.getMyNotifications(req.user.sub, req.query);
  sendSuccess(res, result);
});

exports.getUnreadCount = catchAsync(async (req, res) => {
  const result = await svc.getUnreadCount(req.user.sub);
  sendSuccess(res, result);
});

exports.markAsRead = catchAsync(async (req, res) => {
  v(req);
  const result = await svc.markAsRead(req.user.sub, req.params.id);
  sendSuccess(res, result, 200, 'Marked as read');
});

exports.markAllAsRead = catchAsync(async (req, res) => {
  const result = await svc.markAllAsRead(req.user.sub);
  sendSuccess(res, result, 200, 'All notifications marked as read');
});

exports.deleteNotification = catchAsync(async (req, res) => {
  v(req);
  await svc.deleteNotification(req.user.sub, req.params.id);
  sendSuccess(res, {}, 200, 'Notification deleted');
});

// ── Device token management ───────────────────

exports.registerToken = catchAsync(async (req, res) => {
  v(req);
  const result = await svc.updateDeviceToken(req.user.sub, req.body.token, req.body.platform);
  sendSuccess(res, result, 200, 'Device token registered');
});

exports.removeToken = catchAsync(async (req, res) => {
  v(req);
  const result = await svc.removeDeviceToken(req.user.sub, req.body.token);
  sendSuccess(res, result, 200, 'Device token removed');
});

// ── Notification preferences ──────────────────

exports.getPrefs = catchAsync(async (req, res) => {
  const { User } = require('../../../models');
  const user = await User.findById(req.user.sub).select('notificationPrefs');
  if (!user) throw Errors.notFound('User not found', 'USER_NOT_FOUND');
  sendSuccess(res, { prefs: user.notificationPrefs });
});

exports.updatePrefs = catchAsync(async (req, res) => {
  v(req);
  const result = await svc.updateNotifPrefs(req.user.sub, req.body);
  sendSuccess(res, result, 200, 'Preferences updated');
});
