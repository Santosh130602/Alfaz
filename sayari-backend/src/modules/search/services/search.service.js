'use strict';

const { Post, Channel, Series, User } = require('../../../models');
const { setCache, getCache }           = require('../../../config/redis');

const SEARCH_CACHE_TTL = 60; // 1 min

function paginate(q) {
  const page  = Math.max(1, parseInt(q.page  || 1));
  const limit = Math.min(30, Math.max(1, parseInt(q.limit || 15)));
  return { page, limit, skip: (page - 1) * limit };
}

function sanitise(q) {
  return String(q || '').trim().replace(/[<>]/g, '').substring(0, 100);
}

// ─────────────────────────────────────────────
//  1. GLOBAL SEARCH
//  Searches posts + channels + series together
// ─────────────────────────────────────────────

async function globalSearch(rawQuery, query) {
  const q = sanitise(rawQuery);
  if (!q || q.length < 2) return { posts: [], channels: [], series: [], query: q };

  const { language, type, genre } = query;
  const cacheKey = `search:global:${q}:${language||''}:${type||''}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const basePostFilter = {
    status: 'published', visibility: 'public', isDeleted: false,
    $text: { $search: q },
  };
  if (language) basePostFilter.language = language;
  if (type)     basePostFilter.type     = type;
  if (genre)    basePostFilter.genre    = genre;

  const [posts, channels, series] = await Promise.all([
    Post.find(basePostFilter, { score: { $meta: 'textScore' } })
      .select('-canvasState.fabricJson -__v')
      .populate('author',  'username displayName avatar isVerified')
      .populate('channel', 'handle name logo')
      .sort({ score: { $meta: 'textScore' } })
      .limit(10).lean(),

    Channel.find({ $text: { $search: q }, isPublic: true, isActive: true, isDeleted: false },
      { score: { $meta: 'textScore' } })
      .select('handle name logo tagline category stats isVerified')
      .populate('owner', 'username displayName')
      .sort({ score: { $meta: 'textScore' } })
      .limit(5).lean(),

    Series.find({ $text: { $search: q }, status: 'published', visibility: 'public', isDeleted: false },
      { score: { $meta: 'textScore' } })
      .select('title type cover language genre completionStatus stats')
      .populate('author', 'username displayName avatar isVerified')
      .sort({ score: { $meta: 'textScore' } })
      .limit(5).lean(),
  ]);

  const result = { query: q, posts, channels, series };
  await setCache(cacheKey, result, SEARCH_CACHE_TTL);
  return result;
}

// ─────────────────────────────────────────────
//  2. SEARCH POSTS (paginated, with filters)
// ─────────────────────────────────────────────

async function searchPosts(rawQuery, query) {
  const q = sanitise(rawQuery);
  const { page, limit, skip } = paginate(query);
  const { language, type, genre, mood, sort = 'relevance' } = query;

  if (!q || q.length < 2) return { posts: [], pagination: { page, limit, total: 0 } };

  const filter = {
    status: 'published', visibility: 'public', isDeleted: false,
    $text: { $search: q },
  };
  if (language) filter.language = language;
  if (type)     filter.type     = type;
  if (genre)    filter.genre    = genre;
  if (mood)     filter.mood     = { $in: Array.isArray(mood) ? mood : [mood] };

  const sortMap = {
    relevance: { score: { $meta: 'textScore' } },
    newest   : { publishedAt: -1 },
    popular  : { 'stats.likeCount': -1 },
  };

  const projection = sort === 'relevance' ? { score: { $meta: 'textScore' } } : {};

  const [posts, total] = await Promise.all([
    Post.find(filter, projection)
      .select('-canvasState.fabricJson -__v')
      .populate('author',  'username displayName avatar isVerified badges')
      .populate('channel', 'handle name logo isVerified')
      .sort(sortMap[sort] || sortMap.relevance)
      .skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ]);

  return { query: q, posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

// ─────────────────────────────────────────────
//  3. SEARCH CHANNELS
// ─────────────────────────────────────────────

async function searchChannels(rawQuery, query) {
  const q = sanitise(rawQuery);
  const { page, limit, skip } = paginate(query);

  if (!q || q.length < 2) return { channels: [], pagination: { page, limit, total: 0 } };

  const filter = {
    $text: { $search: q },
    isPublic: true, isActive: true, isDeleted: false,
  };

  const [channels, total] = await Promise.all([
    Channel.find(filter, { score: { $meta: 'textScore' } })
      .select('handle name logo tagline category stats isVerified languages')
      .populate('owner', 'username displayName avatar isVerified')
      .sort({ score: { $meta: 'textScore' }, 'stats.followersCount': -1 })
      .skip(skip).limit(limit).lean(),
    Channel.countDocuments(filter),
  ]);

  return { query: q, channels, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

// ─────────────────────────────────────────────
//  4. SEARCH SERIES
// ─────────────────────────────────────────────

async function searchSeries(rawQuery, query) {
  const q = sanitise(rawQuery);
  const { page, limit, skip } = paginate(query);
  const { language, genre, type } = query;

  if (!q || q.length < 2) return { series: [], pagination: { page, limit, total: 0 } };

  const filter = {
    $text: { $search: q },
    status: 'published', visibility: 'public', isDeleted: false,
  };
  if (language) filter.language = language;
  if (genre)    filter.genre    = genre;
  if (type)     filter.type     = type;

  const [series, total] = await Promise.all([
    Series.find(filter, { score: { $meta: 'textScore' } })
      .select('title type cover language genre completionStatus stats totalChapters')
      .populate('author', 'username displayName avatar isVerified')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip).limit(limit).lean(),
    Series.countDocuments(filter),
  ]);

  return { query: q, series, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

// ─────────────────────────────────────────────
//  5. SEARCH BY TAG
// ─────────────────────────────────────────────

async function searchByTag(tag, query) {
  const { page, limit, skip } = paginate(query);
  const { language, type } = query;
  const cleanTag = sanitise(tag).toLowerCase();

  const cacheKey = `search:tag:${cleanTag}:${language||''}:${type||''}:${page}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const filter = {
    tags: cleanTag,
    status: 'published', visibility: 'public', isDeleted: false,
  };
  if (language) filter.language = language;
  if (type)     filter.type     = type;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .select('-canvasState.fabricJson -__v')
      .populate('author',  'username displayName avatar isVerified')
      .populate('channel', 'handle name logo')
      .sort({ 'stats.likeCount': -1, publishedAt: -1 })
      .skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ]);

  const result = { tag: cleanTag, posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  await setCache(cacheKey, result, SEARCH_CACHE_TTL);
  return result;
}

