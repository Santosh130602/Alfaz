'use strict';

const searchService = require('../services/search.service');
const { catchAsync, sendSuccess } = require('../../../utils/appError');

exports.globalSearch   = catchAsync(async (req, res) => {
  const result = await searchService.globalSearch(req.query.q, req.query);
  sendSuccess(res, result);
});

exports.searchPosts    = catchAsync(async (req, res) => {
  const result = await searchService.searchPosts(req.query.q, req.query);
  sendSuccess(res, result);
});

exports.searchChannels = catchAsync(async (req, res) => {
  const result = await searchService.searchChannels(req.query.q, req.query);
  sendSuccess(res, result);
});

exports.searchSeries   = catchAsync(async (req, res) => {
  const result = await searchService.searchSeries(req.query.q, req.query);
  sendSuccess(res, result);
});

exports.searchByTag    = catchAsync(async (req, res) => {
  const result = await searchService.searchByTag(req.params.tag, req.query);
  sendSuccess(res, result);
});

exports.autocomplete   = catchAsync(async (req, res) => {
  const result = await searchService.autocomplete(req.query.q);
  sendSuccess(res, result);
});

exports.trendingTags   = catchAsync(async (req, res) => {
  const result = await searchService.getTrendingTags(req.query.limit);
  sendSuccess(res, result);
});
