'use strict';

const { body, param, query } = require('express-validator');

module.exports = {
  getNotifications: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('type').optional().isString(),
    query('unreadOnly').optional().isBoolean().toBoolean(),
  ],

  markAsRead: [
    param('id').isMongoId().withMessage('Invalid notification ID'),
  ],

  deleteNotification: [
    param('id').isMongoId().withMessage('Invalid notification ID'),
  ],

  registerToken: [
    body('token').notEmpty().withMessage('FCM token is required').isString(),
    body('platform').notEmpty().isIn(['ios','android','web']).withMessage('Platform must be ios, android, or web'),
  ],

  removeToken: [
    body('token').notEmpty().withMessage('FCM token is required').isString(),
  ],

  updatePrefs: [
    body('newFollower').optional().isBoolean(),
    body('newComment').optional().isBoolean(),
    body('newLike').optional().isBoolean(),
    body('newChapter').optional().isBoolean(),
    body('adminAnnouncement').optional().isBoolean(),
    body('whatsapp').optional().isBoolean(),
    body('push').optional().isBoolean(),
    body('email').optional().isBoolean(),
  ],
};
