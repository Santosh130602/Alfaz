'use strict';

const templateService = require('../services/template.service');
const { catchAsync, sendSuccess, Errors } = require('../../../utils/appError');

// ── Templates ─────────────────────────────────

exports.uploadTemplate = catchAsync(async (req, res) => {
  const template = await templateService.uploadTemplate(req.user.sub, req.file, req.body);
  sendSuccess(res, { template }, 201, 'Template uploaded');
});

exports.listTemplates = catchAsync(async (req, res) => {
  const result = await templateService.listTemplates(req.query);
  sendSuccess(res, result);
});

exports.updateTemplate = catchAsync(async (req, res) => {
  const template = await templateService.updateTemplate(req.params.id, req.user.sub, req.body);
  sendSuccess(res, { template }, 200, 'Template updated');
});

exports.deleteTemplate = catchAsync(async (req, res) => {
  await templateService.deleteTemplate(req.params.id);
  sendSuccess(res, {}, 200, 'Template deleted');
});

// ── Assets ────────────────────────────────────

exports.uploadAsset = catchAsync(async (req, res) => {
  const asset = await templateService.uploadAsset(req.user.sub, req.file, req.body);
  sendSuccess(res, { asset }, 201, 'Asset uploaded');
});

exports.listAssets = catchAsync(async (req, res) => {
  const result = await templateService.listAssets(req.query);
  sendSuccess(res, result);
});

exports.deleteAsset = catchAsync(async (req, res) => {
  await templateService.deleteAsset(req.params.id);
  sendSuccess(res, {}, 200, 'Asset deleted');
});
