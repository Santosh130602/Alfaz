'use strict';

const router = require('express').Router();

// ── Middleware ────────────────────────────────
const { protect, optionalAuth, restrictTo }  = require('../middlewares/auth.middleware');
const { authLimiter, uploadLimiter, viewLimiter } = require('../middlewares/security.middleware');
const { maintenanceMode, appVersionGate, registrationGate } = require('../middlewares/system.middleware');
const { imageUpload, audioUpload, assetUpload } = require('../config/multer');

// ── Controllers ───────────────────────────────
const authCtrl      = require('../modules/auth/controllers/auth.controller');
const authVal       = require('../modules/auth/validators/auth.validator');
const postCtrl      = require('../modules/post/controllers/post.controller');
const postVal       = require('../modules/post/validators/post.validator');
const seriesCtrl    = require('../modules/post/controllers/series.controller');
const templateCtrl  = require('../modules/template/controllers/template.controller');
const engCtrl       = require('../modules/engagement/controllers/engagement.controller');
const engVal        = require('../modules/engagement/validators/engagement.validator');
const feedCtrl      = require('../modules/feed/controllers/feed.controller');
const srchCtrl      = require('../modules/search/controllers/search.controller');
const notifCtrl     = require('../modules/notification/controllers/notification.controller');
const notifVal      = require('../modules/notification/validators/notification.validator');
const adminCtrl     = require('../modules/admin/controllers/admin.controller');
const adminVal      = require('../modules/admin/validators/admin.validator');
const analyticsCtrl = require('../modules/analytics/controllers/analytics.controller');
const analyticsVal  = require('../modules/analytics/validators/analytics.validator');
const creatorCtrl   = require('../modules/creator/controllers/creator.controller');
const creatorVal    = require('../modules/creator/validators/creator.validator');
const waWebhook     = require('../modules/webhook/controllers/whatsapp.webhook');
const driveWebhook  = require('../modules/webhook/controllers/drive.webhook');
const systemCtrl    = require('../modules/system/controllers/system.controller');

const isAdmin = [protect, restrictTo('admin', 'superadmin')];
const isMod   = [protect, restrictTo('admin', 'superadmin', 'moderator')];

// ═════════════════════════════════════════════
//  PHASE 1 — AUTH
// ═════════════════════════════════════════════

router.post('/auth/register',                 authLimiter, registrationGate, authVal.registerEmail,          authCtrl.registerEmail);
router.post('/auth/login',                    authLimiter, authVal.loginEmail,             authCtrl.loginEmail);
router.post('/auth/whatsapp/send-otp',        authLimiter, authVal.sendOtp,                authCtrl.sendOtp);
router.post('/auth/whatsapp/verify-otp',      authLimiter, authVal.verifyOtp,              authCtrl.verifyOtp);
router.post('/auth/whatsapp/complete-signup', authLimiter, registrationGate, authVal.completeWhatsappSignup, authCtrl.completeWhatsappSignup);
router.post('/auth/google',                   authLimiter, authVal.googleAuth,             authCtrl.googleAuth);
router.post('/auth/apple',                    authLimiter, authVal.appleAuth,              authCtrl.appleAuth);
router.post('/auth/refresh',                             authVal.refreshToken,            authCtrl.refreshToken);
router.post('/auth/forgot-password',          authLimiter, authVal.forgotPassword,         authCtrl.forgotPassword);
router.post('/auth/reset-password',                      authVal.resetPassword,           authCtrl.resetPassword);
router.post('/auth/logout',                   protect,     authVal.logout,                 authCtrl.logout);
router.put ('/auth/change-password',          protect,     authVal.changePassword,         authCtrl.changePassword);
router.get ('/auth/me',                       protect,                                     authCtrl.me);

// ═════════════════════════════════════════════
//  PHASE 2 — CONTENT
// ═════════════════════════════════════════════

