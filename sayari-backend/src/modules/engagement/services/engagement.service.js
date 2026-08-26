'use strict';

const { Like, Comment, Save, Follow, Post, Series, User, Channel, View, Report } = require('../../../models');
const { setCache, getCache, delCache, incr } = require('../../../config/redis');
const { Errors } = require('../../../utils/appError');

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function paginate(q) {
  const page  = Math.max(1, parseInt(q.page  || 1));
  const limit = Math.min(50, Math.max(1, parseInt(q.limit || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

async function getTargetAuthor(targetType, targetId) {
  if (targetType === 'post')    { const d = await Post.findById(targetId).select('author'); return d?.author; }
  if (targetType === 'series')  { const d = await Series.findById(targetId).select('author'); return d?.author; }
  if (targetType === 'comment') { const d = await Comment.findById(targetId).select('author'); return d?.author; }
  return null;
}

// ─────────────────────────────────────────────
//  1. LIKES
// ─────────────────────────────────────────────

async function toggleLike(userId, targetType, targetId, reactionType = 'like') {
  const targetAuthor = await getTargetAuthor(targetType, targetId);
  if (!targetAuthor) throw Errors.notFound('Target not found', 'TARGET_NOT_FOUND');

  const existing = await Like.findOne({ user: userId, target: targetId, targetType });

  if (existing) {
    // Same reaction → unlike
    if (existing.reactionType === reactionType) {
      await existing.deleteOne();
      await _updateLikeCount(targetType, targetId, -1);
      return { liked: false, reactionType: null };
    }
    // Different reaction → switch
    existing.reactionType = reactionType;
    await existing.save();
    return { liked: true, reactionType };
  }

  // New like
  await Like.create({ user: userId, target: targetId, targetType, reactionType, targetAuthor });
  await _updateLikeCount(targetType, targetId, +1);

  // Invalidate cache
  await delCache(`post_likes:${targetId}`);

  return { liked: true, reactionType };
}

async function _updateLikeCount(targetType, targetId, delta) {
  if (targetType === 'post')    return Post.findByIdAndUpdate(targetId,    { $inc: { 'stats.likeCount': delta } });
  if (targetType === 'series')  return Series.findByIdAndUpdate(targetId,  { $inc: { 'stats.likeCount': delta } });
  if (targetType === 'comment') return Comment.findByIdAndUpdate(targetId, { $inc: { likeCount: delta } });
}

async function getLikes(targetId, targetType, userId = null) {
  const cacheKey = `likes:${targetType}:${targetId}`;
  const cached   = await getCache(cacheKey);

  const [count, userReaction] = await Promise.all([
    cached?.count !== undefined ? Promise.resolve(cached.count) : Like.countDocuments({ target: targetId, targetType }),
    userId ? Like.findOne({ user: userId, target: targetId, targetType }).select('reactionType') : null,
  ]);

  // Reaction breakdown
  const breakdown = await Like.aggregate([
    { $match: { target: targetId, targetType } },
    { $group: { _id: '$reactionType', count: { $sum: 1 } } },
  ]);

  const result = {
    count,
    userReaction: userReaction?.reactionType || null,
    breakdown: breakdown.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {}),
  };
  await setCache(cacheKey, result, 60);
  return result;
}

// ─────────────────────────────────────────────
//  2. COMMENTS
// ─────────────────────────────────────────────

async function addComment(userId, postId, content, parentCommentId = null) {
  const post = await Post.findOne({ _id: postId, isDeleted: false, status: 'published' });
  if (!post) throw Errors.notFound('Post not found', 'POST_NOT_FOUND');

  // Extract @mentions
  const mentionHandles = (content.match(/@([a-z0-9_.]+)/gi) || []).map(m => m.slice(1));
  let mentionedUsers = [];
  if (mentionHandles.length) {
    const users = await User.find({ username: { $in: mentionHandles } }).select('_id');
    mentionedUsers = users.map(u => u._id);
  }

  // Validate parent comment if reply
  if (parentCommentId) {
    const parent = await Comment.findOne({ _id: parentCommentId, postId, isDeleted: false });
    if (!parent) throw Errors.notFound('Parent comment not found', 'PARENT_NOT_FOUND');
    if (parent.parentComment) throw Errors.badRequest('Cannot reply to a reply', 'NESTED_REPLY');
    await Comment.findByIdAndUpdate(parentCommentId, { $inc: { replyCount: 1 } });
  }

  const comment = await Comment.create({
    author: userId, postId, content,
    parentComment  : parentCommentId || null,
    mentionedUsers,
  });

  await Post.findByIdAndUpdate(postId, { $inc: { 'stats.commentCount': 1 } });
  await delCache(`comments:${postId}`);

  return comment.populate('author', 'username displayName avatar isVerified');
}

async function getComments(postId, query, userId = null) {
  const { page, limit, skip } = paginate(query);
  const { parentId } = query;

  const filter = {
    postId,
    isDeleted: false,
    isHidden : false,
    parentComment: parentId ? parentId : null,
  };

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate('author', 'username displayName avatar isVerified badges')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit).lean(),
    Comment.countDocuments(filter),
  ]);

  // Attach user's like status to each comment
  if (userId && comments.length) {
    const commentIds = comments.map(c => c._id);
    const userLikes  = await Like.find({ user: userId, target: { $in: commentIds }, targetType: 'comment' }).select('target reactionType');
    const likeMap    = userLikes.reduce((a, l) => { a[l.target] = l.reactionType; return a; }, {});
    comments.forEach(c => { c.userReaction = likeMap[c._id] || null; });
  }

  return { comments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function deleteComment(commentId, userId, role) {
  const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
  if (!comment) throw Errors.notFound('Comment not found', 'COMMENT_NOT_FOUND');

  const isOwner = String(comment.author) === String(userId);
  const isAdmin  = ['admin','superadmin','moderator'].includes(role);
  if (!isOwner && !isAdmin) throw Errors.forbidden('Cannot delete this comment', 'COMMENT_FORBIDDEN');

  comment.isDeleted = true;
  comment.deletedAt = new Date();
  await comment.save();

  await Post.findByIdAndUpdate(comment.postId, { $inc: { 'stats.commentCount': -1 } });
  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { replyCount: -1 } });
  }
  await delCache(`comments:${comment.postId}`);
  return { deleted: true };
}

