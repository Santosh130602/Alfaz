'use strict';

const { Post, Series, Follow, Like, Comment, Save, View,
        PostAnalytics, ChannelAnalytics, PlatformAnalytics, Channel, User } = require('../../../models');
const { setCache, getCache } = require('../../../config/redis');

const CACHE_TTL = 300; // 5 min

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function dateRange(period) {
  const now  = new Date();
  const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[period] || 30;
  const since = new Date(now - days * 24 * 60 * 60 * 1000);
  return { since, now, days };
}

function fillMissingDays(data, since, now, valueKey = 'count') {
  // Build a map from date string → value
  const map = {};
  data.forEach(d => { map[d._id] = d[valueKey] || 0; });

  const result = [];
  const cursor = new Date(since);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= now) {
    const key = cursor.toISOString().split('T')[0];
    result.push({ date: key, [valueKey]: map[key] || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

// ─────────────────────────────────────────────
//  1. CHANNEL OVERVIEW SUMMARY
//  The top-level numbers shown on the dashboard
// ─────────────────────────────────────────────

async function getChannelOverview(channelId, userId, period = '30d') {
  const cacheKey = `analytics:overview:${channelId}:${period}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const { since } = dateRange(period);

  const [
    totalPosts,
    publishedPosts,
    totalSeries,
    totalFollowers,
    newFollowers,
    totalViews,
    totalLikes,
    totalComments,
    totalSaves,
    totalAudioPlays,
  ] = await Promise.all([
    Post.countDocuments({ channel: channelId, isDeleted: false }),
    Post.countDocuments({ channel: channelId, isDeleted: false, status: 'published' }),
    Series.countDocuments({ channel: channelId, isDeleted: false }),
    Follow.countDocuments({ following: userId }),
    Follow.countDocuments({ following: userId, createdAt: { $gte: since } }),

    // Sum all view counts from published posts in this period
    Post.aggregate([
      { $match: { channel: channelId, isDeleted: false, publishedAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$stats.viewCount' } } },
    ]),
    Post.aggregate([
      { $match: { channel: channelId, isDeleted: false, publishedAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$stats.likeCount' } } },
    ]),
    Post.aggregate([
      { $match: { channel: channelId, isDeleted: false, publishedAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$stats.commentCount' } } },
    ]),
    Post.aggregate([
      { $match: { channel: channelId, isDeleted: false, publishedAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$stats.saveCount' } } },
    ]),
    Post.aggregate([
      { $match: { channel: channelId, type: 'audio', isDeleted: false, publishedAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: '$stats.playCount' } } },
    ]),
  ]);

  const result = {
    period,
    posts    : { total: totalPosts, published: publishedPosts, draft: totalPosts - publishedPosts },
    series   : { total: totalSeries },
    followers: { total: totalFollowers, new: newFollowers },
    engagement: {
      views     : totalViews[0]?.total     || 0,
      likes     : totalLikes[0]?.total     || 0,
      comments  : totalComments[0]?.total  || 0,
      saves     : totalSaves[0]?.total     || 0,
      audioPlays: totalAudioPlays[0]?.total || 0,
    },
  };

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

// ─────────────────────────────────────────────
//  2. FOLLOWER GROWTH CHART (daily)
// ─────────────────────────────────────────────

async function getFollowerGrowth(userId, period = '30d') {
  const cacheKey = `analytics:followers:${userId}:${period}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const { since, now } = dateRange(period);

  const raw = await Follow.aggregate([
    { $match: { following: userId, createdAt: { $gte: since } } },
    { $group: {
      _id  : { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      count: { $sum: 1 },
    }},
    { $sort: { _id: 1 } },
  ]);

  const data = fillMissingDays(raw, since, now, 'count');

  // Compute running total
  const totalBefore = await Follow.countDocuments({ following: userId, createdAt: { $lt: since } });
  let running = totalBefore;
  const withTotal = data.map(d => {
    running += d.count;
    return { ...d, total: running };
  });

  const result = { period, data: withTotal, totalNow: running };
  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

// ─────────────────────────────────────────────
//  3. VIEWS CHART (daily)
// ─────────────────────────────────────────────

async function getViewsChart(channelId, period = '30d') {
  const cacheKey = `analytics:views:${channelId}:${period}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const { since, now } = dateRange(period);

  // Use PostAnalytics rollup if available, else fall back to raw View collection
  const rollupData = await PostAnalytics.aggregate([
    { $match: { channel: channelId, date: { $gte: since } } },
    { $group: {
      _id        : { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
      views      : { $sum: '$views' },
      uniqueViews: { $sum: '$uniqueViews' },
      likes      : { $sum: '$likes' },
      comments   : { $sum: '$comments' },
    }},
    { $sort: { _id: 1 } },
  ]);

  let data;
  if (rollupData.length > 0) {
    const filled = fillMissingDays(rollupData, since, now, 'views');
    // Merge all fields
    const map = {};
    rollupData.forEach(d => { map[d._id] = d; });
    data = filled.map(d => ({
      date       : d.date,
      views      : map[d.date]?.views       || 0,
      uniqueViews: map[d.date]?.uniqueViews || 0,
      likes      : map[d.date]?.likes       || 0,
      comments   : map[d.date]?.comments    || 0,
    }));
  } else {
    // Fallback: aggregate from View collection directly
    const postIds = await Post.find({ channel: channelId }).select('_id').lean();
    const ids = postIds.map(p => p._id);

    const raw = await View.aggregate([
      { $match: { target: { $in: ids }, targetType: 'post', createdAt: { $gte: since } } },
      { $group: {
        _id  : { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        views: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);
    data = fillMissingDays(raw, since, now, 'views');
  }

  const result = { period, data };
  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

// ─────────────────────────────────────────────
//  4. TOP PERFORMING POSTS
// ─────────────────────────────────────────────

async function getTopPosts(channelId, period = '30d', sortBy = 'views', limit = 10) {
  const cacheKey = `analytics:top_posts:${channelId}:${period}:${sortBy}:${limit}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const { since } = dateRange(period);

  const sortMap = {
    views   : { 'stats.viewCount'   : -1 },
    likes   : { 'stats.likeCount'   : -1 },
    comments: { 'stats.commentCount': -1 },
    saves   : { 'stats.saveCount'   : -1 },
    plays   : { 'stats.playCount'   : -1 },
    newest  : { publishedAt         : -1 },
  };

  const posts = await Post.find({
    channel    : channelId,
    isDeleted  : false,
    status     : 'published',
    publishedAt: { $gte: since },
  })
    .select('title type renderedImage audio.coverImage stats publishedAt language genre mood tags series chapterNumber')
    .populate('series', 'title')
    .sort(sortMap[sortBy] || sortMap.views)
    .limit(parseInt(limit))
    .lean();

  const result = { period, sortBy, posts };
  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

// ─────────────────────────────────────────────
//  5. ENGAGEMENT BREAKDOWN (pie chart data)
// ─────────────────────────────────────────────

async function getEngagementBreakdown(channelId, period = '30d') {
  const cacheKey = `analytics:engagement:${channelId}:${period}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const { since } = dateRange(period);

  const [reactionBreakdown, contentTypeBreakdown, languageBreakdown, moodBreakdown, sourceBreakdown] = await Promise.all([
    // Reaction types on posts
    Like.aggregate([
      { $lookup: { from: 'posts', localField: 'target', foreignField: '_id', as: 'post' } },
      { $match: { targetType: 'post', createdAt: { $gte: since }, 'post.channel': channelId } },
      { $group: { _id: '$reactionType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Content type performance
    Post.aggregate([
      { $match: { channel: channelId, isDeleted: false, publishedAt: { $gte: since } } },
      { $group: {
        _id     : '$type',
        posts   : { $sum: 1 },
        views   : { $sum: '$stats.viewCount' },
        likes   : { $sum: '$stats.likeCount' },
        comments: { $sum: '$stats.commentCount' },
      }},
      { $sort: { views: -1 } },
    ]),

    // Language breakdown of content
    Post.aggregate([
      { $match: { channel: channelId, isDeleted: false, status: 'published' } },
      { $group: { _id: '$language', count: { $sum: 1 }, views: { $sum: '$stats.viewCount' } } },
      { $sort: { views: -1 } },
    ]),

    // Top moods
    Post.aggregate([
      { $match: { channel: channelId, isDeleted: false, publishedAt: { $gte: since } } },
      { $unwind: '$mood' },
      { $group: { _id: '$mood', count: { $sum: 1 }, views: { $sum: '$stats.viewCount' } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]),

    // Traffic sources
    (async () => {
      const postIds = (await Post.find({ channel: channelId }).select('_id').lean()).map(p => p._id);
      return View.aggregate([
        { $match: { target: { $in: postIds }, targetType: 'post', createdAt: { $gte: since } } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
    })(),
  ]);

  const result = {
    period,
    reactions   : reactionBreakdown,
    contentTypes: contentTypeBreakdown,
    languages   : languageBreakdown,
    moods       : moodBreakdown,
    sources     : sourceBreakdown,
  };

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

// ─────────────────────────────────────────────
//  6. AUDIO ANALYTICS (for audio posts)
// ─────────────────────────────────────────────

async function getAudioAnalytics(channelId, period = '30d') {
  const cacheKey = `analytics:audio:${channelId}:${period}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const { since } = dateRange(period);

  const postIds = (await Post.find({ channel: channelId, type: 'audio' }).select('_id').lean()).map(p => p._id);
  if (!postIds.length) return { period, totalPlays: 0, avgCompletion: 0, topAudio: [], playsByDay: [] };

  const [topAudio, playsByDay, completionData] = await Promise.all([
    Post.find({ channel: channelId, type: 'audio', isDeleted: false, publishedAt: { $gte: since } })
      .select('title audio.coverImage audio.duration stats publishedAt')
      .sort({ 'stats.playCount': -1 })
      .limit(10).lean(),

    View.aggregate([
      { $match: { target: { $in: postIds }, targetType: 'post', createdAt: { $gte: since }, audioProgress: { $exists: true, $ne: null } } },
      { $group: {
        _id   : { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        plays : { $sum: 1 },
        avgProgress: { $avg: '$audioProgress' },
      }},
      { $sort: { _id: 1 } },
    ]),

    View.aggregate([
      { $match: { target: { $in: postIds }, targetType: 'post', audioProgress: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgProgress: { $avg: '$audioProgress' }, totalPlays: { $sum: 1 } } },
    ]),
  ]);

  const result = {
    period,
    totalPlays   : completionData[0]?.totalPlays  || 0,
    avgCompletion: completionData[0]?.avgProgress || 0,
    topAudio,
    playsByDay,
  };

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

// ─────────────────────────────────────────────
//  7. SERIES ANALYTICS
// ─────────────────────────────────────────────

async function getSeriesAnalytics(channelId, period = '30d') {
  const cacheKey = `analytics:series:${channelId}:${period}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const { since } = dateRange(period);

  const seriesList = await Series.find({ channel: channelId, isDeleted: false })
    .select('title type cover completionStatus stats totalChapters publishedChapters createdAt')
    .sort({ 'stats.viewCount': -1 })
    .lean();

  // For each series, get chapter read-through rates
  const enriched = await Promise.all(seriesList.map(async s => {
    const chapters = await Post.find({ series: s._id, isDeleted: false, status: 'published' })
      .select('chapterNumber chapterTitle stats.viewCount publishedAt')
      .sort({ chapterNumber: 1 })
      .lean();

    return { ...s, chapters };
  }));

  const result = { period, series: enriched };
  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

// ─────────────────────────────────────────────
//  8. INDIVIDUAL POST ANALYTICS (deep dive)
// ─────────────────────────────────────────────

async function getPostAnalytics(postId, userId, period = '30d') {
  const cacheKey = `analytics:post:${postId}:${period}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const { since, now } = dateRange(period);

  const post = await Post.findOne({ _id: postId, author: userId, isDeleted: false })
    .select('title type stats publishedAt renderedImage audio language mood genre tags series chapterNumber')
    .lean();
  if (!post) return null;

  const [dailyViews, dailyLikes, reactionBreakdown, hourlyDistribution, deviceBreakdown] = await Promise.all([
    // Daily views
    View.aggregate([
      { $match: { target: postId, targetType: 'post', createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // Daily likes
    Like.aggregate([
      { $match: { target: postId, targetType: 'post', createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // Reaction type breakdown
    Like.aggregate([
      { $match: { target: postId, targetType: 'post' } },
      { $group: { _id: '$reactionType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Views by hour of day (to find best posting time)
    View.aggregate([
      { $match: { target: postId, targetType: 'post', createdAt: { $gte: since } } },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // Traffic source breakdown
    View.aggregate([
      { $match: { target: postId, targetType: 'post', createdAt: { $gte: since } } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const result = {
    post,
    period,
    dailyViews : fillMissingDays(dailyViews, since, now, 'count'),
    dailyLikes : fillMissingDays(dailyLikes, since, now, 'count'),
    reactions  : reactionBreakdown,
    hourly     : Array.from({ length: 24 }, (_, h) => ({
      hour : h,
      count: hourlyDistribution.find(x => x._id === h)?.count || 0,
    })),
    sources    : deviceBreakdown,
  };

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}

// ─────────────────────────────────────────────
//  9. BEST POSTING TIMES
//  Analyses when user's posts get most engagement
// ─────────────────────────────────────────────

async function getBestPostingTimes(userId) {
  const cacheKey = `analytics:best_times:${userId}`;
  const cached   = await getCache(cacheKey);
  if (cached) return cached;

  const postIds = (await Post.find({ author: userId, isDeleted: false, status: 'published' }).select('_id').lean())
    .map(p => p._id);

  if (!postIds.length) return { bestHours: [], bestDays: [] };

  const [byHour, byDayOfWeek] = await Promise.all([
    View.aggregate([
      { $match: { target: { $in: postIds }, targetType: 'post' } },
      { $group: {
        _id  : { $hour: '$createdAt' },
        views: { $sum: 1 },
      }},
      { $sort: { views: -1 } },
    ]),
    View.aggregate([
      { $match: { target: { $in: postIds }, targetType: 'post' } },
      { $group: {
        _id  : { $dayOfWeek: '$createdAt' }, // 1=Sun, 2=Mon...7=Sat
        views: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]),
  ]);

  const dayNames = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const result = {
    bestHours: byHour.slice(0, 5).map(h => ({ hour: h._id, views: h.views, label: `${h._id}:00` })),
    bestDays : byDayOfWeek.map(d => ({ day: d._id, name: dayNames[d._id], views: d.views })),
  };

  await setCache(cacheKey, result, 3600); // 1 hour
  return result;
}

// ─────────────────────────────────────────────
//  10. DAILY ANALYTICS ROLLUP (called by cron)
//  Aggregates raw views/likes into PostAnalytics
// ─────────────────────────────────────────────

async function runDailyRollup(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  console.log(`[Analytics] Running daily rollup for ${start.toISOString().split('T')[0]}`);

  // Get all channels that had activity
  const activeChannels = await PostAnalytics.distinct('channel', { date: { $gte: start, $lt: end } });
  const allChannels = await Channel.find({ isActive: true, isDeleted: false }).select('_id owner').lean();

  for (const ch of allChannels) {
    const posts = await Post.find({ channel: ch._id, isDeleted: false }).select('_id').lean();
    const postIds = posts.map(p => p._id);
    if (!postIds.length) continue;

    const [views, likes, comments] = await Promise.all([
      View.countDocuments({ target: { $in: postIds }, targetType: 'post', createdAt: { $gte: start, $lt: end } }),
      Like.countDocuments({ target: { $in: postIds }, targetType: 'post', createdAt: { $gte: start, $lt: end } }),
      Comment.countDocuments({ postId: { $in: postIds }, createdAt: { $gte: start, $lt: end } }),
    ]);

    const newFollowers = await Follow.countDocuments({ following: ch.owner, createdAt: { $gte: start, $lt: end } });
    const newPosts     = await Post.countDocuments({ channel: ch._id, createdAt: { $gte: start, $lt: end } });

    await ChannelAnalytics.findOneAndUpdate(
      { channel: ch._id, date: start },
      { $set: {
        owner: ch.owner, date: start,
        totalPostViews: views,
        totalLikes    : likes,
        totalComments : comments,
        newFollowers,
        newPosts,
        updatedAt     : new Date(),
      }},
      { upsert: true }
    );
  }

  // Platform-wide rollup
  const [totalViews, totalLikes, totalComments, newUsers, newPosts] = await Promise.all([
    View.countDocuments({ targetType: 'post', createdAt: { $gte: start, $lt: end } }),
    Like.countDocuments({ targetType: 'post', createdAt: { $gte: start, $lt: end } }),
    Comment.countDocuments({ createdAt: { $gte: start, $lt: end }, isDeleted: false }),
    User.countDocuments({ createdAt: { $gte: start, $lt: end }, isDeleted: false }),
    Post.countDocuments({ createdAt: { $gte: start, $lt: end }, isDeleted: false }),
  ]);

  await PlatformAnalytics.findOneAndUpdate(
    { date: start },
    { $set: { date: start, totalViews, totalLikes, totalComments, newUsers, newPosts, updatedAt: new Date() } },
    { upsert: true }
  );

  console.log(`[Analytics] ✅ Rollup complete for ${start.toISOString().split('T')[0]}`);
}

module.exports = {
  getChannelOverview,
  getFollowerGrowth,
  getViewsChart,
  getTopPosts,
  getEngagementBreakdown,
  getAudioAnalytics,
  getSeriesAnalytics,
  getPostAnalytics,
  getBestPostingTimes,
  runDailyRollup,
};
