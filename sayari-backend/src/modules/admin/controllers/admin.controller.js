'use strict';

const { validationResult } = require('express-validator');
const adminService = require('../services/admin.service');
const { catchAsync, sendSuccess, Errors } = require('../../../utils/appError');

const v = (req) => {
  const e = validationResult(req);
  if (!e.isEmpty()) throw Errors.badRequest(e.array().map(x => x.msg).join(', '), 'VALIDATION_ERROR');
};

const ip = (req) => req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || null;

// ═══════════════════════════════════════════
//  USER MANAGEMENT
// ═══════════════════════════════════════════

exports.listUsers = catchAsync(async (req, res) => {
  v(req);
  const result = await adminService.listUsers(req.query, req.user.sub);
  sendSuccess(res, result);
});

exports.getUserDetail = catchAsync(async (req, res) => {
  const result = await adminService.getUserDetail(req.params.userId);
  sendSuccess(res, result);
});

exports.editUserProfile = catchAsync(async (req, res) => {
  v(req);
  const user = await adminService.editUserProfile(req.user.sub, req.params.userId, req.body, ip(req));
  sendSuccess(res, { user }, 200, 'User profile updated');
});

exports.banUser = catchAsync(async (req, res) => {
  v(req);
  const result = await adminService.banUser(req.user.sub, req.params.userId, req.body.reason, req.body.expiresAt, ip(req));
  sendSuccess(res, result, 200, 'User banned');
});

exports.unbanUser = catchAsync(async (req, res) => {
  const result = await adminService.unbanUser(req.user.sub, req.params.userId, ip(req));
  sendSuccess(res, result, 200, 'User unbanned');
});

exports.deleteUser = catchAsync(async (req, res) => {
  v(req);
  await adminService.deleteUser(req.user.sub, req.params.userId, req.body.reason, ip(req));
  sendSuccess(res, {}, 200, 'User deleted');
});

exports.assignBadge = catchAsync(async (req, res) => {
  v(req);
  const result = await adminService.assignBadge(req.user.sub, req.params.userId, req.body.badgeType, ip(req));
  sendSuccess(res, result, 200, 'Badge assigned');
});

// ═══════════════════════════════════════════
//  POST MANAGEMENT
// ═══════════════════════════════════════════

exports.listAllPosts = catchAsync(async (req, res) => {
  v(req);
  const result = await adminService.listAllPosts(req.query);
  sendSuccess(res, result);
});

exports.adminDeletePost = catchAsync(async (req, res) => {
  v(req);
  await adminService.adminDeletePost(req.user.sub, req.params.postId, req.body.reason, ip(req));
  sendSuccess(res, {}, 200, 'Post deleted');
});

exports.featurePost = catchAsync(async (req, res) => {
  v(req);
  const result = await adminService.featurePost(req.user.sub, req.params.postId, req.body.featured, ip(req));
  sendSuccess(res, result, 200, `Post ${result.featured ? 'featured' : 'unfeatured'}`);
});

// ═══════════════════════════════════════════
//  REPORT MANAGEMENT
// ═══════════════════════════════════════════

exports.listReports = catchAsync(async (req, res) => {
  v(req);
  const result = await adminService.listReports(req.query);
  sendSuccess(res, result);
});

exports.reviewReport = catchAsync(async (req, res) => {
  v(req);
  const result = await adminService.reviewReport(req.user.sub, req.params.reportId, req.body.action, req.body.note, ip(req));
  sendSuccess(res, result, 200, 'Report reviewed');
});

// ═══════════════════════════════════════════
//  ANNOUNCEMENTS
// ═══════════════════════════════════════════

exports.createAnnouncement = catchAsync(async (req, res) => {
  v(req);
  const announcement = await adminService.createAnnouncement(req.user.sub, req.body, ip(req));
  sendSuccess(res, { announcement }, 201, 'Announcement created and queued');
});

exports.listAnnouncements = catchAsync(async (req, res) => {
  const result = await adminService.listAnnouncements(req.query);
  sendSuccess(res, result);
});

// ═══════════════════════════════════════════
//  ANALYTICS DASHBOARD
// ═══════════════════════════════════════════

exports.platformStats = catchAsync(async (req, res) => {
  v(req);
  const result = await adminService.getPlatformStats(req.query);
  sendSuccess(res, result);
});

exports.auditLog = catchAsync(async (req, res) => {
  v(req);
  const result = await adminService.getAdminAuditLog(req.query);
  sendSuccess(res, result);
});
