'use strict';

const { body, query, param } = require('express-validator');
const { POST_TYPES, MOODS, VISIBILITY } = require('../../../models/post.model');

const GENRES    = ['sayari','kavita','ghazal','nazm','story','novel','audiobook','motivation','comedy','religious','mixed'];
const LANGUAGES = ['ur','hi','en','pa','mixed'];

// ─── Common field validators ──────────────────

const objectIdParam = (field = 'id') =>
  param(field).isMongoId().withMessage(`Invalid ${field}`);

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt().withMessage('limit must be 1–50'),
];

// ─────────────────────────────────────────────
module.exports = {

  // POST /posts — create new post (canvas or audio)
  createPost: [
    body('type')
      .notEmpty().withMessage('Post type is required')
      .isIn(POST_TYPES).withMessage(`Invalid post type. Allowed: ${POST_TYPES.join(', ')}`),
    body('title')
      .optional().trim().isLength({ max: 200 }).withMessage('Title max 200 chars'),
    body('language')
      .optional().isIn(LANGUAGES).withMessage('Invalid language'),
    body('mood')
      .optional().isArray().withMessage('mood must be an array')
      .custom(arr => arr.every(m => MOODS.includes(m))).withMessage('Invalid mood value'),
    body('tags')
      .optional().isArray({ max: 10 }).withMessage('Max 10 tags allowed')
      .custom(arr => arr.every(t => typeof t === 'string' && t.length <= 30)).withMessage('Each tag max 30 chars'),
    body('genre')
      .optional().isIn(GENRES).withMessage('Invalid genre'),
    body('visibility')
      .optional().isIn(VISIBILITY).withMessage('Invalid visibility'),
    body('seriesId')
      .optional().isMongoId().withMessage('Invalid series ID'),
    body('chapterNumber')
      .optional().isInt({ min: 1 }).withMessage('Chapter number must be a positive integer'),
    body('chapterTitle')
      .optional().trim().isLength({ max: 200 }),
    body('scheduledAt')
      .optional().isISO8601().withMessage('scheduledAt must be a valid ISO date')
      .custom(val => new Date(val) > new Date()).withMessage('scheduledAt must be in the future'),
    // Canvas state
    body('canvasState')
      .optional().isObject().withMessage('canvasState must be an object'),
    body('canvasState.fabricJson')
      .optional().isObject().withMessage('fabricJson must be a valid object'),
    body('canvasState.canvasWidth')
      .optional().isInt({ min: 100, max: 4000 }),
    body('canvasState.canvasHeight')
      .optional().isInt({ min: 100, max: 4000 }),
    body('canvasState.backgroundType')
      .optional().isIn(['color','gradient','template_image','custom_image']),
    body('canvasState.backgroundColor')
      .optional().matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).withMessage('Invalid hex color'),
    body('canvasState.templateId')
      .optional().isMongoId(),
    // Watermark
    body('watermark').optional().isObject(),
    body('watermark.enabled').optional().isBoolean(),
    body('watermark.position')
      .optional().isIn(['bottom_right','bottom_left','top_right','top_left','center']),
    body('watermark.opacity')
      .optional().isFloat({ min: 0, max: 1 }),
  ],

  // PATCH /posts/:id — update post (partial)
  updatePost: [
    objectIdParam(),
    body('title').optional().trim().isLength({ max: 200 }),
    body('language').optional().isIn(LANGUAGES),
    body('mood').optional().isArray().custom(arr => arr.every(m => MOODS.includes(m))),
    body('tags').optional().isArray({ max: 10 }),
    body('genre').optional().isIn(GENRES),
    body('visibility').optional().isIn(VISIBILITY),
    body('canvasState').optional().isObject(),
    body('scheduledAt').optional().isISO8601()
      .custom(val => new Date(val) > new Date()).withMessage('scheduledAt must be in the future'),
    body('watermark').optional().isObject(),
  ],

  // POST /posts/:id/publish — publish a draft
  publishPost: [
    objectIdParam(),
    body('scheduledAt').optional().isISO8601()
      .custom(val => new Date(val) > new Date()).withMessage('scheduledAt must be in the future'),
  ],

  // GET /posts — list posts with filters
  listPosts: [
    ...paginationQuery,
    query('type').optional().isIn(POST_TYPES),
    query('language').optional().isIn(LANGUAGES),
    query('mood').optional(),
    query('genre').optional().isIn(GENRES),
    query('visibility').optional().isIn(['public','private','followers_only']),
    query('status').optional().isIn(['draft','published','scheduled','archived']),
    query('seriesId').optional().isMongoId(),
    query('channelId').optional().isMongoId(),
    query('sort').optional().isIn(['newest','oldest','popular','trending']),
  ],

  // POST /posts/:id/render — trigger re-render
  triggerRender: [ objectIdParam() ],

  // DELETE /posts/:id
  deletePost: [ objectIdParam() ],

  // PATCH /posts/:id/visibility
  updateVisibility: [
    objectIdParam(),
    body('visibility').notEmpty().isIn(VISIBILITY).withMessage('Invalid visibility value'),
  ],

  objectIdParam,
  paginationQuery,
};
