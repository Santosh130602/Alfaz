'use strict';

const { CronJob }    = require('cron');
const { runDailyRollup } = require('../modules/analytics/services/analytics.service');

// ─────────────────────────────────────────────
//  DAILY ANALYTICS ROLLUP
//  Runs at 01:00 AM every day (after midnight)
//  Processes yesterday's raw views/likes into
//  PostAnalytics and ChannelAnalytics documents
// ─────────────────────────────────────────────

function startAnalyticsJobs() {

  // Daily rollup — runs at 01:00 AM
  const dailyRollup = new CronJob('0 1 * * *', async () => {
    try {
      // Process yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await runDailyRollup(yesterday);
    } catch (err) {
      console.error('[Analytics Job] Daily rollup failed:', err.message);
    }
  }, null, true);

  // Backfill today's partial data — runs every 6 hours
  const partialRollup = new CronJob('0 */6 * * *', async () => {
    try {
      await runDailyRollup(new Date());
    } catch (err) {
      console.error('[Analytics Job] Partial rollup failed:', err.message);
    }
  }, null, true);

  console.log('✅ Analytics cron jobs scheduled (daily rollup @ 01:00, partial every 6h)');
  return { dailyRollup, partialRollup };
}

module.exports = { startAnalyticsJobs };
