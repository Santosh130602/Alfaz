'use strict';

const { CronJob } = require('cron');
const { Post, Series, Trending } = require('../models');

// ─────────────────────────────────────────────
//  TRENDING SCORE ALGORITHM
//  score = (likes×3 + saves×2 + comments×2 + shares×4 + views) / age_hours^1.5
//  Higher weight on shares (viral signal) and likes
// ─────────────────────────────────────────────

function computeScore(stats, publishedAt) {
  const ageHours = Math.max(1, (Date.now() - new Date(publishedAt)) / (1000 * 60 * 60));
  const raw = (
    (stats.likeCount    || 0) * 3 +
    (stats.saveCount    || 0) * 2 +
    (stats.commentCount || 0) * 2 +
    (stats.shareCount   || 0) * 4 +
    (stats.viewCount    || 0) * 1
  );
  return raw / Math.pow(ageHours, 1.5);
}

// ─────────────────────────────────────────────
//  COMPUTE TRENDING FOR A GIVEN PERIOD
// ─────────────────────────────────────────────

async function computeTrending(period) {
  const windowMap = { hourly: 6, daily: 24, weekly: 24 * 7 };
  const hours     = windowMap[period] || 24;
  const since     = new Date(Date.now() - hours * 60 * 60 * 1000);

  console.log(`[Trending] Computing ${period} trending...`);

  const posts = await Post.find({
    status    : 'published',
    visibility: 'public',
    isDeleted : false,
    publishedAt: { $gte: since },
  }).select('stats publishedAt type language genre').lean();

  const scored = posts.map(p => ({
    target    : p._id,
    targetType: 'post',
    score     : computeScore(p.stats, p.publishedAt),
    period,
    type      : p.type,
    language  : p.language,
    genre     : p.genre || null,
    computedAt: new Date(),
    expiresAt : new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
  })).filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 500); // top 500 per period

  if (!scored.length) { console.log(`[Trending] No posts scored for ${period}`); return; }

  // Bulk upsert
  const ops = scored.map(s => ({
    updateOne: {
      filter: { target: s.target, targetType: s.targetType, period },
      update: { $set: s },
      upsert: true,
    },
  }));

  await Trending.bulkWrite(ops, { ordered: false });
  console.log(`[Trending] ✅ ${period}: ${scored.length} posts scored`);
}

// ─────────────────────────────────────────────
//  CRON JOBS
// ─────────────────────────────────────────────

function startTrendingJobs() {
  // Hourly trending — runs every hour at :05
  const hourlyJob = new CronJob('5 * * * *', async () => {
    try { await computeTrending('hourly'); }
    catch(e) { console.error('[Trending] Hourly error:', e.message); }
  }, null, true);

  // Daily trending — runs at 00:10 daily
  const dailyJob = new CronJob('10 0 * * *', async () => {
    try { await computeTrending('daily'); }
    catch(e) { console.error('[Trending] Daily error:', e.message); }
  }, null, true);

  // Weekly trending — runs at 00:15 every Monday
  const weeklyJob = new CronJob('15 0 * * 1', async () => {
    try { await computeTrending('weekly'); }
    catch(e) { console.error('[Trending] Weekly error:', e.message); }
  }, null, true);

  console.log('✅ Trending cron jobs scheduled');
  return { hourlyJob, dailyJob, weeklyJob };
}

module.exports = { startTrendingJobs, computeTrending };