// ─────────────────────────────────────────────
//  3. SAVES (Bookmarks)
// ─────────────────────────────────────────────

async function toggleSave(userId, targetType, targetId, collectionName = 'Saved') {
  const targetAuthor = await getTargetAuthor(targetType, targetId);

  const existing = await Save.findOne({ user: userId, target: targetId, targetType });
  if (existing) {
    await existing.deleteOne();
    await _updateSaveCount(targetType, targetId, -1);
    return { saved: false };
  }

  await Save.create({ user: userId, target: targetId, targetType, collection: collectionName, targetAuthor });
  await _updateSaveCount(targetType, targetId, +1);
  return { saved: true, collection: collectionName };
}

async function _updateSaveCount(targetType, targetId, delta) {
  if (targetType === 'post')   return Post.findByIdAndUpdate(targetId,   { $inc: { 'stats.saveCount': delta } });
  if (targetType === 'series') return Series.findByIdAndUpdate(targetId, { $inc: { 'stats.saveCount': delta } });
}

async function getSavedPosts(userId, query) {
  const { page, limit, skip } = paginate(query);
  const { collection, targetType } = query;

  const filter = { user: userId };
  if (collection)  filter.collection  = collection;
  if (targetType)  filter.targetType  = targetType;

  const saves = await Save.find(filter)
    .sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

  // Populate each target
  const postIds   = saves.filter(s => s.targetType === 'post').map(s => s.target);
  const seriesIds = saves.filter(s => s.targetType === 'series').map(s => s.target);

  const [posts, series] = await Promise.all([
    postIds.length   ? Post.find({ _id: { $in: postIds }, isDeleted: false })
      .select('title type renderedImage audio.coverImage stats visibility publishedAt')
      .populate('author','username displayName avatar').lean() : [],
    seriesIds.length ? Series.find({ _id: { $in: seriesIds }, isDeleted: false })
      .select('title type cover stats completionStatus')
      .populate('author','username displayName avatar').lean() : [],
  ]);

  const lookup = {};
  posts.forEach(p => { lookup[p._id] = { ...p, targetType: 'post' }; });
  series.forEach(s => { lookup[s._id] = { ...s, targetType: 'series' }; });

  const items = saves.map(s => lookup[s.target]).filter(Boolean);
  const total = await Save.countDocuments(filter);

  // Get distinct collections
  const collections = await Save.distinct('collection', { user: userId });

  return { items, collections, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

// ─────────────────────────────────────────────
//  4. FOLLOWS
// ─────────────────────────────────────────────

async function toggleFollow(followerId, followingId) {
  if (String(followerId) === String(followingId)) {
    throw Errors.badRequest('Cannot follow yourself', 'SELF_FOLLOW');
  }

  const target = await User.findOne({ _id: followingId, isDeleted: false, accountStatus: 'active' });
  if (!target) throw Errors.notFound('User not found', 'USER_NOT_FOUND');

  const existing = await Follow.findOne({ follower: followerId, following: followingId });
  if (existing) {
    await existing.deleteOne();
    await Promise.all([
      User.findByIdAndUpdate(followerId,  { $inc: { 'stats.followingCount': -1 } }),
      User.findByIdAndUpdate(followingId, { $inc: { 'stats.followersCount': -1 } }),
      Channel.findOneAndUpdate({ owner: followingId }, { $inc: { 'stats.followersCount': -1 } }),
    ]);
    return { following: false };
  }

  await Follow.create({ follower: followerId, following: followingId });
  await Promise.all([
    User.findByIdAndUpdate(followerId,  { $inc: { 'stats.followingCount': +1 } }),
    User.findByIdAndUpdate(followingId, { $inc: { 'stats.followersCount': +1 } }),
    Channel.findOneAndUpdate({ owner: followingId }, { $inc: { 'stats.followersCount': +1 } }),
  ]);

  await delCache(`followers:${followingId}`);
  return { following: true };
}

async function getFollowers(userId, query) {
  const { page, limit, skip } = paginate(query);
  const [follows, total] = await Promise.all([
    Follow.find({ following: userId })
      .populate('follower', 'username displayName avatar isVerified stats.followersCount')
      .sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Follow.countDocuments({ following: userId }),
  ]);
  return { followers: follows.map(f => f.follower), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getFollowing(userId, query) {
  const { page, limit, skip } = paginate(query);
  const [follows, total] = await Promise.all([
    Follow.find({ follower: userId })
      .populate('following', 'username displayName avatar isVerified channel stats.followersCount')
      .sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Follow.countDocuments({ follower: userId }),
  ]);
  return { following: follows.map(f => f.following), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getFollowStatus(viewerId, targetId) {
  if (!viewerId) return { isFollowing: false, isFollowedBy: false };
  const [isFollowing, isFollowedBy] = await Promise.all([
    Follow.exists({ follower: viewerId, following: targetId }),
    Follow.exists({ follower: targetId, following: viewerId }),
  ]);
  return { isFollowing: !!isFollowing, isFollowedBy: !!isFollowedBy };
}

// ─────────────────────────────────────────────
//  5. VIEWS
// ─────────────────────────────────────────────

async function recordView(targetId, targetType, viewerId = null, guestId = null, source = 'direct', audioProgress = null) {
  // Rate-limit: same user/guest can only count once per hour per post
  const dedupKey = `view:${targetType}:${targetId}:${viewerId || guestId}`;
  const seen = await incr(dedupKey, 3600); // expire in 1 hour
  if (seen > 1) return { counted: false };  // already viewed in this window

  const target = await (targetType === 'post' ? Post : Series).findById(targetId).select('author');
  if (!target) return { counted: false };

  await View.create({
    viewer: viewerId || null, guestId: guestId || null,
    target: targetId, targetType, targetAuthor: target.author,
    source, audioProgress, watchedFull: !!audioProgress,
  });

  // Increment denormalised counter
  if (targetType === 'post')   await Post.findByIdAndUpdate(targetId,   { $inc: { 'stats.viewCount': 1 } });
  if (targetType === 'series') await Series.findByIdAndUpdate(targetId, { $inc: { 'stats.viewCount': 1 } });

  return { counted: true };
}

// ─────────────────────────────────────────────
//  6. REPORTS
// ─────────────────────────────────────────────

async function reportContent(reporterId, targetType, targetId, reason, description = '') {
  const existing = await Report.findOne({ reporter: reporterId, target: targetId, targetType });
  if (existing) throw Errors.conflict('You have already reported this content', 'ALREADY_REPORTED');

  await Report.create({ reporter: reporterId, target: targetId, targetType, reason, description });

  // Increment report counter on target
  if (targetType === 'post')    await Post.findByIdAndUpdate(targetId,    { $inc: { reportCount: 1 }, isReported: true });
  if (targetType === 'comment') await Comment.findByIdAndUpdate(targetId, { $inc: { reportCount: 1 }, isReported: true });

  return { reported: true };
}

module.exports = {
  toggleLike, getLikes,
  addComment, getComments, deleteComment,
  toggleSave, getSavedPosts,
  toggleFollow, getFollowers, getFollowing, getFollowStatus,
  recordView,
  reportContent,
};
