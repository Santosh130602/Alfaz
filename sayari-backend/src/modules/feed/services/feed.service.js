'use strict';

const { Post, Series, User, Channel, Follow, Like, Save, Trending } = require('../../../models');
const { setCache, getCache } = require('../../../config/redis');

const FEED_CACHE_TTL     = 120;  // 2 min
const TRENDING_CACHE_TTL = 300;  // 5 min

function paginate(q) {
  const page  = Math.max(1, parseInt(q.page  || 1));
  const limit = Math.min(30, Math.max(1, parseInt(q.limit || 15)));
  return { page, limit, skip: (page - 1) * limit };
}

// ─────────────────────────────────────────────
//  1. FOR YOU FEED
//  Shows posts from followed users + personalised by taste
// ─────────────────────────────────────────────

async function getForYouFeed(userId, query) {
  const { page, limit, skip } = paginate(query);
  const { type, language, mood } = query;

  const cacheKey = `feed:fy:${userId}:${page}:${type||''}:${language||''}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  // Get who the user follows
  const follows    = await Follow.find({ follower: userId }).select('following').lean();
  const followedIds = follows.map(f => f.following);

  // Get user's taste from their recent likes (top 10 moods/genres)
  const recentLikes = await Like.find({ user: userId, targetType: 'post' })
    .sort({ createdAt: -1 }).limit(50).select('target').lean();
  const likedPostIds = recentLikes.map(l => l.target);

  let tasteMoods = [], tasteGenres = [], tasteLangs = [];
  if (likedPostIds.length) {
    const likedPosts = await Post.find({ _id: { $in: likedPostIds } }).select('mood genre language').lean();
    const moodCount  = {}, genreCount = {}, langCount = {};
    likedPosts.forEach(p => {
      p.mood?.forEach(m => { moodCount[m]  = (moodCount[m]  || 0) + 1; });
      if (p.genre)    genreCount[p.genre]   = (genreCount[p.genre]   || 0) + 1;
      if (p.language) langCount[p.language] = (langCount[p.language] || 0) + 1;
    });
    tasteMoods  = Object.entries(moodCount).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>e[0]);
    tasteGenres = Object.entries(genreCount).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]);
    tasteLangs  = Object.entries(langCount).sort((a,b)=>b[1]-a[1]).slice(0,2).map(e=>e[0]);
  }

  // Build query: followed users first, then taste-matched
  const baseFilter = { status:'published', visibility:'public', isDeleted:false };
  if (type)     baseFilter.type     = type;
  if (language) baseFilter.language = language;
  if (mood)     baseFilter.mood     = { $in: Array.isArray(mood) ? mood : [mood] };

  const followedFilter = { ...baseFilter, author: { $in: followedIds } };
  const tasteFilter    = {
    ...baseFilter,
    author: { $nin: followedIds, $ne: userId }, // exclude followed + self
    ...(tasteMoods.length  ? { mood:  { $in: tasteMoods } } : {}),
    ...(tasteGenres.length ? { genre: { $in: tasteGenres } } : {}),
    ...(tasteLangs.length  ? { language: { $in: tasteLangs } } : {}),
  };

  const [followedPosts, tastePosts] = await Promise.all([
    Post.find(followedFilter)
      .select('-canvasState.fabricJson -__v')
      .populate('author',  'username displayName avatar isVerified badges')
      .populate('channel', 'handle name logo isVerified')
      .sort({ publishedAt: -1 })
      .limit(Math.ceil(limit * 0.6)).lean(),
    Post.find(tasteFilter)
      .select('-canvasState.fabricJson -__v')
      .populate('author',  'username displayName avatar isVerified badges')
      .populate('channel', 'handle name logo isVerified')
      .sort({ 'stats.likeCount': -1, publishedAt: -1 })
      .limit(Math.ceil(limit * 0.4)).lean(),
  ]);

  // Merge and deduplicate
  const seen = new Set();
  const posts = [...followedPosts, ...tastePosts].filter(p => {
    const id = String(p._id);
    if (seen.has(id)) return false;
    seen.add(id); return true;
  }).slice(0, limit);

  const total = await Post.countDocuments({ $or: [followedFilter, tasteFilter] });
  const result = { posts, feedType: 'for_you', pagination: { page, limit, total: Math.min(total, 500) } };
  await setCache(cacheKey, result, FEED_CACHE_TTL);
  return result;
}

// ─────────────────────────────────────────────
//  2. TRENDING FEED
// ─────────────────────────────────────────────

async function getTrending(query) {
  const { page, limit, skip } = paginate(query);
  const { type, language, genre, period = 'daily' } = query;

  const cacheKey = `feed:trending:${period}:${type||''}:${language||''}:${genre||''}:${page}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const trendFilter = { targetType: 'post', period };
  if (language) trendFilter.language = language;
  if (genre)    trendFilter.genre    = genre;
  if (type)     trendFilter.type     = type;

  const trendingDocs = await Trending.find(trendFilter)
    .sort({ score: -1 }).skip(skip).limit(limit).lean();

  if (!trendingDocs.length) {
    // Fallback: compute on the fly if trending table empty
    return _fallbackTrending(query);
  }

  const postIds = trendingDocs.map(t => t.target);
  const posts   = await Post.find({ _id: { $in: postIds }, isDeleted: false })
    .select('-canvasState.fabricJson -__v')
    .populate('author',  'username displayName avatar isVerified badges')
    .populate('channel', 'handle name logo').lean();

  // Maintain trending order
  const postMap = posts.reduce((a, p) => { a[p._id] = p; return a; }, {});
  const ordered = postIds.map(id => postMap[id]).filter(Boolean);

  const result = { posts: ordered, period, pagination: { page, limit } };
  await setCache(cacheKey, result, TRENDING_CACHE_TTL);
  return result;
}

