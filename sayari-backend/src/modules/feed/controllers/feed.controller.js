'use strict';

const feedService = require('../services/feed.service');
const { catchAsync, sendSuccess } = require('../../../utils/appError');

exports.forYou = catchAsync(async (req, res) => {
  const result = await feedService.getForYouFeed(req.user.sub, req.query);
  sendSuccess(res, result);
});

exports.trending = catchAsync(async (req, res) => {
  const result = await feedService.getTrending(req.query);
  sendSuccess(res, result);
});

exports.newReleases = catchAsync(async (req, res) => {
  const result = await feedService.getNewReleases(req.user.sub, req.query);
  sendSuccess(res, result);
});

exports.topCreators = catchAsync(async (req, res) => {
  const result = await feedService.getTopCreators(req.query);
  sendSuccess(res, result);
});

exports.moodFeed = catchAsync(async (req, res) => {
  const result = await feedService.getMoodFeed(req.params.mood, req.query);
  sendSuccess(res, result);
});

exports.explore = catchAsync(async (req, res) => {
  const result = await feedService.getExplore(req.query);
  sendSuccess(res, result);
});