router.get   ('/posts/me',                    protect,      postVal.listPosts,        postCtrl.getMyPosts);
router.post  ('/posts',                       protect,      postVal.createPost,       postCtrl.createPost);
router.get   ('/posts',                       optionalAuth, postVal.listPosts,        postCtrl.listPosts);
router.get   ('/posts/:id',                   optionalAuth,                           postCtrl.getPost);
router.patch ('/posts/:id',                   protect,      postVal.updatePost,       postCtrl.updatePost);
router.delete('/posts/:id',                   protect,      postVal.deletePost,       postCtrl.deletePost);
router.post  ('/posts/:id/publish',           protect,      postVal.publishPost,      postCtrl.publishPost);
router.patch ('/posts/:id/visibility',        protect,      postVal.updateVisibility, postCtrl.updateVisibility);
router.post  ('/posts/:id/audio',             protect, uploadLimiter, audioUpload.single('audio'), postCtrl.uploadAudio);
router.post  ('/posts/:id/cover',             protect, uploadLimiter, imageUpload.single('cover'), postCtrl.uploadCover);
router.post  ('/posts/:id/render',            protect,      postVal.triggerRender,    postCtrl.triggerRender);
router.get   ('/posts/:id/render',            protect,                                postCtrl.getRenderStatus);

router.get   ('/series',                       optionalAuth, seriesCtrl.listSeries);
router.post  ('/series',                       protect,      seriesCtrl.createSeries);
router.get   ('/series/:id',                   optionalAuth, seriesCtrl.getSeries);
router.patch ('/series/:id',                   protect,      seriesCtrl.updateSeries);
router.delete('/series/:id',                   protect,      seriesCtrl.deleteSeries);
router.post  ('/series/:id/publish',           protect,      seriesCtrl.publishSeries);
router.post  ('/series/:id/cover',             protect, uploadLimiter, imageUpload.single('cover'), seriesCtrl.uploadCover);
router.get   ('/series/:id/chapters',          optionalAuth, seriesCtrl.getChapters);
router.patch ('/series/:id/chapters/reorder',  protect,      seriesCtrl.reorderChapters);

router.get   ('/templates',      optionalAuth,                                                            templateCtrl.listTemplates);
router.post  ('/templates',      ...isAdmin, uploadLimiter, imageUpload.single('image'),                  templateCtrl.uploadTemplate);
router.patch ('/templates/:id',  ...isAdmin,                                                              templateCtrl.updateTemplate);
router.delete('/templates/:id',  ...isAdmin,                                                              templateCtrl.deleteTemplate);
router.get   ('/assets',         optionalAuth,                                                            templateCtrl.listAssets);
router.post  ('/assets',         ...isAdmin, uploadLimiter, assetUpload.single('file'),                   templateCtrl.uploadAsset);
router.delete('/assets/:id',     ...isAdmin,                                                              templateCtrl.deleteAsset);
router.post  ('/upload/avatar',  protect, uploadLimiter, imageUpload.single('avatar'),                    seriesCtrl.uploadAvatar);

// ═════════════════════════════════════════════
//  PHASE 3 — ENGAGEMENT + FEED + SEARCH
// ═════════════════════════════════════════════

router.post('/likes/:targetId',             protect,      engVal.toggleLike,  engCtrl.toggleLike);
router.get ('/likes/:targetType/:targetId', optionalAuth,                     engCtrl.getLikes);

router.post  ('/posts/:postId/comments', protect,      engVal.addComment,    engCtrl.addComment);
router.get   ('/posts/:postId/comments', optionalAuth, engVal.getComments,   engCtrl.getComments);
router.delete('/comments/:commentId',    protect,      engVal.deleteComment, engCtrl.deleteComment);

router.post('/saves/:targetId', protect, engVal.toggleSave, engCtrl.toggleSave);
router.get ('/saves',           protect,                    engCtrl.getSaved);