async function _fallbackTrending(query) {
  const { page, limit, skip } = paginate(query);
  const { type, language, genre } = query;
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const filter = { status:'published', visibility:'public', isDeleted:false, publishedAt: { $gte: since } };
  if (type)     filter.type     = type;
  if (language) filter.language = language;
  if (genre)    filter.genre    = genre;

  const posts = await Post.find(filter)
    .select('-canvasState.fabricJson -__v')
    .populate('author',  'username displayName avatar isVerified badges')
    .populate('channel', 'handle name logo')
    .sort({ 'stats.likeCount': -1, 'stats.viewCount': -1 })
    .skip(skip).limit(limit).lean();

  return { posts, period: 'weekly_fallback', pagination: { page, limit } };
}

// ─────────────────────────────────────────────
//  3. NEW RELEASES (from followed channels)
// ─────────────────────────────────────────────

async function getNewReleases(userId, query) {
  const { page, limit, skip } = paginate(query);
  const follows = await Follow.find({ follower: userId }).select('following').lean();
  const followedIds = follows.map(f => f.following);
  if (!followedIds.length) return { posts: [], pagination: { page, limit, total: 0 } };

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [posts, total] = await Promise.all([
    Post.find({ author: { $in: followedIds }, status: 'published', visibility: 'public', isDeleted: false, publishedAt: { $gte: since } })
      .select('-canvasState.fabricJson -__v')
      .populate('author',  'username displayName avatar isVerified')
      .populate('channel', 'handle name logo')
      .sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments({ author: { $in: followedIds }, status:'published', visibility:'public', isDeleted:false, publishedAt:{ $gte: since } }),
  ]);

  return { posts, pagination: { page, limit, total, pages: Math.ceil(total/limit) } };
}

// ─────────────────────────────────────────────
//  4. TOP CREATORS
// ─────────────────────────────────────────────

async function getTopCreators(query) {
  const { limit = 20, language } = query;

  const cacheKey = `feed:top_creators:${language||'all'}:${limit}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const filter = { isDeleted: false, accountStatus: 'active', role: { $in: ['creator','admin'] } };
  if (language) filter.language = language;

  const creators = await User.find(filter)
    .select('username displayName avatar isVerified badges stats channel language')
    .populate('channel', 'handle name logo stats category')
    .sort({ 'stats.followersCount': -1, 'stats.totalLikes': -1 })
    .limit(parseInt(limit)).lean();

  await setCache(cacheKey, { creators }, TRENDING_CACHE_TTL);
  return { creators };
}

// ─────────────────────────────────────────────
//  5. MOOD FEED
// ─────────────────────────────────────────────

async function getMoodFeed(mood, query) {
  const { page, limit, skip } = paginate(query);
  const { language } = query;

  const filter = { status:'published', visibility:'public', isDeleted:false, mood: { $in: [mood] } };
  if (language) filter.language = language;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .select('-canvasState.fabricJson -__v')
      .populate('author',  'username displayName avatar isVerified')
      .populate('channel', 'handle name logo')
      .sort({ 'stats.likeCount': -1, publishedAt: -1 })
      .skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ]);

  return { posts, mood, pagination: { page, limit, total, pages: Math.ceil(total/limit) } };
}

// ─────────────────────────────────────────────
//  6. EXPLORE (public, no auth needed)
// ─────────────────────────────────────────────

async function getExplore(query) {
  const { page, limit, skip } = paginate(query);
  const { type, language, genre, sort = 'trending' } = query;

  const cacheKey = `feed:explore:${type||''}:${language||''}:${genre||''}:${sort}:${page}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const filter = { status:'published', visibility:'public', isDeleted:false };
  if (type)     filter.type     = type;
  if (language) filter.language = language;
  if (genre)    filter.genre    = genre;

  const sortMap = {
    trending: { 'stats.likeCount': -1, 'stats.viewCount': -1 },
    newest  : { publishedAt: -1 },
    popular : { 'stats.saveCount': -1, 'stats.likeCount': -1 },
  };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .select('-canvasState.fabricJson -__v')
      .populate('author',  'username displayName avatar isVerified badges')
      .populate('channel', 'handle name logo isVerified')
      .sort(sortMap[sort] || sortMap.trending)
      .skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ]);

  const result = { posts, pagination: { page, limit, total, pages: Math.ceil(total/limit) } };
  await setCache(cacheKey, result, FEED_CACHE_TTL);
  return result;
}

module.exports = { getForYouFeed, getTrending, getNewReleases, getTopCreators, getMoodFeed, getExplore };