// ─────────────────────────────────────────────
//  6. AUTOCOMPLETE SUGGESTIONS (fast, Redis-first)
// ─────────────────────────────────────────────

async function autocomplete(rawQuery) {
  const q = sanitise(rawQuery);
  if (!q || q.length < 2) return { suggestions: [] };

  const cacheKey = `search:auto:${q}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const regex = new RegExp(`^${q}`, 'i');

  const [channels, users] = await Promise.all([
    Channel.find({ handle: regex, isPublic: true, isActive: true })
      .select('handle name logo isVerified')
      .limit(5).lean(),
    User.find({ username: regex, isDeleted: false, accountStatus: 'active' })
      .select('username displayName avatar isVerified')
      .limit(3).lean(),
  ]);

  const suggestions = [
    ...channels.map(c => ({ type: 'channel', id: c._id, handle: c.handle, name: c.name, logo: c.logo, isVerified: c.isVerified })),
    ...users.map(u => ({ type: 'user', id: u._id, username: u.username, displayName: u.displayName, avatar: u.avatar, isVerified: u.isVerified })),
  ];

  const result = { query: q, suggestions };
  await setCache(cacheKey, result, 30); // 30s cache for autocomplete
  return result;
}

// ─────────────────────────────────────────────
//  7. TRENDING TAGS
// ─────────────────────────────────────────────

async function getTrendingTags(limit = 20) {
  const cacheKey = `search:trending_tags:${limit}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const tags = await Post.aggregate([
    { $match: { status: 'published', visibility: 'public', isDeleted: false, publishedAt: { $gte: since } } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 }, likes: { $sum: '$stats.likeCount' } } },
    { $addFields: { score: { $add: ['$count', { $multiply: ['$likes', 2] }] } } },
    { $sort: { score: -1 } },
    { $limit: parseInt(limit) },
    { $project: { tag: '$_id', count: 1, score: 1, _id: 0 } },
  ]);

  const result = { tags };
  await setCache(cacheKey, result, 600); // 10 min
  return result;
}

module.exports = { globalSearch, searchPosts, searchChannels, searchSeries, searchByTag, autocomplete, getTrendingTags };
