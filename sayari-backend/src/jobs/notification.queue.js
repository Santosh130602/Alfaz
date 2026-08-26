'use strict';

const { Queue, Worker, QueueEvents } = require('bullmq');
const { sendPush, sendPushMulticast } = require('../config/firebase');
const { sendNotificationMessage, TEMPLATES } = require('../config/whatsapp');
const { emitToUser } = require('../sockets/socket');
const { User, Notification } = require('../models');
const { getCache, setCache } = require('../config/redis');

// ─────────────────────────────────────────────
//  REDIS CONNECTION FOR BULLMQ
// ─────────────────────────────────────────────

const connection = {
  host    : process.env.REDIS_HOST     || 'redis',
  port    : parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

// ─────────────────────────────────────────────
//  QUEUES
// ─────────────────────────────────────────────

const notifQueue = new Queue('notifications', {
  connection,
  defaultJobOptions: {
    attempts     : 3,
    backoff      : { type: 'exponential', delay: 3000 },
    removeOnComplete: { count: 500 },
    removeOnFail : { count: 200 },
  },
});

const broadcastQueue = new Queue('broadcasts', {
  connection,
  defaultJobOptions: {
    attempts     : 2,
    backoff      : { type: 'fixed', delay: 10000 },
    removeOnComplete: { count: 50 },
    removeOnFail : { count: 50 },
  },
});

// ─────────────────────────────────────────────
//  JOB ADDERS
// ─────────────────────────────────────────────

/**
 * Queue a notification for a single user
 * @param {string} recipientId
 * @param {object} payload  — { type, title, body, actor, meta, channels }
 */
async function queueNotification(recipientId, payload) {
  return notifQueue.add('send-notification', { recipientId, ...payload }, {
    priority: payload.priority || 2,
  });
}

/**
 * Queue an admin broadcast announcement
 * @param {string} announcementId
 * @param {string[]} recipientIds
 */
async function queueBroadcast(announcementId, recipientIds) {
  // Split into chunks of 1000 for parallel processing
  const chunkSize = 1000;
  const jobs = [];
  for (let i = 0; i < recipientIds.length; i += chunkSize) {
    jobs.push(
      broadcastQueue.add('broadcast-chunk', {
        announcementId,
        recipientIds: recipientIds.slice(i, i + chunkSize),
        chunkIndex  : Math.floor(i / chunkSize),
      })
    );
  }
  return Promise.all(jobs);
}

// ─────────────────────────────────────────────
//  NOTIFICATION WORKER
//  Handles in-app + push + WhatsApp delivery
// ─────────────────────────────────────────────

const notifWorker = new Worker('notifications', async (job) => {
  const {
    recipientId, type, title, body,
    actor, meta = {}, channels = {},
  } = job.data;

  // Fetch recipient with preferences and device tokens
  const recipient = await User.findById(recipientId)
    .select('notificationPrefs deviceTokens whatsapp accountStatus isDeleted username displayName')
    .lean();

  if (!recipient || recipient.isDeleted || recipient.accountStatus !== 'active') {
    return { skipped: true, reason: 'user_inactive' };
  }

  const prefs = recipient.notificationPrefs || {};
  const results = { inApp: null, push: null, whatsapp: null };

  // ── 1. Save to DB (in-app notification) ────
  const notifDoc = await Notification.create({
    recipient: recipientId,
    type, title, body,
    actor: actor || null,
    meta,
    isAdmin: channels.isAdmin || false,
    channels: {
      inApp: { sent: false },
      push  : { sent: false },
      whatsapp: { sent: false },
    },
  });

  // ── 2. In-app via Socket.io ──────────────
  if (prefs.newFollower !== false || channels.isAdmin) {
    const delivered = await emitToUser(recipientId, 'notification', {
      _id  : notifDoc._id,
      type, title, body,
      actor, meta,
      createdAt: notifDoc.createdAt,
    });

    await Notification.findByIdAndUpdate(notifDoc._id, {
      'channels.inApp.sent'  : true,
      'channels.inApp.sentAt': new Date(),
    });

    results.inApp = { delivered };
  }

  // ── 3. Push notification (FCM) ──────────
  const shouldPush = prefs.push !== false && recipient.deviceTokens?.length;
  if (shouldPush) {
    const tokens  = recipient.deviceTokens.map(d => d.token);
    const pushRes = await sendPushMulticast(tokens, {
      title, body,
      imageUrl: meta.imageUrl || null,
      data    : {
        type,
        notificationId: String(notifDoc._id),
        deepLink       : meta.deepLink || '',
        postId         : meta.postId   ? String(meta.postId)   : '',
        seriesId       : meta.seriesId ? String(meta.seriesId) : '',
      },
    });

    // Remove stale tokens from user document
    if (pushRes.staleTokens?.length) {
      await User.findByIdAndUpdate(recipientId, {
        $pull: { deviceTokens: { token: { $in: pushRes.staleTokens } } },
      });
    }

    await Notification.findByIdAndUpdate(notifDoc._id, {
      'channels.push.sent'    : pushRes.sent > 0,
      'channels.push.sentAt'  : new Date(),
      'channels.push.platform': 'multicast',
    });

    results.push = { sent: pushRes.sent, failed: pushRes.failed };
  }

  // ── 4. WhatsApp notification ─────────────
  const waNumber = recipient.whatsapp?.number;
  const shouldWA = prefs.whatsapp === true && waNumber && recipient.whatsapp?.isVerified;

  if (shouldWA) {
    // Map notification type → WhatsApp template
    const templateMap = {
      new_follower : TEMPLATES.NEW_FOLLOWER,
      new_chapter  : TEMPLATES.NEW_CHAPTER,
      account_warning: TEMPLATES.ACCOUNT_WARNING,
    };
    const template = templateMap[type];

    if (template) {
      const waRes = await sendNotificationMessage(waNumber, template, [
        { name: 'title', value: title },
        { name: 'body',  value: body  },
      ]);

      await Notification.findByIdAndUpdate(notifDoc._id, {
        'channels.whatsapp.sent'          : waRes.sent,
        'channels.whatsapp.sentAt'        : new Date(),
        'channels.whatsapp.messageId'     : waRes.messageId || null,
        'channels.whatsapp.deliveryStatus': waRes.sent ? 'sent' : 'failed',
      });

      results.whatsapp = waRes;
    }
  }

  // ── 5. Update unread count in Redis ──────
  const countKey = `notif_unread:${recipientId}`;
  const current  = await getCache(countKey);
  await setCache(countKey, (parseInt(current || 0) + 1), 86400); // 24h

  return { notificationId: notifDoc._id, results };

}, {
  connection,
  concurrency: 10,
});

// ─────────────────────────────────────────────
//  BROADCAST WORKER
//  Processes announcement chunks in parallel
// ─────────────────────────────────────────────

const broadcastWorker = new Worker('broadcasts', async (job) => {
  const { announcementId, recipientIds, chunkIndex } = job.data;

  const { Announcement } = require('../models');
  const announcement = await Announcement.findById(announcementId);
  if (!announcement || !announcement.isActive) {
    return { skipped: true, reason: 'announcement_inactive' };
  }

  console.log(`[Broadcast] Processing chunk ${chunkIndex} — ${recipientIds.length} users`);

  // Get all FCM tokens for this chunk
  const users = await User.find({
    _id           : { $in: recipientIds },
    isDeleted     : false,
    accountStatus : 'active',
    'notificationPrefs.push': { $ne: false },
    'deviceTokens.0'        : { $exists: true },
  }).select('deviceTokens').lean();

  const allTokens = users.flatMap(u => u.deviceTokens.map(d => d.token));

  if (allTokens.length) {
    const pushRes = await sendPushMulticast(allTokens, {
      title   : announcement.title,
      body    : announcement.body,
      imageUrl: announcement.image?.url || null,
      data    : { type: 'admin_announcement', announcementId: String(announcementId) },
    });
    console.log(`[Broadcast] Chunk ${chunkIndex}: ${pushRes.sent} sent, ${pushRes.failed} failed`);
  }

  // Save in-app notifications in bulk
  const notifDocs = recipientIds.map(uid => ({
    recipient: uid,
    type     : 'admin_announcement',
    title    : announcement.title,
    body     : announcement.body,
    isAdmin  : true,
    meta     : { imageUrl: announcement.image?.url || null },
    channels : {
      inApp   : { sent: true, sentAt: new Date() },
      push    : { sent: allTokens.length > 0, sentAt: new Date() },
      whatsapp: { sent: false },
    },
  }));

  await Notification.insertMany(notifDocs, { ordered: false });

  // Also emit via Socket.io to online users
  recipientIds.forEach(uid => {
    emitToUser(uid, 'notification', {
      type : 'admin_announcement',
      title: announcement.title,
      body : announcement.body,
      meta : { imageUrl: announcement.image?.url || null },
    }).catch(() => {});
  });

  // Update announcement sent count
  await Announcement.findByIdAndUpdate(announcementId, {
    $inc: { sentCount: recipientIds.length },
    publishedAt: new Date(),
  });

  return { processed: recipientIds.length };

}, {
  connection,
  concurrency: 3,
});

// ─────────────────────────────────────────────
//  WORKER ERROR HANDLERS
// ─────────────────────────────────────────────

notifWorker.on('failed', (job, err) => {
  console.error(`[NotifWorker] Job ${job?.id} failed:`, err.message);
});

broadcastWorker.on('failed', (job, err) => {
  console.error(`[BroadcastWorker] Job ${job?.id} failed:`, err.message);
});

// ─────────────────────────────────────────────
//  GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────

async function closeNotifWorkers() {
  await Promise.all([notifWorker.close(), broadcastWorker.close()]);
  console.log('[NotifWorkers] Shut down');
}

module.exports = {
  notifQueue,
  broadcastQueue,
  queueNotification,
  queueBroadcast,
  notifWorker,
  broadcastWorker,
  closeNotifWorkers,
  connection,
};
