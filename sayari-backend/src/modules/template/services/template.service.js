'use strict';

const { Template, Asset } = require('../../../models');
const { uploadFile, deleteFile } = require('../../../config/drive');
const { setCache, getCache, delCache } = require('../../../config/redis');
const { Errors } = require('../../../utils/appError');
const sharp = require('sharp');

const TEMPLATE_CACHE_TTL = 300; // 5 min

// ─────────────────────────────────────────────
//  TEMPLATE SERVICE
// ─────────────────────────────────────────────

async function uploadTemplate(adminId, file, body) {
  if (!file) throw Errors.badRequest('Image file is required', 'NO_FILE');

  const {
    name, description = '', category = 'all', tags = [],
    orientation = 'square', mood = [], defaultTextZones = [],
    isPremium = false, sortOrder = 0,
  } = body;

  if (!name) throw Errors.badRequest('Template name is required', 'NAME_REQUIRED');

  // Generate thumbnail using sharp
  const thumbBuffer = await sharp(file.buffer).resize(300, 300, { fit: 'inside' }).toBuffer();

  // Upload full image + thumbnail
  const [imageResult, thumbResult] = await Promise.all([
    uploadFile(file.buffer, `template_${Date.now()}.${file.originalname.split('.').pop()}`, file.mimetype, 'templates'),
    uploadFile(thumbBuffer, `template_thumb_${Date.now()}.jpg`, 'image/jpeg', 'templates'),
  ]);

  const template = await Template.create({
    name, description, category,
    tags        : Array.isArray(tags) ? tags : JSON.parse(tags || '[]'),
    mood        : Array.isArray(mood) ? mood : JSON.parse(mood || '[]'),
    orientation,
    image       : { url: imageResult.url, driveId: imageResult.driveId, thumbnail: thumbResult.url, sizeBytes: imageResult.sizeBytes, mimeType: file.mimetype },
    defaultTextZones: typeof defaultTextZones === 'string' ? JSON.parse(defaultTextZones) : defaultTextZones,
    isPremium   : isPremium === 'true' || isPremium === true,
    sortOrder   : parseInt(sortOrder) || 0,
    uploadedBy  : adminId,
  });

  await delCache('templates:all');
  return template;
}

