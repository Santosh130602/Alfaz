'use strict';

const { Series, Post, Channel } = require('../../../models');
const { uploadFile, deleteFile } = require('../../../config/drive');
const { addCleanupJob }          = require('../../../config/queues');
const { setCache, getCache, delCache } = require('../../../config/redis');
const { Errors } = require('../../../utils/appError');
const sharp = require('sharp');

function paginate(q) {
  const page  = Math.max(1, parseInt(q.page  || 1));
  const limit = Math.min(50, Math.max(1, parseInt(q.limit || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

async function assertOwnership(seriesId, userId, role) {
  const series = await Series.findOne({ _id: seriesId, isDeleted: false });
  if (!series) throw Errors.notFound('Series not found', 'SERIES_NOT_FOUND');
  if (String(series.author) !== String(userId) && !['admin','superadmin','moderator'].includes(role)) {
    throw Errors.forbidden('You do not own this series', 'SERIES_FORBIDDEN');
  }
  return series;
}

// ─── 1. CREATE SERIES ─────────────────────────
async function createSeries(userId, body) {
  const { title, description='', type, language='hi', genre, tags=[], mood=[], visibility='public', estimatedChapters } = body;

  const channel = await Channel.findOne({ owner: userId, isActive: true });
  if (!channel) throw Errors.notFound('Channel not found', 'CHANNEL_NOT_FOUND');

  const series = await Series.create({
    author: userId, channel: channel._id,
    title, description, type, language, genre,
    tags, mood, visibility,
    estimatedChapters: estimatedChapters || null,
    status: 'draft',
  });

  await Channel.findByIdAndUpdate(channel._id, { $inc: { 'stats.seriesCount': 1 } });
  return series;
}

// ─── 2. UPDATE SERIES ─────────────────────────
async function updateSeries(seriesId, userId, role, updates) {
  const series = await assertOwnership(seriesId, userId, role);
  const allowed = ['title','description','genre','tags','mood','language','visibility','completionStatus','estimatedChapters'];
  allowed.forEach(k => { if (updates[k] !== undefined) series[k] = updates[k]; });
  if (updates.completionStatus === 'completed') series.completedAt = new Date();
  await series.save();
  await delCache(`series:${seriesId}`);
  return series;
}

// ─── 3. UPLOAD SERIES COVER ───────────────────
async function uploadCover(seriesId, userId, role, file) {
  const series = await assertOwnership(seriesId, userId, role);
  if (!file) throw Errors.badRequest('Cover image is required', 'NO_FILE');

  if (series.cover?.driveId) await addCleanupJob([series.cover.driveId]);

  const thumbBuffer = await sharp(file.buffer).resize(400, 600, { fit: 'cover' }).toBuffer();
  const [imgResult, thumbResult] = await Promise.all([
    uploadFile(file.buffer, `series_cover_${seriesId}_${Date.now()}.jpg`, file.mimetype, 'covers'),
    uploadFile(thumbBuffer, `series_thumb_${seriesId}_${Date.now()}.jpg`, 'image/jpeg', 'covers'),
  ]);

  series.cover = { url: imgResult.url, driveId: imgResult.driveId, thumbnail: thumbResult.url };
  await series.save();
  await delCache(`series:${seriesId}`);
  return series;
}

// ─── 4. PUBLISH SERIES ────────────────────────
async function publishSeries(seriesId, userId, role) {
  const series = await assertOwnership(seriesId, userId, role);
  if (series.status === 'published') throw Errors.conflict('Already published', 'ALREADY_PUBLISHED');
  series.status = 'published';
  await series.save();
  return series;
}

// ─── 5. DELETE SERIES (soft) ──────────────────
async function deleteSeries(seriesId, userId, role) {
  const series = await assertOwnership(seriesId, userId, role);
  const driveIds = [series.cover?.driveId].filter(Boolean);
  if (driveIds.length) await addCleanupJob(driveIds);

  series.isDeleted = true;
  series.deletedAt = new Date();
  await series.save();

  await Channel.findByIdAndUpdate(series.channel, { $inc: { 'stats.seriesCount': -1 } });
  await delCache(`series:${seriesId}`);
  return { deleted: true };
}

// ─── 6. GET SINGLE SERIES ─────────────────────
async function getSeries(seriesId, userId=null, role='user') {
  const cached = await getCache(`series:${seriesId}`);
  if (cached && !userId) return cached;

  const series = await Series.findOne({ _id: seriesId, isDeleted: false })
    .populate('author',  'username displayName avatar isVerified')
    .populate('channel', 'handle name logo')
    .lean();

  if (!series) throw Errors.notFound('Series not found', 'SERIES_NOT_FOUND');

  const isOwner = userId && String(series.author._id) === String(userId);
  const isAdmin  = ['admin','superadmin','moderator'].includes(role);
  if (series.visibility === 'private' && !isOwner && !isAdmin) {
    throw Errors.forbidden('This series is private', 'SERIES_PRIVATE');
  }

  if (series.visibility === 'public') await setCache(`series:${seriesId}`, series, 300);
  return series;
}

// ─── 7. LIST SERIES ───────────────────────────
async function listSeries(filters, userId=null, role='user') {
  const { page, limit, skip } = paginate(filters);
  const { type, language, genre, completionStatus, channelId, sort='newest' } = filters;
  const isAdmin = ['admin','superadmin','moderator'].includes(role);

  const query = { isDeleted: false };
  if (channelId) {
    query.channel = channelId;
    const isOwner = userId ? await Channel.exists({ _id: channelId, owner: userId }) : false;
    if (!isOwner && !isAdmin) { query.visibility = 'public'; query.status = 'published'; }
  } else {
    query.visibility = 'public'; query.status = 'published';
  }
  if (type)             query.type = type;
  if (language)         query.language = language;
  if (genre)            query.genre = genre;
  if (completionStatus) query.completionStatus = completionStatus;

  const sortMap = { newest: { createdAt: -1 }, popular: { 'stats.viewCount': -1 }, updated: { updatedAt: -1 } };
  const [series, total] = await Promise.all([
    Series.find(query)
      .select('-chapters')
      .populate('author',  'username displayName avatar isVerified')
      .populate('channel', 'handle name logo')
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip).limit(limit).lean(),
    Series.countDocuments(query),
  ]);
  return { series, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

// ─── 8. GET CHAPTERS LIST ─────────────────────
async function getChapters(seriesId, userId=null, role='user') {
  const series = await getSeries(seriesId, userId, role);
  const chapterIds = series.chapters.map(c => c.postId);
  const posts = await Post.find({ _id: { $in: chapterIds }, isDeleted: false })
    .select('title chapterNumber chapterTitle status publishedAt renderedImage audio.coverImage stats')
    .sort({ chapterNumber: 1 }).lean();
  return { series: { _id: series._id, title: series.title, cover: series.cover, completionStatus: series.completionStatus }, chapters: posts };
}

// ─── 9. REORDER CHAPTERS ──────────────────────
async function reorderChapters(seriesId, userId, role, orderedPostIds) {
  const series = await assertOwnership(seriesId, userId, role);
  // Re-assign chapter numbers based on new order
  const updates = orderedPostIds.map((postId, idx) =>
    Post.findByIdAndUpdate(postId, { chapterNumber: idx + 1 })
  );
  await Promise.all(updates);
  // Update chapters array in series
  series.chapters = orderedPostIds.map((postId, idx) => {
    const existing = series.chapters.find(c => String(c.postId) === String(postId));
    return { ...existing?.toObject(), postId, chapterNumber: idx + 1 };
  });
  await series.save();
  await delCache(`series:${seriesId}`);
  return { reordered: true };
}

module.exports = { createSeries, updateSeries, uploadCover, publishSeries, deleteSeries, getSeries, listSeries, getChapters, reorderChapters };