router.post('/users/:userId/follow',        protect,      engVal.toggleFollow, engCtrl.toggleFollow);
router.get ('/users/:userId/followers',     optionalAuth, engVal.getFollowers, engCtrl.getFollowers);
router.get ('/users/:userId/following',     optionalAuth,                      engCtrl.getFollowing);
router.get ('/users/:userId/follow-status', optionalAuth,                      engCtrl.getFollowStatus);

router.post('/views/:targetId',   optionalAuth, viewLimiter, engVal.recordView, engCtrl.recordView);
router.post('/reports/:targetId', protect,                   engVal.report,     engCtrl.report);

router.get('/feed/for-you',      protect,      feedCtrl.forYou);
router.get('/feed/trending',     optionalAuth, feedCtrl.trending);
router.get('/feed/new',          protect,      feedCtrl.newReleases);
router.get('/feed/explore',      optionalAuth, feedCtrl.explore);
router.get('/feed/top-creators', optionalAuth, feedCtrl.topCreators);
router.get('/feed/mood/:mood',   optionalAuth, feedCtrl.moodFeed);

router.get('/search',               optionalAuth, srchCtrl.globalSearch);
router.get('/search/posts',         optionalAuth, srchCtrl.searchPosts);
router.get('/search/channels',      optionalAuth, srchCtrl.searchChannels);
router.get('/search/series',        optionalAuth, srchCtrl.searchSeries);
router.get('/search/tag/:tag',      optionalAuth, srchCtrl.searchByTag);
router.get('/search/autocomplete',  optionalAuth, srchCtrl.autocomplete);
router.get('/search/trending-tags', optionalAuth, srchCtrl.trendingTags);

// ═════════════════════════════════════════════
//  PHASE 4 — NOTIFICATIONS + ADMIN
// ═════════════════════════════════════════════

router.get   ('/notifications',          protect, notifVal.getNotifications,   notifCtrl.getNotifications);
router.get   ('/notifications/unread',   protect,                              notifCtrl.getUnreadCount);
router.patch ('/notifications/read-all', protect,                              notifCtrl.markAllAsRead);
router.patch ('/notifications/:id/read', protect, notifVal.markAsRead,         notifCtrl.markAsRead);
router.delete('/notifications/:id',      protect, notifVal.deleteNotification, notifCtrl.deleteNotification);
router.post  ('/notifications/token',    protect, notifVal.registerToken,      notifCtrl.registerToken);
router.delete('/notifications/token',    protect, notifVal.removeToken,        notifCtrl.removeToken);
router.get   ('/notifications/prefs',    protect,                              notifCtrl.getPrefs);
router.patch ('/notifications/prefs',    protect, notifVal.updatePrefs,        notifCtrl.updatePrefs);

router.get   ('/admin/stats',                     ...isAdmin, adminVal.platformStats,     adminCtrl.platformStats);
router.get   ('/admin/audit-log',                 ...isAdmin, adminVal.auditLog,          adminCtrl.auditLog);
router.get   ('/admin/users',                     ...isMod,   adminVal.listUsers,         adminCtrl.listUsers);
router.get   ('/admin/users/:userId',             ...isMod,                               adminCtrl.getUserDetail);
router.patch ('/admin/users/:userId',             ...isAdmin, adminVal.editUserProfile,   adminCtrl.editUserProfile);
router.post  ('/admin/users/:userId/ban',         ...isAdmin, adminVal.banUser,           adminCtrl.banUser);
router.post  ('/admin/users/:userId/unban',       ...isAdmin,                             adminCtrl.unbanUser);
router.delete('/admin/users/:userId',             ...isAdmin, adminVal.deleteUser,        adminCtrl.deleteUser);
router.post  ('/admin/users/:userId/badge',       ...isAdmin, adminVal.assignBadge,       adminCtrl.assignBadge);
router.get   ('/admin/posts',                     ...isMod,   adminVal.listAllPosts,      adminCtrl.listAllPosts);
router.delete('/admin/posts/:postId',             ...isMod,   adminVal.adminDeletePost,   adminCtrl.adminDeletePost);
router.patch ('/admin/posts/:postId/feature',     ...isAdmin, adminVal.featurePost,       adminCtrl.featurePost);
router.get   ('/admin/reports',                   ...isMod,   adminVal.listReports,       adminCtrl.listReports);
router.patch ('/admin/reports/:reportId/review',  ...isMod,   adminVal.reviewReport,      adminCtrl.reviewReport);
router.get   ('/admin/announcements',             ...isAdmin,                             adminCtrl.listAnnouncements);
router.post  ('/admin/announcements',             ...isAdmin, adminVal.createAnnouncement,adminCtrl.createAnnouncement);

