'use strict';

const { Queue, Worker, QueueEvents } = require('bullmq');

// ─────────────────────────────────────────────
//  REDIS CONNECTION FOR BULLMQ
// ─────────────────────────────────────────────

const connection = {
  host    : process.env.REDIS_HOST || 'redis',
  port    : parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,  // required by BullMQ
};

// ─────────────────────────────────────────────
//  QUEUES
// ─────────────────────────────────────────────

// 1. Image render queue — Puppeteer jobs (CPU-heavy, concurrency: 2)
const renderQueue = new Queue('render', {
  connection,
  defaultJobOptions: {
    attempts     : 3,
    backoff      : { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail : { count: 500 },
  },
});

// 2. Scheduled publish queue — publishes posts at scheduledAt time
const publishQueue = new Queue('publish', {
  connection,
  defaultJobOptions: {
    attempts     : 5,
    backoff      : { type: 'fixed', delay: 10000 },
    removeOnComplete: { count: 200 },
    removeOnFail : { count: 100 },
  },
});

// 3. Drive cleanup queue — delete orphaned Drive files
const cleanupQueue = new Queue('cleanup', {
  connection,
  defaultJobOptions: {
    attempts     : 3,
    backoff      : { type: 'fixed', delay: 30000 },
    removeOnComplete: { count: 50 },
    removeOnFail : { count: 100 },
  },
});

// ─────────────────────────────────────────────
//  JOB ADDERS
// ─────────────────────────────────────────────

/**
 * Add a render job — called after post is saved with canvasState
 * @param {string} postId
 * @param {object} canvasState  - Post.canvasState
 * @param {string} type         - 'post' | 'cover'
 */
async function addRenderJob(postId, canvasState, type = 'post') {
  return renderQueue.add('render-image', { postId, canvasState, type }, {
    jobId   : `render:${postId}`,  // prevent duplicates
    priority: 1,
  });
}

/**
 * Add a scheduled publish job with delay
 * @param {string} postId
 * @param {Date}   scheduledAt
 */
async function addPublishJob(postId, scheduledAt) {
  const delay = Math.max(0, new Date(scheduledAt) - Date.now());
  return publishQueue.add('publish-post', { postId }, {
    jobId: `publish:${postId}`,
    delay,
  });
}

/**
 * Remove a scheduled publish job (when post is deleted / rescheduled)
 */
async function removePublishJob(postId) {
  const job = await publishQueue.getJob(`publish:${postId}`);
  if (job) await job.remove();
}

/**
 * Add a Drive file cleanup job
 */
async function addCleanupJob(driveIds = []) {
  if (!driveIds.length) return;
  return cleanupQueue.add('delete-drive-files', { driveIds }, { delay: 5000 });
}

// ─────────────────────────────────────────────
//  QUEUE EVENTS (for monitoring)
// ─────────────────────────────────────────────

const renderEvents = new QueueEvents('render', { connection });
renderEvents.on('completed', ({ jobId }) => console.log(`[Queue] Render job ${jobId} ✅`));
renderEvents.on('failed',    ({ jobId, failedReason }) => console.error(`[Queue] Render job ${jobId} ❌:`, failedReason));

module.exports = {
  renderQueue,
  publishQueue,
  cleanupQueue,
  addRenderJob,
  addPublishJob,
  removePublishJob,
  addCleanupJob,
  connection,
};
