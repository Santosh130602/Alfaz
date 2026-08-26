'use strict';

const { body, param, query } = require('express-validator');

const mongoId = (f='id') => param(f).isMongoId().withMessage(`Invalid ${f}`);

module.exports = {
  toggleLike: [
    mongoId('targetId'),
    body('targetType').isIn(['post','series','comment']).withMessage('Invalid targetType'),
    body('reactionType').optional().isIn(['like','wah_wah','dil','kya_baat','rula_diya','haha']),
  ],
  addComment: [
    mongoId('postId'),
    body('content').trim().notEmpty().withMessage('Comment cannot be empty')
      .isLength({ max: 1000 }).withMessage('Comment max 1000 characters'),
    body('parentCommentId').optional().isMongoId(),
  ],
  deleteComment : [ mongoId('commentId') ],
  getComments   : [ mongoId('postId'), query('page').optional().isInt({ min:1 }).toInt(), query('limit').optional().isInt({ min:1, max:50 }).toInt(), query('parentId').optional().isMongoId() ],
  toggleSave    : [ mongoId('targetId'), body('targetType').isIn(['post','series']), body('collection').optional().trim().isLength({ max: 100 }) ],
  toggleFollow  : [ mongoId('userId') ],
  getFollowers  : [ mongoId('userId'), query('page').optional().isInt({min:1}).toInt(), query('limit').optional().isInt({min:1,max:50}).toInt() ],
  recordView    : [ mongoId('targetId'), body('targetType').isIn(['post','series','channel']), body('source').optional().isIn(['feed','profile','search','trending','direct','share']), body('audioProgress').optional().isFloat({min:0}), body('guestId').optional().isString() ],
  report        : [ mongoId('targetId'), body('targetType').isIn(['post','comment','user','series']), body('reason').isIn(['spam','abusive','hate_speech','inappropriate','copyright','misinformation','other']), body('description').optional().trim().isLength({max:500}) ],
};