// ═════════════════════════════════════════════
//  PHASE 5 — ANALYTICS + CREATOR PROFILES
// ═════════════════════════════════════════════

router.get('/analytics/overview',      protect, analyticsVal.channelOverview,     analyticsCtrl.channelOverview);
router.get('/analytics/followers',     protect, analyticsVal.followerGrowth,      analyticsCtrl.followerGrowth);
router.get('/analytics/views',         protect, analyticsVal.viewsChart,          analyticsCtrl.viewsChart);
router.get('/analytics/top-posts',     protect, analyticsVal.topPosts,            analyticsCtrl.topPosts);
router.get('/analytics/engagement',    protect, analyticsVal.engagementBreakdown, analyticsCtrl.engagementBreakdown);
router.get('/analytics/audio',         protect, analyticsVal.audioAnalytics,      analyticsCtrl.audioAnalytics);
router.get('/analytics/series',        protect, analyticsVal.seriesAnalytics,     analyticsCtrl.seriesAnalytics);
router.get('/analytics/best-times',    protect,                                   analyticsCtrl.bestPostingTimes);
router.get('/analytics/posts/:postId', protect, analyticsVal.postAnalytics,       analyticsCtrl.postAnalytics);

router.get  ('/me',                    protect,                                creatorCtrl.getMyProfile);
router.patch('/me',                    protect, creatorVal.updateUserProfile,  creatorCtrl.updateUserProfile);
router.get  ('/channels/me',           protect,                                creatorCtrl.getMyChannel);
router.patch('/channels/me',           protect, creatorVal.updateChannel,      creatorCtrl.updateChannel);
router.post ('/channels/me/featured',  protect, creatorVal.setFeaturedPost,    creatorCtrl.setFeaturedPost);
router.get  ('/users/:username',       optionalAuth, creatorVal.getUserProfile,   creatorCtrl.getUserProfile);
router.get  ('/channels/:handle',      optionalAuth, creatorVal.getChannelPage,   creatorCtrl.getChannelPage);
router.get  ('/channels/:handle/posts',optionalAuth, creatorVal.getChannelPosts,  creatorCtrl.getChannelPosts);
router.get  ('/channels/:handle/series',optionalAuth,creatorVal.getChannelSeries, creatorCtrl.getChannelSeries);
router.get  ('/channels/:channelId/similar',optionalAuth,creatorVal.getSimilarChannels,creatorCtrl.getSimilarChannels);

// ═════════════════════════════════════════════
//  PHASE 7 — WEBHOOKS + SYSTEM CONFIG
// ═════════════════════════════════════════════

router.get ('/webhooks/whatsapp', waWebhook.verifyWebhook);
router.post('/webhooks/whatsapp', waWebhook.validateSignature, waWebhook.handleWebhook);
router.post('/webhooks/drive',    driveWebhook.handleDriveNotification);

router.get  ('/system/config',        systemCtrl.getPublicConfig);
router.get  ('/system/config/all',    ...isAdmin, systemCtrl.getAllConfig);
router.patch('/system/config/:key',   ...isAdmin, systemCtrl.updateConfig);

// ═════════════════════════════════════════════
//  PHASE 8 — BADGES
// ═════════════════════════════════════════════

router.get('/badges/progress',              protect,      systemCtrl.getBadgeProgress);
router.get('/badges/leaderboard/:badgeType',optionalAuth, systemCtrl.getBadgeLeaderboard);

module.exports = router;
