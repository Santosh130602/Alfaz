'use strict';

const { body, param, query } = require('express-validator');

const mongoId = (f = 'id') => param(f).isMongoId().withMessage(`Invalid ${f}`);

const BADGE_TYPES    = ['verified','rising_star','top_creator','voice_artist','author','admin_pick'];
const POST_TYPES     = ['sayari','kavita','ghazal','nazm','story_chapter','book_chapter','audio','quote','shayari'];
const REPORT_ACTIONS = ['dismiss','action_taken'];

module.exports = {

  // ── User management ──────────────────────────
  listUsers: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().trim().isLength({ max: 100 }),
    query('role').optional().isIn(['user','creator','moderator','admin','superadmin']),
    query('status').optional().isIn(['active','suspended','banned','deactivated','pending_verification']),
    query('isVerified').optional().isBoolean(),
    query('sort').optional().isIn(['newest','oldest','followers','posts']),
  ],

  editUserProfile: [
    mongoId('userId'),
    body('displayName').optional().trim().isLength({ min: 2, max: 60 }),
    body('bio').optional().trim().isLength({ max: 300 }),
    body('language').optional().isIn(['ur','hi','en','mixed']),
    body('isVerified').optional().isBoolean(),
    body('role').optional().isIn(['user','creator','moderator']),
    body('reason').optional().trim().isLength({ max: 500 }),
  ],

  banUser: [
    mongoId('userId'),
    body('reason').notEmpty().withMessage('Ban reason is required').trim().isLength({ max: 500 }),
    body('expiresAt').optional().isISO8601().withMessage('Invalid expiry date')
      .custom(v => new Date(v) > new Date()).withMessage('Expiry must be in the future'),
  ],

  assignBadge: [
    mongoId('userId'),
    body('badgeType').notEmpty().isIn(BADGE_TYPES).withMessage(`Invalid badge type. Allowed: ${BADGE_TYPES.join(', ')}`),
  ],

  deleteUser: [
    mongoId('userId'),
    body('reason').notEmpty().withMessage('Deletion reason is required').trim().isLength({ max: 500 }),
  ],

  // ── Post management ───────────────────────────
  listAllPosts: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('type').optional().isIn(POST_TYPES),
    query('status').optional().isIn(['draft','published','scheduled','archived','under_review']),
    query('visibility').optional().isIn(['public','private','followers_only']),
    query('isReported').optional().isBoolean(),
    query('search').optional().trim().isLength({ max: 100 }),
    query('sort').optional().isIn(['newest','reported','popular']),
  ],

  adminDeletePost: [
    mongoId('postId'),
    body('reason').notEmpty().withMessage('Deletion reason is required').trim().isLength({ max: 500 }),
  ],

  featurePost: [
    mongoId('postId'),
    body('featured').isBoolean().withMessage('featured must be true or false'),
  ],

  // ── Reports ───────────────────────────────────
  listReports: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['pending','reviewed','action_taken','dismissed']),
    query('targetType').optional().isIn(['post','comment','user','series']),
  ],

  reviewReport: [
    mongoId('reportId'),
    body('action').notEmpty().isIn(REPORT_ACTIONS).withMessage(`action must be one of: ${REPORT_ACTIONS.join(', ')}`),
    body('note').optional().trim().isLength({ max: 500 }),
  ],

  // ── Announcements ─────────────────────────────
  createAnnouncement: [
    body('title').notEmpty().withMessage('Title is required').trim().isLength({ max: 200 }),
    body('body').notEmpty().withMessage('Body is required').trim().isLength({ max: 2000 }),
    body('type').optional().isIn(['general','feature','maintenance','celebration']),
    body('targetAudience').optional().isIn(['all','creators','new_users','specific']),
    body('targetUsers').optional().isArray(),
    body('targetUsers.*').optional().isMongoId(),
    body('scheduledAt').optional().isISO8601()
      .custom(v => new Date(v) > new Date()).withMessage('scheduledAt must be in the future'),
  ],

  // ── Analytics ─────────────────────────────────
  platformStats: [
    query('period').optional().isIn(['7d','30d','90d']).withMessage('period must be 7d, 30d, or 90d'),
  ],

  auditLog: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('adminId').optional().isMongoId(),
    query('actionType').optional().isString(),
    query('targetType').optional().isString(),
  ],
};
