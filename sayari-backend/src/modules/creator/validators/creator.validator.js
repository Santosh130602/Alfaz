'use strict';

const { body, param, query } = require('express-validator');

const LANGUAGES  = ['ur', 'hi', 'en', 'pa', 'mixed'];
const CATEGORIES = ['sayari','kavita','ghazal','nazm','story','novel','audiobook','motivation','comedy','religious','mixed'];
const SORT_POSTS = ['newest', 'popular', 'oldest'];
const SORT_SERIES= ['newest', 'popular', 'updated'];

const mongoId = (f = 'id') => param(f).isMongoId().withMessage(`Invalid ${f}`);
const page    = query('page').optional().isInt({ min: 1 }).toInt();
const limit   = query('limit').optional().isInt({ min: 1, max: 50 }).toInt();

module.exports = {

  // GET /channels/:handle  — public channel page
  getChannelPage: [
    param('handle')
      .trim().notEmpty().withMessage('Channel handle is required')
      .matches(/^[a-z0-9_.]+$/).withMessage('Invalid handle format'),
  ],

  // GET /channels/:handle/posts
  getChannelPosts: [
    param('handle').trim().notEmpty(),
    page, limit,
    query('type').optional().isString(),
    query('language').optional().isIn(LANGUAGES),
    query('sort').optional().isIn(SORT_POSTS),
  ],

  // GET /channels/:handle/series
  getChannelSeries: [
    param('handle').trim().notEmpty(),
    page, limit,
    query('type').optional().isString(),
    query('sort').optional().isIn(SORT_SERIES),
  ],

  // PATCH /channels/me  — update own channel
  updateChannel: [
    body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 chars'),
    body('handle')
      .optional().trim().toLowerCase()
      .isLength({ min: 3, max: 40 }).withMessage('Handle must be 3–40 chars')
      .matches(/^[a-z0-9_.]+$/).withMessage('Handle can only contain lowercase letters, numbers, _ and .'),
    body('tagline').optional().trim().isLength({ max: 160 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('languages').optional().isArray().custom(arr => arr.every(l => LANGUAGES.includes(l))).withMessage('Invalid language'),
    body('category.primary').optional().isIn(CATEGORIES),
    body('category.secondary').optional().isArray(),
    body('theme.accentColor').optional().matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).withMessage('Invalid hex colour'),
  ],

  // POST /channels/me/featured  — set featured post
  setFeaturedPost: [
    body('postId').optional({ nullable: true }).isMongoId().withMessage('Invalid post ID'),
  ],

  // GET /users/:username  — public profile
  getUserProfile: [
    param('username')
      .trim().notEmpty()
      .matches(/^[a-z0-9_.]+$/).withMessage('Invalid username format'),
  ],

  // PATCH /users/me  — update own profile
  updateUserProfile: [
    body('username')
      .optional().trim().toLowerCase()
      .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 chars')
      .matches(/^[a-z0-9_.]+$/).withMessage('Invalid username format'),
    body('displayName').optional().trim().isLength({ min: 2, max: 60 }),
    body('bio').optional().trim().isLength({ max: 300 }),
    body('language').optional().isIn(LANGUAGES),
    body('socialLinks.instagram').optional().trim().isURL({ require_protocol: false }),
    body('socialLinks.youtube').optional().trim().isURL({ require_protocol: false }),
    body('socialLinks.twitter').optional().trim().isURL({ require_protocol: false }),
    body('socialLinks.website').optional().trim().isURL({ require_protocol: false }),
  ],

  // GET /channels/:channelId/similar
  getSimilarChannels: [
    mongoId('channelId'),
    query('limit').optional().isInt({ min: 1, max: 20 }).toInt(),
  ],
};
