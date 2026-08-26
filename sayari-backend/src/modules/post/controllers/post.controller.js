'use strict';

const { validationResult } = require('express-validator');
const postService = require('../services/post.service');
const { catchAsync, sendSuccess, Errors } = require('../../../utils/appError');

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw Errors.badRequest(errors.array().map(e => e.msg).join(', '), 'VALIDATION_ERROR');
};

// ─────────────────────────────────────────────

exports.createPost = catchAsync(async (req, res) => {
  validate(req);
  const post = await postService.createPost(req.user.sub, req.user.channelId || req.body.channelId, req.body);
  sendSuccess(res, { post }, 201, 'Post created successfully');
});

exports.updatePost = catchAsync(async (req, res) => {
  validate(req);
  const post = await postService.updatePost(req.params.id, req.user.sub, req.user.role, req.body);
  sendSuccess(res, { post }, 200, 'Post updated');
});

exports.publishPost = catchAsync(async (req, res) => {
  validate(req);
  const post = await postService.publishPost(req.params.id, req.user.sub, req.user.role, req.body);
  sendSuccess(res, { post }, 200, post.status === 'scheduled' ? 'Post scheduled' : 'Post published');
});

exports.uploadAudio = catchAsync(async (req, res) => {
  if (!req.file) throw Errors.badRequest('Audio file is required', 'NO_FILE');
  const post = await postService.uploadAudio(req.params.id, req.user.sub, req.user.role, req.file);
  sendSuccess(res, { post }, 200, 'Audio uploaded successfully');
});

exports.uploadCover = catchAsync(async (req, res) => {
  if (!req.file) throw Errors.badRequest('Cover image is required', 'NO_FILE');
  const post = await postService.uploadCover(req.params.id, req.user.sub, req.user.role, req.file);
  sendSuccess(res, { post }, 200, 'Cover uploaded successfully');
});

exports.triggerRender = catchAsync(async (req, res) => {
  validate(req);
  const result = await postService.triggerRender(req.params.id, req.user.sub, req.user.role);
  sendSuccess(res, result, 202, 'Render job queued');
});

exports.deletePost = catchAsync(async (req, res) => {
  validate(req);
  await postService.deletePost(req.params.id, req.user.sub, req.user.role);
  sendSuccess(res, {}, 200, 'Post deleted');
});

exports.updateVisibility = catchAsync(async (req, res) => {
  validate(req);
  const post = await postService.updateVisibility(req.params.id, req.user.sub, req.user.role, req.body.visibility);
  sendSuccess(res, { post }, 200, 'Visibility updated');
});

exports.getPost = catchAsync(async (req, res) => {
  const post = await postService.getPost(req.params.id, req.user?.sub, req.user?.role);
  sendSuccess(res, { post });
});

exports.listPosts = catchAsync(async (req, res) => {
  validate(req);
  const result = await postService.listPosts(req.query, req.user?.sub, req.user?.role);
  sendSuccess(res, result);
});

exports.getMyPosts = catchAsync(async (req, res) => {
  validate(req);
  const result = await postService.getMyPosts(req.user.sub, req.query);
  sendSuccess(res, result);
});

exports.getRenderStatus = catchAsync(async (req, res) => {
  const { Post } = require('../../../models');
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
    .select('renderedImage status adminNote');
  if (!post) throw Errors.notFound('Post not found', 'POST_NOT_FOUND');
  sendSuccess(res, {
    rendered : !!post.renderedImage?.url,
    imageUrl : post.renderedImage?.url   || null,
    thumbnail: post.renderedImage?.thumbnail || null,
    status   : post.status,
    error    : post.adminNote || null,
  });
});
