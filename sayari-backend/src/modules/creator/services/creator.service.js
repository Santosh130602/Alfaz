'use strict';

const { User, Channel, Post, Series, Follow } = require('../../../models');
const { setCache, getCache, delCache } = require('../../../config/redis');
const { Errors } = require('../../../utils/appError');

const CACHE_TTL = 120; // 2 min

function paginate(q) {
  const page  = Math.max(1, parseInt(q.page  || 1));
  const limit = Math.min(30, Math.max(1, parseInt(q.limit || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

// ─────────────────────────────────────────────
//  1. GET PUBLIC CHANNEL PAGE
// ─────────────────────────────────────────────

async function getChannelPage(handle, viewerId = null) {
  const cacheKey = `channel:page:${handle}`;
  const cached   = await getCache(cacheKey);

  const channel = cached || await Channel.findOne({ handle, isActive: true, isDeleted: false })
    .populate('owner', 'username displayName avatar isVerified badges stats language createdAt')
    .populate('featuredPost', 'title type renderedImage audio.coverImage stats publishedAt')
    .lean();

  if (!channel) throw Errors.notFound('Channel not found', 'CHANNEL_NOT_FOUND');

  if (!cached) await setCache(cacheKey, channel, CACHE_TTL);

  // Attach viewer's follow status
  let isFollowing = false;
  if (viewerId) {
    isFollowing = !!(await Follow.exists({ follower: viewerId, following: channel.owner._id }));
  }

  return { channel, isFollowing };
}

// ─────────────────────────────────────────────
//  2. GET CHANNEL POSTS (public tab)
// ─────────────────────────────────────────────

async function getChannelPosts(handle, query, viewerId = null, viewerRole = 'user') {
  const channel = await Channel.findOne({ handle, isActive: true, isDeleted: false }).select('_id owner');
  if (!channel) throw Errors.notFound('Channel not found', 'CHANNEL_NOT_FOUND');

  const { page, limit, skip } = paginate(query);
  const { type, language, genre, sort = 'newest' } = query;

  const isOwner = viewerId && String(channel.owner) === String(viewerId);
  const isAdmin  = ['admin', 'superadmin', 'moderator'].includes(viewerRole);

  const filter = { channel: channel._id, isDeleted: false };
  if (!isOwner && !isAdmin) { filter.visibility = 'public'; filter.status = 'published'; }
  if (type)     filter.type     = type;
  if (language) filter.language = language;
  if (genre)    filter.genre    = genre;

  const sortMap = {
    newest  : { publishedAt: -1 },
    popular : { 'stats.likeCount': -1 },
    oldest  : { publishedAt:  1 },
  };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .select('-canvasState.fabricJson -__v')
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ]);

  return { posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

// ─────────────────────────────────────────────
//  3. GET CHANNEL SERIES (public tab)
// ─────────────────────────────────────────────

async function getChannelSeries(handle, query, viewerId = null, viewerRole = 'user') {
  const channel = await Channel.findOne({ handle, isActive: true, isDeleted: false }).select('_id owner');
  if (!channel) throw Errors.notFound('Channel not found', 'CHANNEL_NOT_FOUND');

  const { page, limit, skip } = paginate(query);
  const { type, sort = 'newest' } = query;

  const isOwner = viewerId && String(channel.owner) === String(viewerId);
  const isAdmin  = ['admin', 'superadmin', 'moderator'].includes(viewerRole);

  const filter = { channel: channel._id, isDeleted: false };
  if (!isOwner && !isAdmin) { filter.visibility = 'public'; filter.status = 'published'; }
  if (type) filter.type = type;

  const sortMap = {
    newest  : { createdAt: -1 },
    popular : { 'stats.viewCount': -1 },
    updated : { updatedAt: -1 },
  };

  const [series, total] = await Promise.all([
    Series.find(filter)
      .select('-chapters')
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip).limit(limit).lean(),
    Series.countDocuments(filter),
  ]);

  return { series, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

// ─────────────────────────────────────────────
//  4. UPDATE CHANNEL PROFILE
// ─────────────────────────────────────────────

async function updateChannel(userId, updates) {
  const channel = await Channel.findOne({ owner: userId, isActive: true, isDeleted: false });
  if (!channel) throw Errors.notFound('Channel not found', 'CHANNEL_NOT_FOUND');

  const allowed = ['name', 'tagline', 'description', 'languages', 'category', 'theme'];
  allowed.forEach(k => { if (updates[k] !== undefined) channel[k] = updates[k]; });

  // Handle handle change with uniqueness check
  if (updates.handle && updates.handle !== channel.handle) {
    const exists = await Channel.exists({ handle: updates.handle, _id: { $ne: channel._id } });
    if (exists) throw Errors.conflict('This handle is already taken', 'HANDLE_TAKEN');
    channel.handle = updates.handle.toLowerCase().trim();
  }

  await channel.save();
  await delCache(`channel:page:${channel.handle}`);
  return channel;
}

// ─────────────────────────────────────────────
//  5. SET FEATURED POST
// ─────────────────────────────────────────────

async function setFeaturedPost(userId, postId) {
  const channel = await Channel.findOne({ owner: userId });
  if (!channel) throw Errors.notFound('Channel not found', 'CHANNEL_NOT_FOUND');

  if (postId) {
    const post = await Post.findOne({ _id: postId, author: userId, status: 'published', isDeleted: false });
    if (!post) throw Errors.notFound('Post not found or not published', 'POST_NOT_FOUND');
    channel.featuredPost = postId;
  } else {
    channel.featuredPost = null;
  }

  await channel.save();
  await delCache(`channel:page:${channel.handle}`);
  return { featuredPost: channel.featuredPost };
}

// ─────────────────────────────────────────────
//  6. GET USER PUBLIC PROFILE (by username)
// ─────────────────────────────────────────────

async function getUserProfile(username, viewerId = null) {
  const cacheKey = `profile:${username}`;
  const cached   = await getCache(cacheKey);

  const user = cached || await User.findOne({ username, isDeleted: false, accountStatus: 'active' })
    .select('username displayName avatar bio isVerified badges stats channel language createdAt')
    .populate('channel', 'handle name logo tagline category stats isVerified')
    .lean();

  if (!user) throw Errors.notFound('User not found', 'USER_NOT_FOUND');
  if (!cached) await setCache(cacheKey, user, CACHE_TTL);

  let isFollowing = false;
  let isFollowedBy = false;

  if (viewerId && String(viewerId) !== String(user._id)) {
    [isFollowing, isFollowedBy] = await Promise.all([
      Follow.exists({ follower: viewerId, following: user._id }),
      Follow.exists({ follower: user._id, following: viewerId }),
    ]);
  }

  return { user, isFollowing: !!isFollowing, isFollowedBy: !!isFollowedBy };
}

// ─────────────────────────────────────────────
//  7. UPDATE USER PROFILE (own profile)
// ─────────────────────────────────────────────

async function updateUserProfile(userId, updates) {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) throw Errors.notFound('User not found', 'USER_NOT_FOUND');

  if (updates.username && updates.username !== user.username) {
    const exists = await User.exists({ username: updates.username, _id: { $ne: userId } });
    if (exists) throw Errors.conflict('Username already taken', 'USERNAME_TAKEN');
    user.username = updates.username.toLowerCase().trim();
    // Sync channel handle if it matched old username
    await Channel.findOneAndUpdate(
      { owner: userId, handle: user.username },
      { handle: updates.username }
    );
  }

  const allowed = ['displayName', 'bio', 'language', 'socialLinks'];
  allowed.forEach(k => { if (updates[k] !== undefined) user[k] = updates[k]; });
  await user.save({ validateBeforeSave: false });

  await delCache(`profile:${user.username}`);
  return user.toPublicJSON();
}

// ─────────────────────────────────────────────
//  8. SEARCH SIMILAR CHANNELS (recommendations)
// ─────────────────────────────────────────────

async function getSimilarChannels(channelId, limit = 6) {
  const channel = await Channel.findById(channelId).select('category languages').lean();
  if (!channel) return [];

  const similar = await Channel.find({
    _id     : { $ne: channelId },
    isPublic: true,
    isActive: true,
    isDeleted: false,
    $or: [
      { 'category.primary': channel.category?.primary },
      { languages: { $in: channel.languages || [] } },
    ],
  })
    .select('handle name logo tagline stats isVerified category')
    .populate('owner', 'username displayName')
    .sort({ 'stats.followersCount': -1 })
    .limit(parseInt(limit))
    .lean();

  return similar;
}

module.exports = {
  getChannelPage,
  getChannelPosts,
  getChannelSeries,
  updateChannel,
  setFeaturedPost,
  getUserProfile,
  updateUserProfile,
  getSimilarChannels,
};
