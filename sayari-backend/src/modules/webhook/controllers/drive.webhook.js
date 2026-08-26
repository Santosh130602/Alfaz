'use strict';

const { DriveToken } = require('../../../models');
const { logger }     = require('../../../config/logger');
const { catchAsync, sendSuccess } = require('../../../utils/appError');

// ─────────────────────────────────────────────
//  GOOGLE DRIVE WEBHOOK
//  Drive sends push notifications when files change
//  Useful for: detecting external deletions, quota changes
//
//  Setup: Use Google Drive API to register a push channel
//  POST https://www.googleapis.com/drive/v3/changes/watch
// ─────────────────────────────────────────────

exports.handleDriveNotification = catchAsync(async (req, res) => {
  // Drive sends metadata in headers, not body
  const resourceState = req.headers['x-goog-resource-state'];
  const resourceId    = req.headers['x-goog-resource-id'];
  const channelId     = req.headers['x-goog-channel-id'];
  const expiration    = req.headers['x-goog-channel-expiration'];

  logger.debug('[Drive Webhook] Notification received', {
    resourceState,
    resourceId,
    channelId,
    expiration,
  });

  switch (resourceState) {
    // ── Initial sync confirmation ─────────────
    case 'sync':
      logger.info('[Drive Webhook] Push channel registered successfully', { channelId });
      break;

    // ── File changed / deleted ─────────────────
    case 'change':
    case 'update': {
      logger.info('[Drive Webhook] File change detected', { resourceId });
      // Could trigger a quota check
      await checkDriveQuota();
      break;
    }

    // ── Channel expiring soon ─────────────────
    case 'expiry': {
      logger.warn('[Drive Webhook] Push channel expiring soon — renew required', {
        channelId,
        expiration,
      });
      // TODO: auto-renew the push channel registration
      break;
    }

    default:
      logger.debug('[Drive Webhook] Unhandled resource state', { resourceState });
  }

  // Google Drive requires a 200 response
  res.status(200).end();
});

// ─────────────────────────────────────────────
//  DRIVE QUOTA CHECKER
//  Called periodically and on change events
// ─────────────────────────────────────────────

async function checkDriveQuota() {
  try {
    const driveToken = await DriveToken.findOne({ label: 'primary', isActive: true });
    if (!driveToken) return;

    // Quota warning threshold
    const WARNING_PCT = parseFloat(process.env.DRIVE_QUOTA_WARNING_PCT || '0.80');

    if (driveToken.driveQuotaTotal > 0) {
      const usedPct = driveToken.driveQuotaUsed / driveToken.driveQuotaTotal;

      if (usedPct >= WARNING_PCT) {
        logger.warn('[Drive] Storage quota warning!', {
          used     : `${(driveToken.driveQuotaUsed / 1e9).toFixed(2)} GB`,
          total    : `${(driveToken.driveQuotaTotal / 1e9).toFixed(2)} GB`,
          usedPct  : `${(usedPct * 100).toFixed(1)}%`,
        });

        // Send admin notification (lazy require to avoid circular deps)
        const { Notification, User } = require('../../../models');
        const admins = await User.find({ role: { $in: ['admin','superadmin'] }, isDeleted: false })
          .select('_id').lean();

        const pct = (usedPct * 100).toFixed(1);
        await Notification.insertMany(admins.map(a => ({
          recipient: a._id,
          type     : 'admin_announcement',
          title    : '⚠️ Drive Storage Warning',
          body     : `Google Drive usage is at ${pct}%. Please free up space or upgrade storage.`,
          isAdmin  : true,
          channels : { inApp: { sent: true, sentAt: new Date() }, push: { sent: false }, whatsapp: { sent: false } },
        })));
      }
    }
  } catch (err) {
    logger.error('[Drive] Quota check failed', { error: err.message });
  }
}

module.exports.checkDriveQuota = checkDriveQuota;
