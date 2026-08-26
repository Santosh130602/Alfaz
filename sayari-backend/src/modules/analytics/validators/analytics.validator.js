'use strict';

const { param, query } = require('express-validator');

const PERIODS  = ['7d', '30d', '90d', '1y'];
const SORT_BYS = ['views', 'likes', 'comments', 'saves', 'plays', 'newest'];

const period  = query('period').optional().isIn(PERIODS).withMessage(`period must be one of: ${PERIODS.join(', ')}`);
const limit   = query('limit').optional().isInt({ min: 1, max: 50 }).toInt();
const mongoId = (f = 'id') => param(f).isMongoId().withMessage(`Invalid ${f}`);

module.exports = {
  channelOverview    : [ period ],
  followerGrowth     : [ period ],
  viewsChart         : [ period ],
  topPosts           : [ period, query('sortBy').optional().isIn(SORT_BYS), limit ],
  engagementBreakdown: [ period ],
  audioAnalytics     : [ period ],
  seriesAnalytics    : [ period ],
  postAnalytics      : [ mongoId('postId'), period ],
  bestPostingTimes   : [],
};
