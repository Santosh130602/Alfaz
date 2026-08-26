'use strict';

const { Worker } = require('bullmq');
const { renderCanvasToImage } = require('../utils/renderer');
const { deleteFile }    = require('../config/drive');
const { Post }          = require('../models');
const { connection }    = require('../config/queues');

// ─────────────────────────────────────────────
//  WORKER 1 — IMAGE RENDER
//  Concurrency 2: two Puppeteer pages at once
// ─────────────────────────────────────────────

const renderWorker = new Worker('render', async (job) => {
  const { postId, canvasState, type } = job.data;
  console.log(`[RenderWorker] Starting job ${job.id} — post: ${postId}`);

  // Update post status to "rendering"
  await Post.findByIdAndUpdate(postId, { 'renderedImage.rendering': true });

  const result = await renderCanvasToImage(canvasState, postId);

  // Save rendered image back to post
  await Post.findByIdAndUpdate(postId, {
    renderedImage: {
      url      : result.url,
      driveId  : result.driveId,
      thumbnail: result.thumbnail,
      width    : result.width,
      height   : result.height,
      sizeBytes: result.sizeBytes,
      mimeType : 'image/png',
      renderedAt: result.renderedAt,
    },
  });

  console.log(`[RenderWorker] Job ${job.id} done — ${result.url}`);
  return { url: result.url, driveId: result.driveId };

}, {
  connection,
  concurrency: 2,
  limiter    : { max: 10, duration: 60000 },  // max 10 renders/min
});

renderWorker.on('failed', async (job, err) => {
  console.error(`[RenderWorker] Job ${job?.id} failed:`, err.message);
  // Mark post render as failed so frontend can show error state
  if (job?.data?.postId) {
    await Post.findByIdAndUpdate(job.data.postId, {
      adminNote: `Render failed: ${err.message}`,
    });
  }
});

// ─────────────────────────────────────────────
//  WORKER 2 — SCHEDULED PUBLISH
//  Concurrency 5: lightweight DB updates
// ─────────────────────────────────────────────

const publishWorker = new Worker('publish', async (job) => {
  const { postId } = job.data;
  console.log(`[PublishWorker] Publishing scheduled post: ${postId}`);

  const post = await Post.findById(postId);
  if (!post) return { skipped: true, reason: 'post_not_found' };
  if (post.status !== 'scheduled') return { skipped: true, reason: `status_is_${post.status}` };
  if (post.isDeleted) return { skipped: true, reason: 'post_deleted' };

  post.status      = 'published';
  post.publishedAt = new Date();
  await post.save({ validateBeforeSave: false });

  // TODO Phase 4: trigger notification to followers
  console.log(`[PublishWorker] Post ${postId} published ✅`);
  return { published: true };

}, {
  connection,
  concurrency: 5,
});

publishWorker.on('failed', (job, err) => {
  console.error(`[PublishWorker] Job ${job?.id} failed:`, err.message);
});

// ─────────────────────────────────────────────
//  WORKER 3 — DRIVE CLEANUP
//  Deletes orphaned Drive files after post deletion
// ─────────────────────────────────────────────

const cleanupWorker = new Worker('cleanup', async (job) => {
  const { driveIds } = job.data;
  console.log(`[CleanupWorker] Deleting ${driveIds.length} Drive file(s)`);

  const results = await Promise.allSettled(driveIds.map(id => deleteFile(id)));
  const failed  = results.filter(r => r.status === 'rejected').length;

  console.log(`[CleanupWorker] Deleted ${driveIds.length - failed}/${driveIds.length} files`);
  return { total: driveIds.length, failed };

}, {
  connection,
  concurrency: 3,
  limiter    : { max: 20, duration: 60000 },
});

// ─────────────────────────────────────────────
//  GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────

async function closeWorkers() {
  await Promise.all([
    renderWorker.close(),
    publishWorker.close(),
    cleanupWorker.close(),
  ]);
  console.log('[Workers] All workers shut down');
}

module.exports = { renderWorker, publishWorker, cleanupWorker, closeWorkers };
