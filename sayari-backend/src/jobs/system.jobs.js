'use strict';

const { CronJob }    = require('cron');
const { Post }       = require('../models');
const { logger }     = require('../config/logger');
const { checkDriveQuota } = require('../modules/webhook/controllers/drive.webhook');

// ─────────────────────────────────────────────
//  1. SCHEDULED POST RECOVERY
//  Runs every 5 minutes
//  Catches any posts with status=scheduled where
//  scheduledAt has passed but BullMQ job was missed
//  (e.g. after a server restart)
// ─────────────────────────────────────────────

async function recoverMissedScheduledPosts() {
  try {
    const now    = new Date();
    const missed = await Post.find({
      status     : 'scheduled',
      scheduledAt: { $lte: now },
      isDeleted  : false,
    }).select('_id title scheduledAt').lean();

    if (!missed.length) return;

    logger.warn(`[ScheduledPostRecovery] Found ${missed.length} missed scheduled post(s) — publishing now`);

    await Post.updateMany(
      { _id: { $in: missed.map(p => p._id) } },
      {
        $set: {
          status     : 'published',
          publishedAt: now,
        },
      }
    );

    logger.info(`[ScheduledPostRecovery] ✅ Published ${missed.length} recovered post(s)`, {
      postIds: missed.map(p => p._id),
    });

  } catch (err) {
    logger.error('[ScheduledPostRecovery] Error', { error: err.message });
  }
}

// ─────────────────────────────────────────────
//  2. DRIVE QUOTA MONITOR
//  Runs every 6 hours
//  Alerts admin if Drive storage > 80% full
// ─────────────────────────────────────────────

async function runDriveQuotaMonitor() {
  try {
    await checkDriveQuota();
  } catch (err) {
    logger.error('[DriveMonitor] Error', { error: err.message });
  }
}

// ─────────────────────────────────────────────
//  3. EXPIRED BAN CHECKER
//  Runs once a day
//  Unban users whose ban expiry date has passed
// ─────────────────────────────────────────────

async function checkExpiredBans() {
  try {
    const now    = new Date();
    const result = await Post.db.model('User').updateMany(
      {
        accountStatus        : 'banned',
        'banInfo.banExpiresAt': { $lte: now, $ne: null },
      },
      {
        $set: {
          accountStatus           : 'active',
          'banInfo.reason'        : null,
          'banInfo.bannedAt'      : null,
          'banInfo.bannedBy'      : null,
          'banInfo.banExpiresAt'  : null,
        },
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`[BanChecker] ✅ Unbanned ${result.modifiedCount} expired ban(s)`);
    }
  } catch (err) {
    logger.error('[BanChecker] Error', { error: err.message });
  }
}

// ─────────────────────────────────────────────
//  4. NOTIFICATION CLEANUP
//  Runs at 2AM daily
//  Removes notifications older than retention period
// ─────────────────────────────────────────────

async function cleanupOldNotifications() {
  try {
    const { getConfig } = require('../middlewares/system.middleware');
    const retentionDays = (await getConfig('notification_retention_days')) || 60;
    const cutoff        = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const result = await Post.db.model('Notification').deleteMany({
      createdAt: { $lt: cutoff },
      isRead   : true,       // only delete read notifications
    });

    if (result.deletedCount > 0) {
      logger.info(`[NotifCleanup] ✅ Deleted ${result.deletedCount} old notifications`);
    }
  } catch (err) {
    logger.error('[NotifCleanup] Error', { error: err.message });
  }
}

// ─────────────────────────────────────────────
//  START ALL SYSTEM JOBS
// ─────────────────────────────────────────────

function startSystemJobs() {
  // Scheduled post recovery — every 5 minutes
  const scheduledPostJob = new CronJob('*/5 * * * *', recoverMissedScheduledPosts, null, true);

  // Drive quota monitor — every 6 hours
  const driveMonitorJob = new CronJob('0 */6 * * *', runDriveQuotaMonitor, null, true);

  // Expired ban checker — daily at 00:30
  const banCheckerJob = new CronJob('30 0 * * *', checkExpiredBans, null, true);

  // Notification cleanup — daily at 02:00
  const notifCleanupJob = new CronJob('0 2 * * *', cleanupOldNotifications, null, true);

  logger.info('✅ System cron jobs scheduled', {
    jobs: [
      'scheduled-post-recovery (every 5min)',
      'drive-quota-monitor (every 6h)',
      'ban-checker (daily 00:30)',
      'notification-cleanup (daily 02:00)',
    ],
  });

  return { scheduledPostJob, driveMonitorJob, banCheckerJob, notifCleanupJob };
}

module.exports = {
  startSystemJobs,
  recoverMissedScheduledPosts,
  runDriveQuotaMonitor,
  checkExpiredBans,
  cleanupOldNotifications,
};
