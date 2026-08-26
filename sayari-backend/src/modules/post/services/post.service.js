'use strict';

const { Post, Channel, Series, Template, Asset }  = require('../../../models');
const { uploadFile, deleteFile }  = require('../../../config/drive');
const { addRenderJob, addPublishJob, removePublishJob, addCleanupJob } = require('../../../config/queues');
const { setCache, getCache, delCache } = require('../../../config/redis');
const { Errors } = require('../../../utils/appError');

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function paginationOptions(query) {
  const page  = Math.max(1, parseInt(query.page  || 1));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

async function assertPostOwnership(postId, userId, role) {
  const post = await Post.findOne({ _id: postId, isDeleted: false });
  if (!post) throw Errors.notFound('Post not found', 'POST_NOT_FOUND');
  if (String(post.author) !== String(userId) && !['admin','superadmin','moderator'].includes(role)) {
    throw Errors.forbidden('You do not own this post', 'POST_FORBIDDEN');
  }
  return post;
}

// ─────────────────────────────────────────────
//  1. CREATE POST (canvas or audio)
// ─────────────────────────────────────────────

async function createPost(userId, channelId, body) {
  const {
    type, title = '', language = 'hi', mood = [], tags = [], genre,
    visibility = 'public', seriesId, chapterNumber, chapterTitle,
    scheduledAt, canvasState, watermark,
  } = body;

  // Validate channel ownership
  const channel = await Channel.findOne({ _id: channelId, owner: userId, isActive: true });
  if (!channel) throw Errors.notFound('Channel not found or not yours', 'CHANNEL_NOT_FOUND');

  // Validate series if provided
  if (seriesId) {
    const series = await Series.findOne({ _id: seriesId, author: userId, isDeleted: false });
    if (!series) throw Errors.notFound('Series not found', 'SERIES_NOT_FOUND');
    // Check chapter number uniqueness
    if (chapterNumber) {
      const dupChapter = await Post.findOne({ series: seriesId, chapterNumber, isDeleted: false });
      if (dupChapter) throw Errors.conflict(`Chapter ${chapterNumber} already exists in this series`, 'CHAPTER_EXISTS');
    }
  }

  // Determine initial status
  const status = scheduledAt ? 'scheduled' : 'draft';

  const post = await Post.create({
    author : userId,
    channel: channelId,
    type, title, language, mood, tags, genre,
    visibility, status,
    series       : seriesId    || undefined,
    chapterNumber: chapterNumber || undefined,
    chapterTitle : chapterTitle  || undefined,
    scheduledAt  : scheduledAt   || undefined,
    canvasState  : canvasState   || undefined,
    watermark    : watermark     || undefined,
  });

  // Queue background render if canvas state provided
  if (canvasState?.fabricJson) {
    await addRenderJob(post._id.toString(), canvasState, 'post');
  }

  // Queue scheduled publish job
  if (scheduledAt) {
    await addPublishJob(post._id.toString(), scheduledAt);
  }

  // Increment channel post count
  await Channel.findByIdAndUpdate(channelId, { $inc: { 'stats.postsCount': 1 } });

  return post;
}

// ─────────────────────────────────────────────
//  2. UPDATE POST (partial edit)
// ─────────────────────────────────────────────

async function updatePost(postId, userId, role, updates) {
  const post = await assertPostOwnership(postId, userId, role);

  const allowed = ['title','language','mood','tags','genre','visibility','canvasState','scheduledAt','chapterTitle','watermark'];
  const patch   = {};
  allowed.forEach(k => { if (updates[k] !== undefined) patch[k] = updates[k]; });

  // Handle reschedule
  if (updates.scheduledAt) {
    await removePublishJob(postId);
    await addPublishJob(postId, updates.scheduledAt);
    patch.status      = 'scheduled';
    patch.scheduledAt = updates.scheduledAt;
  }

  // If canvas updated, queue re-render
  if (updates.canvasState?.fabricJson) {
    // Collect old Drive file for cleanup
    const oldDriveId = post.renderedImage?.driveId;
    if (oldDriveId) await addCleanupJob([oldDriveId]);
    patch.renderedImage = null;
    await addRenderJob(postId, updates.canvasState, 'post');
  }

  Object.assign(post, patch);
  await post.save();

  // Invalidate any cached feed that might contain this post
  await delCache(`post:${postId}`);

  return post;
}

// ─────────────────────────────────────────────
//  3. PUBLISH POST (draft → published)
// ─────────────────────────────────────────────

async function publishPost(postId, userId, role, { scheduledAt } = {}) {
  const post = await assertPostOwnership(postId, userId, role);

  if (post.status === 'published') throw Errors.conflict('Post is already published', 'ALREADY_PUBLISHED');

  // Can't publish if render isn't done yet
  if (!post.renderedImage?.url && post.type !== 'audio') {
    // If canvasState exists, check if render is queued
    if (post.canvasState?.fabricJson) {
      throw Errors.badRequest('Post image is still rendering. Please wait.', 'RENDER_PENDING');
    }
  }

  if (scheduledAt) {
    post.status      = 'scheduled';
    post.scheduledAt = scheduledAt;
    await addPublishJob(postId, scheduledAt);
  } else {
    post.status      = 'published';
    post.publishedAt = new Date();
  }

  await post.save();
  await delCache(`post:${postId}`);
  return post;
}

// ─────────────────────────────────────────────
//  4. UPLOAD AUDIO FILE
// ─────────────────────────────────────────────

async function uploadAudio(postId, userId, role, file) {
  const post = await assertPostOwnership(postId, userId, role);
  if (post.type !== 'audio') throw Errors.badRequest('Post is not an audio type', 'NOT_AUDIO_POST');

  // Delete old audio if replacing
  if (post.audio?.driveId) await addCleanupJob([post.audio.driveId]);

  const result = await uploadFile(file.buffer, `audio_${postId}_${Date.now()}.mp3`, file.mimetype, 'audio');

  post.audio = {
    fileUrl  : result.url,
    driveId  : result.driveId,
    sizeBytes: result.sizeBytes,
    mimeType : file.mimetype,
    isProcessed: false,
  };
  await post.save();
  return post;
}

// ─────────────────────────────────────────────
//  5. UPLOAD COVER IMAGE (for audio posts)
// ─────────────────────────────────────────────

async function uploadCover(postId, userId, role, file) {
  const post = await assertPostOwnership(postId, userId, role);

  if (post.audio?.coverImage?.driveId) await addCleanupJob([post.audio.coverImage.driveId]);

  const result = await uploadFile(file.buffer, `cover_${postId}_${Date.now()}.jpg`, file.mimetype, 'covers');

  if (post.type === 'audio') {
    post.audio = post.audio || {};
    post.audio.coverImage = { url: result.url, driveId: result.driveId, thumbnail: result.thumbnail };
  } else {
    // For regular posts, cover becomes the rendered image
    post.renderedImage = {
      url: result.url, driveId: result.driveId,
      thumbnail: result.thumbnail, mimeType: file.mimetype, renderedAt: new Date(),
    };
  }
  await post.save();
  return post;
}

// ─────────────────────────────────────────────
//  6. TRIGGER RE-RENDER (manual)
// ─────────────────────────────────────────────

async function triggerRender(postId, userId, role) {
  const post = await assertPostOwnership(postId, userId, role);
  if (!post.canvasState?.fabricJson) throw Errors.badRequest('No canvas state to render', 'NO_CANVAS_STATE');

  if (post.renderedImage?.driveId) await addCleanupJob([post.renderedImage.driveId]);
  post.renderedImage = null;
  await post.save();

  const job = await addRenderJob(postId, post.canvasState, 'post');
  return { queued: true, jobId: job.id };
}

// ─────────────────────────────────────────────
//  7. DELETE POST (soft)
// ─────────────────────────────────────────────

async function deletePost(postId, userId, role) {
  const post = await assertPostOwnership(postId, userId, role);

  // Collect Drive files to clean up
  const driveIds = [post.renderedImage?.driveId, post.audio?.driveId, post.audio?.coverImage?.driveId]
    .filter(Boolean);
  if (driveIds.length) await addCleanupJob(driveIds);

  // Remove scheduled job if any
  if (post.status === 'scheduled') await removePublishJob(postId);

  post.isDeleted = true;
  post.deletedAt = new Date();
  post.deletedBy = userId;
  await post.save();

  // Decrement channel counter
  await Channel.findByIdAndUpdate(post.channel, { $inc: { 'stats.postsCount': -1 } });
  await delCache(`post:${postId}`);

  return { deleted: true };
}

// ─────────────────────────────────────────────
//  8. UPDATE VISIBILITY
// ─────────────────────────────────────────────

async function updateVisibility(postId, userId, role, visibility) {
  const post = await assertPostOwnership(postId, userId, role);
  post.visibility = visibility;
  await post.save();
  await delCache(`post:${postId}`);
  return post;
}

// ─────────────────────────────────────────────
//  9. GET SINGLE POST
// ─────────────────────────────────────────────

async function getPost(postId, requestingUserId = null, requestingRole = 'user') {
  // Try cache first
  const cached = await getCache(`post:${postId}`);
  if (cached && !requestingUserId) return cached;

  const post = await Post.findOne({ _id: postId, isDeleted: false })
    .populate('author',  'username displayName avatar isVerified')
    .populate('channel', 'handle name logo')
    .populate('series',  'title slug')
    .lean();

  if (!post) throw Errors.notFound('Post not found', 'POST_NOT_FOUND');

  // Visibility check
  const isOwner = requestingUserId && String(post.author._id) === String(requestingUserId);
  const isAdmin  = ['admin','superadmin','moderator'].includes(requestingRole);

  if (post.visibility === 'private' && !isOwner && !isAdmin) {
    throw Errors.forbidden('This post is private', 'POST_PRIVATE');
  }

  // Cache public posts
  if (post.visibility === 'public' && post.status === 'published') {
    await setCache(`post:${postId}`, post, 300); // 5 min
  }

  return post;
}

// ─────────────────────────────────────────────
//  10. LIST POSTS (channel / user / explore)
// ─────────────────────────────────────────────

async function listPosts(filters, requestingUserId = null, requestingRole = 'user') {
  const { page, limit, skip } = paginationOptions(filters);
  const { type, language, mood, genre, status, visibility, seriesId, channelId, sort = 'newest' } = filters;

  const isAdmin = ['admin','superadmin','moderator'].includes(requestingRole);

  const query = { isDeleted: false };

  if (channelId) {
    query.channel = channelId;
    // For non-owners: only public published posts
    if (!isAdmin) {
      const isOwner = requestingUserId
        ? await Channel.exists({ _id: channelId, owner: requestingUserId })
        : false;
      if (!isOwner) {
        query.visibility = 'public';
        query.status     = 'published';
      }
    }
  } else {
    // Explore feed — only public published
    query.visibility = 'public';
    query.status     = 'published';
  }

  if (type)     query.type     = type;
  if (language) query.language = language;
  if (genre)    query.genre    = genre;
  if (mood)     query.mood     = { $in: Array.isArray(mood) ? mood : [mood] };
  if (seriesId) query.series   = seriesId;
  if (status && isAdmin)     query.status = status;
  if (visibility && isAdmin) query.visibility = visibility;

  const sortMap = {
    newest  : { publishedAt: -1 },
    oldest  : { publishedAt:  1 },
    popular : { 'stats.likeCount': -1, publishedAt: -1 },
    trending: { 'stats.viewCount': -1, 'stats.likeCount': -1 },
  };

  const [posts, total] = await Promise.all([
    Post.find(query)
      .select('-canvasState.fabricJson -__v')  // don't send huge fabricJson in lists
      .populate('author',  'username displayName avatar isVerified badges')
      .populate('channel', 'handle name logo isVerified')
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(query),
  ]);

  return {
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

// ─────────────────────────────────────────────
//  11. GET CREATOR DASHBOARD POSTS
// ─────────────────────────────────────────────

async function getMyPosts(userId, filters) {
  const { page, limit, skip } = paginationOptions(filters);
  const { status, type, visibility } = filters;

  const query = { author: userId, isDeleted: false };
  if (status)     query.status     = status;
  if (type)       query.type       = type;
  if (visibility) query.visibility = visibility;

  const [posts, total] = await Promise.all([
    Post.find(query)
      .select('-canvasState.fabricJson -__v')
      .populate('series', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(query),
  ]);

  return { posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

module.exports = {
  createPost,
  updatePost,
  publishPost,
  uploadAudio,
  uploadCover,
  triggerRender,
  deletePost,
  updateVisibility,
  getPost,
  listPosts,
  getMyPosts,
};
