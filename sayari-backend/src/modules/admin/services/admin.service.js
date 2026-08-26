'use strict';

const { User, Post, Channel, Series, Report, Announcement, AdminAction, Template, Asset, PlatformAnalytics, Trending } = require('../../../models');
const { queueBroadcast }    = require('../../../jobs/notification.queue');
const { notifyBadgeAwarded, notifyAccountWarning } = require('../../notification/services/notification.service');
const { deleteFile }        = require('../../../config/drive');
const { setCache, getCache, delCache } = require('../../../config/redis');
const { Errors }            = require('../../../utils/appError');

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function paginate(q) {
  const page  = Math.max(1, parseInt(q.page  || 1));
  const limit = Math.min(100, Math.max(1, parseInt(q.limit || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

async function logAction(adminId, actionType, targetType, targetId, reason = '', before = null, after = null, ip = null) {
  await AdminAction.create({ admin: adminId, actionType, targetType, targetId, reason, before, after, ip });
}

// ─────────────────────────────────────────────
//  USER MANAGEMENT
// ─────────────────────────────────────────────

async function listUsers(query, adminId) {
  const { page, limit, skip } = paginate(query);
  const { search, role, status, isVerified, sort = 'newest' } = query;

  const filter = { isDeleted: false };
  if (role)       filter.role          = role;
  if (status)     filter.accountStatus = status;
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
  if (search) {
    filter.$or = [
      { username   : new RegExp(search, 'i') },
      { displayName: new RegExp(search, 'i') },
      { email      : new RegExp(search, 'i') },
    ];
  }

  const sortMap = {
    newest   : { createdAt: -1 },
    oldest   : { createdAt:  1 },
    followers: { 'stats.followersCount': -1 },
    posts    : { 'stats.postsCount': -1 },
  };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash -emailVerifyToken -passwordResetToken -passwordResetExpiry')
      .populate('channel', 'handle name logo stats')
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getUserDetail(userId) {
  const user = await User.findOne({ _id: userId, isDeleted: false })
    .select('-passwordHash -emailVerifyToken -passwordResetToken')
    .populate('channel', 'handle name logo stats category')
    .lean();
  if (!user) throw Errors.notFound('User not found', 'USER_NOT_FOUND');

  const [postCount, reportCount, recentActions] = await Promise.all([
    Post.countDocuments({ author: userId, isDeleted: false }),
    Report.countDocuments({ reporter: userId }),
    AdminAction.find({ targetId: userId }).sort({ createdAt: -1 }).limit(10).populate('admin', 'username').lean(),
  ]);

  return { user, postCount, reportCount, recentActions };
}

async function editUserProfile(adminId, targetUserId, updates, ip) {
  const user = await User.findOne({ _id: targetUserId, isDeleted: false });
  if (!user) throw Errors.notFound('User not found', 'USER_NOT_FOUND');

  const allowed = ['displayName','bio','language','isVerified','role'];
  const before  = {};
  const after   = {};

  allowed.forEach(k => {
    if (updates[k] !== undefined) {
      before[k] = user[k];
      user[k]   = updates[k];
      after[k]  = updates[k];
    }
  });

  await user.save({ validateBeforeSave: false });

  // Sync channel verification
  if (updates.isVerified !== undefined) {
    await Channel.findOneAndUpdate({ owner: targetUserId }, { isVerified: updates.isVerified, verifiedBy: adminId, verifiedAt: new Date() });
  }

  await logAction(adminId, 'edit_user_profile', 'user', targetUserId, updates.reason || '', before, after, ip);
  return user;
}

async function banUser(adminId, targetUserId, reason, expiresAt = null, ip) {
  const user = await User.findOne({ _id: targetUserId, isDeleted: false });
  if (!user) throw Errors.notFound('User not found', 'USER_NOT_FOUND');
  if (['admin','superadmin'].includes(user.role)) throw Errors.forbidden('Cannot ban an admin', 'CANNOT_BAN_ADMIN');

  const before = { accountStatus: user.accountStatus };
  user.accountStatus     = 'banned';
  user.banInfo.reason    = reason;
  user.banInfo.bannedAt  = new Date();
  user.banInfo.bannedBy  = adminId;
  user.banInfo.banExpiresAt = expiresAt ? new Date(expiresAt) : null;
  await user.save({ validateBeforeSave: false });

  await notifyAccountWarning(targetUserId, `Aapka account ban kar diya gaya hai. Reason: ${reason}`);
  await logAction(adminId, 'ban_user', 'user', targetUserId, reason, before, { accountStatus: 'banned', expiresAt }, ip);
  return { banned: true };
}

async function unbanUser(adminId, targetUserId, ip) {
  const user = await User.findOne({ _id: targetUserId });
  if (!user) throw Errors.notFound('User not found', 'USER_NOT_FOUND');

  user.accountStatus       = 'active';
  user.banInfo.reason      = null;
  user.banInfo.bannedAt    = null;
  user.banInfo.bannedBy    = null;
  user.banInfo.banExpiresAt = null;
  await user.save({ validateBeforeSave: false });

  await logAction(adminId, 'unban_user', 'user', targetUserId, '', {}, { accountStatus: 'active' }, ip);
  return { unbanned: true };
}

async function deleteUser(adminId, targetUserId, reason, ip) {
  const user = await User.findOne({ _id: targetUserId, isDeleted: false });
  if (!user) throw Errors.notFound('User not found', 'USER_NOT_FOUND');
  if (['admin','superadmin'].includes(user.role)) throw Errors.forbidden('Cannot delete an admin', 'CANNOT_DELETE_ADMIN');

  user.isDeleted     = true;
  user.deletedAt     = new Date();
  user.accountStatus = 'banned';
  await user.save({ validateBeforeSave: false });

  await logAction(adminId, 'delete_user', 'user', targetUserId, reason, {}, {}, ip);
  return { deleted: true };
}

async function assignBadge(adminId, targetUserId, badgeType, ip) {
  const user = await User.findOne({ _id: targetUserId, isDeleted: false });
  if (!user) throw Errors.notFound('User not found', 'USER_NOT_FOUND');

  const alreadyHas = user.badges.some(b => b.type === badgeType);
  if (alreadyHas) throw Errors.conflict('User already has this badge', 'BADGE_EXISTS');

  user.badges.push({ type: badgeType, awardedAt: new Date(), awardedBy: adminId });
  if (badgeType === 'verified') user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  await notifyBadgeAwarded(targetUserId, badgeType);
  await logAction(adminId, 'assign_badge', 'user', targetUserId, badgeType, {}, { badge: badgeType }, ip);
  return { assigned: true, badge: badgeType };
}

// ─────────────────────────────────────────────
//  POST MANAGEMENT
// ─────────────────────────────────────────────

async function listAllPosts(query) {
  const { page, limit, skip } = paginate(query);
  const { search, type, status, visibility, isReported, sort = 'newest' } = query;

  const filter = { isDeleted: false };
  if (type)       filter.type       = type;
  if (status)     filter.status     = status;
  if (visibility) filter.visibility = visibility;
  if (isReported === 'true') filter.isReported = true;
  if (search) filter.$text = { $search: search };

  const sortMap = {
    newest  : { createdAt:          -1 },
    reported: { reportCount:        -1 },
    popular : { 'stats.likeCount':  -1 },
  };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .select('-canvasState.fabricJson')
      .populate('author',  'username displayName avatar accountStatus')
      .populate('channel', 'handle name')
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ]);

  return { posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function adminDeletePost(adminId, postId, reason, ip) {
  const post = await Post.findOne({ _id: postId, isDeleted: false });
  if (!post) throw Errors.notFound('Post not found', 'POST_NOT_FOUND');

  const before = { status: post.status, visibility: post.visibility };
  post.isDeleted = true;
  post.deletedAt = new Date();
  post.deletedBy = adminId;
  post.adminNote = `Deleted by admin: ${reason}`;
  await post.save();

  await Channel.findByIdAndUpdate(post.channel, { $inc: { 'stats.postsCount': -1 } });
  await logAction(adminId, 'delete_post', 'post', postId, reason, before, {}, ip);
  return { deleted: true };
}

async function featurePost(adminId, postId, featured, ip) {
  const post = await Post.findOne({ _id: postId, isDeleted: false });
  if (!post) throw Errors.notFound('Post not found', 'POST_NOT_FOUND');

  post.isFeatured = featured;
  await post.save();

  await delCache(`post:${postId}`);
  await logAction(adminId, 'feature_post', 'post', postId, '', {}, { isFeatured: featured }, ip);
  return { featured };
}

// ─────────────────────────────────────────────
//  REPORT MANAGEMENT
// ─────────────────────────────────────────────

async function listReports(query) {
  const { page, limit, skip } = paginate(query);
  const { status = 'pending', targetType } = query;

  const filter = {};
  if (status)     filter.status     = status;
  if (targetType) filter.targetType = targetType;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reporter', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit).lean(),
    Report.countDocuments(filter),
  ]);

  return { reports, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function reviewReport(adminId, reportId, action, note, ip) {
  const report = await Report.findById(reportId);
  if (!report) throw Errors.notFound('Report not found', 'REPORT_NOT_FOUND');

  report.status     = action === 'dismiss' ? 'dismissed' : 'action_taken';
  report.reviewedBy = adminId;
  report.reviewedAt = new Date();
  report.adminNote  = note || '';
  await report.save();

  await logAction(adminId, 'review_report', 'report', reportId, note || action, {}, { status: report.status }, ip);
  return { reviewed: true, status: report.status };
}

// ─────────────────────────────────────────────
//  ANNOUNCEMENTS
// ─────────────────────────────────────────────

async function createAnnouncement(adminId, body, ip) {
  const { title, body: content, type = 'general', targetAudience = 'all', scheduledAt, targetUsers } = body;

  if (!title || !content) throw Errors.badRequest('Title and body required', 'MISSING_FIELDS');

  const announcement = await Announcement.create({
    title, body: content, type, targetAudience,
    targetUsers : targetUsers || [],
    scheduledAt : scheduledAt ? new Date(scheduledAt) : null,
    isActive    : true,
    createdBy   : adminId,
  });

  // If not scheduled, send immediately
  if (!scheduledAt) {
    await _dispatchAnnouncement(adminId, announcement);
  }

  await logAction(adminId, 'send_announcement', 'platform', announcement._id, title, {}, {}, ip);
  return announcement;
}

async function _dispatchAnnouncement(adminId, announcement) {
  let recipientIds;

  if (announcement.targetAudience === 'specific') {
    recipientIds = announcement.targetUsers;
  } else {
    const filter = { isDeleted: false, accountStatus: 'active' };
    if (announcement.targetAudience === 'creators') filter.role = { $in: ['creator','admin'] };
    const users  = await User.find(filter).select('_id').lean();
    recipientIds = users.map(u => u._id);
  }

  if (!recipientIds.length) return;

  announcement.publishedAt = new Date();
  await announcement.save();

  await queueBroadcast(announcement._id.toString(), recipientIds.map(String));
}

async function listAnnouncements(query) {
  const { page, limit, skip } = paginate(query);
  const [announcements, total] = await Promise.all([
    Announcement.find()
      .populate('createdBy', 'username displayName')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit).lean(),
    Announcement.countDocuments(),
  ]);
  return { announcements, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

// ─────────────────────────────────────────────
//  PLATFORM ANALYTICS (Admin dashboard)
// ─────────────────────────────────────────────

async function getPlatformStats(query) {
  const { period = '7d' } = query;
  const cacheKey = `admin:stats:${period}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const days = { '7d': 7, '30d': 30, '90d': 90 }[period] || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalUsers, newUsers, totalPosts, newPosts,
    totalSeries, bannedUsers, reportsPending,
    topPosts, topChannels, dailyStats,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    User.countDocuments({ isDeleted: false, createdAt: { $gte: since } }),
    Post.countDocuments({ isDeleted: false, status: 'published' }),
    Post.countDocuments({ isDeleted: false, createdAt: { $gte: since } }),
    Series.countDocuments({ isDeleted: false, status: 'published' }),
    User.countDocuments({ accountStatus: { $in: ['banned','suspended'] } }),
    Report.countDocuments({ status: 'pending' }),

    // Top posts by engagement this period
    Post.find({ isDeleted: false, publishedAt: { $gte: since }, visibility: 'public' })
      .select('title type stats publishedAt')
      .populate('author', 'username displayName avatar')
      .sort({ 'stats.likeCount': -1 }).limit(10).lean(),

    // Top channels by follower growth this period
    Channel.find({ isActive: true, isDeleted: false })
      .select('handle name logo stats isVerified')
      .populate('owner', 'username displayName')
      .sort({ 'stats.followersCount': -1 }).limit(10).lean(),

    // Daily registrations for chart
    User.aggregate([
      { $match: { createdAt: { $gte: since }, isDeleted: false } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Post type breakdown
  const postTypeBreakdown = await Post.aggregate([
    { $match: { isDeleted: false, status: 'published' } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  const result = {
    overview: { totalUsers, newUsers, totalPosts, newPosts, totalSeries, bannedUsers, reportsPending },
    topPosts,
    topChannels,
    dailyRegistrations: dailyStats,
    postTypeBreakdown : postTypeBreakdown.reduce((a, b) => { a[b._id] = b.count; return a; }, {}),
    period,
  };

  await setCache(cacheKey, result, 300); // 5 min cache
  return result;
}

async function getAdminAuditLog(query) {
  const { page, limit, skip } = paginate(query);
  const { adminId, actionType, targetType } = query;

  const filter = {};
  if (adminId)    filter.admin      = adminId;
  if (actionType) filter.actionType = actionType;
  if (targetType) filter.targetType = targetType;

  const [actions, total] = await Promise.all([
    AdminAction.find(filter)
      .populate('admin', 'username displayName avatar role')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit).lean(),
    AdminAction.countDocuments(filter),
  ]);

  return { actions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

module.exports = {
  // Users
  listUsers, getUserDetail, editUserProfile, banUser, unbanUser, deleteUser, assignBadge,
  // Posts
  listAllPosts, adminDeletePost, featurePost,
  // Reports
  listReports, reviewReport,
  // Announcements
  createAnnouncement, listAnnouncements,
  // Analytics
  getPlatformStats, getAdminAuditLog,
};