async function listTemplates(filters = {}) {
  const { category, orientation, tags, mood, page = 1, limit = 30 } = filters;
  const skip = (page - 1) * limit;

  const cacheKey = `templates:${JSON.stringify(filters)}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const query = { isActive: true, isDeleted: false };
  if (category)    query.category    = category;
  if (orientation) query.orientation = orientation;
  if (tags)        query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  if (mood)        query.mood = { $in: Array.isArray(mood) ? mood : [mood] };

  const [templates, total] = await Promise.all([
    Template.find(query)
      .select('name category orientation image tags mood isPremium sortOrder usageCount')
      .sort({ sortOrder: 1, usageCount: -1 })
      .skip(skip).limit(parseInt(limit)).lean(),
    Template.countDocuments(query),
  ]);

  const result = { templates, pagination: { page: parseInt(page), limit: parseInt(limit), total } };
  await setCache(cacheKey, result, TEMPLATE_CACHE_TTL);
  return result;
}

async function updateTemplate(templateId, adminId, updates) {
  const template = await Template.findOne({ _id: templateId, isDeleted: false });
  if (!template) throw Errors.notFound('Template not found', 'TEMPLATE_NOT_FOUND');

  const allowed = ['name','description','category','tags','mood','orientation','defaultTextZones','isPremium','isActive','sortOrder'];
  allowed.forEach(k => { if (updates[k] !== undefined) template[k] = updates[k]; });
  template.updatedBy = adminId;
  await template.save();

  await delCache('templates:all');
  return template;
}

async function deleteTemplate(templateId) {
  const template = await Template.findOne({ _id: templateId, isDeleted: false });
  if (!template) throw Errors.notFound('Template not found', 'TEMPLATE_NOT_FOUND');

  // Clean Drive files
  const driveIds = [template.image?.driveId].filter(Boolean);
  if (driveIds.length) await Promise.all(driveIds.map(deleteFile));

  template.isDeleted = true;
  template.deletedAt = new Date();
  await template.save();
  await delCache('templates:all');
  return { deleted: true };
}

// ─────────────────────────────────────────────
//  ASSET SERVICE (stickers, fonts, logos)
// ─────────────────────────────────────────────

async function uploadAsset(adminId, file, body) {
  if (!file) throw Errors.badRequest('File is required', 'NO_FILE');

  const {
    name, assetType, category = 'other', tags = [],
    isPremium = false, sortOrder = 0,
    fontFamily, supportsUrdu = false, supportsHindi = false, previewText,
  } = body;

  if (!name)      throw Errors.badRequest('Asset name is required',  'NAME_REQUIRED');
  if (!assetType) throw Errors.badRequest('Asset type is required',  'TYPE_REQUIRED');

  let thumbBuffer = null;
  // Only generate thumbnail for image assets (not fonts)
  if (file.mimetype.startsWith('image/')) {
    thumbBuffer = await sharp(file.buffer).resize(200, 200, { fit: 'inside', background: { r:0,g:0,b:0,alpha:0 } }).toBuffer();
  }

  const folderKey = assetType === 'logo' || assetType === 'watermark' ? 'assets' : 'assets';
  const [fileResult, thumbResult] = await Promise.all([
    uploadFile(file.buffer, `asset_${assetType}_${Date.now()}.${file.originalname.split('.').pop()}`, file.mimetype, folderKey),
    thumbBuffer ? uploadFile(thumbBuffer, `asset_thumb_${Date.now()}.png`, 'image/png', folderKey) : Promise.resolve(null),
  ]);

  const asset = await Asset.create({
    name, assetType, category,
    tags      : Array.isArray(tags) ? tags : JSON.parse(tags || '[]'),
    file      : { url: fileResult.url, driveId: fileResult.driveId, thumbnail: thumbResult?.url || null, sizeBytes: fileResult.sizeBytes, mimeType: file.mimetype },
    fontMeta  : assetType === 'font' ? { fontFamily, supportsUrdu: supportsUrdu === 'true', supportsHindi: supportsHindi === 'true', previewText } : undefined,
    isPremium : isPremium === 'true' || isPremium === true,
    sortOrder : parseInt(sortOrder) || 0,
    uploadedBy: adminId,
  });

  await delCache('assets:all');
  return asset;
}

async function listAssets(filters = {}) {
  const { assetType, category, tags, page = 1, limit = 40 } = filters;
  const skip = (page - 1) * limit;

  const cacheKey = `assets:${JSON.stringify(filters)}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const query = { isActive: true, isDeleted: false };
  if (assetType) query.assetType = assetType;
  if (category)  query.category  = category;
  if (tags)      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };

  const [assets, total] = await Promise.all([
    Asset.find(query)
      .select('name assetType category file fontMeta tags isPremium sortOrder usageCount')
      .sort({ sortOrder: 1, usageCount: -1 })
      .skip(skip).limit(parseInt(limit)).lean(),
    Asset.countDocuments(query),
  ]);

  const result = { assets, pagination: { page: parseInt(page), limit: parseInt(limit), total } };
  await setCache(cacheKey, result, TEMPLATE_CACHE_TTL);
  return result;
}

async function deleteAsset(assetId) {
  const asset = await Asset.findOne({ _id: assetId, isDeleted: false });
  if (!asset) throw Errors.notFound('Asset not found', 'ASSET_NOT_FOUND');

  if (asset.file?.driveId) await deleteFile(asset.file.driveId);
  asset.isDeleted = true;
  asset.deletedAt = new Date();
  await asset.save();

  await delCache('assets:all');
  return { deleted: true };
}

// Track usage when a post uses a template or asset
async function trackUsage(templateId, assetIds = []) {
  const ops = [];
  if (templateId) ops.push(Template.findByIdAndUpdate(templateId, { $inc: { usageCount: 1 } }));
  if (assetIds.length) ops.push(Asset.updateMany({ _id: { $in: assetIds } }, { $inc: { usageCount: 1 } }));
  await Promise.all(ops);
}

module.exports = {
  uploadTemplate, listTemplates, updateTemplate, deleteTemplate,
  uploadAsset,    listAssets,                    deleteAsset,
  trackUsage,
};
