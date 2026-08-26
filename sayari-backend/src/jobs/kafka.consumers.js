'use strict';

const { createConsumer, TOPICS } = require('../config/kafka');
const { Post, Series, User, Channel, PostAnalytics, Notification } = require('../models');
const { setCache, getCache, incr } = require('../config/redis');
const { logger } = require('../config/logger');

// ─────────────────────────────────────────────
//  ANALYTICS CONSUMER
//  Processes view / like / comment / play events
//  into PostAnalytics rollup documents
//  Topic: sayari.post.viewed, sayari.post.liked,
//         sayari.post.commented, sayari.audio.played
// ─────────────────────────────────────────────

async function handleAnalyticsEvent(topic, event) {
  const { postId, channelId, authorId, source, language, country } = event;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const inc = {};

    switch (topic) {
      case TOPICS.POST_VIEWED:
        inc['views'] = 1;
        // Unique view logic via Redis dedup key (set in engagement service)
        if (event.isUnique) inc['uniqueViews'] = 1;
        if (source) inc[`sources.${source}`] = 1;
        if (language) {
          const langKey = `audienceLanguages.${language}`;
          inc[langKey] = 1;
        }
        // Also increment denormalised counter on Post
        await Post.findByIdAndUpdate(postId, { $inc: { 'stats.viewCount': 1 } });
        break;

      case TOPICS.POST_LIKED:
        inc['likes'] = 1;
        await Post.findByIdAndUpdate(postId, { $inc: { 'stats.likeCount': event.delta || 1 } });
        break;

      case TOPICS.POST_COMMENTED:
        inc['comments'] = 1;
        await Post.findByIdAndUpdate(postId, { $inc: { 'stats.commentCount': 1 } });
        break;

      case TOPICS.POST_SAVED:
        inc['saves'] = 1;
        await Post.findByIdAndUpdate(postId, { $inc: { 'stats.saveCount': event.delta || 1 } });
        break;

      case TOPICS.AUDIO_PLAYED:
        inc['plays'] = 1;
        if (event.progressSeconds) inc['totalPlayTime'] = event.progressSeconds;
        await Post.findByIdAndUpdate(postId, { $inc: { 'stats.playCount': 1 } });
        break;
    }

    if (Object.keys(inc).length && postId && channelId && authorId) {
      await PostAnalytics.findOneAndUpdate(
        { post: postId, date: today },
        {
          $inc: inc,
          $setOnInsert: { channel: channelId, author: authorId, date: today },
        },
        { upsert: true }
      );
    }

  } catch (err) {
    logger.error('[KafkaConsumer] Analytics event error', { topic, postId, error: err.message });
  }
}

// ─────────────────────────────────────────────
//  USER EVENTS CONSUMER
//  Processes follow / register events
// ─────────────────────────────────────────────

async function handleUserEvent(topic, event) {
  try {
    switch (topic) {
      case TOPICS.USER_FOLLOWED:
        // Update follower/following counts atomically
        await Promise.all([
          User.findByIdAndUpdate(event.followerId,  { $inc: { 'stats.followingCount':  event.delta } }),
          User.findByIdAndUpdate(event.followingId, { $inc: { 'stats.followersCount':  event.delta } }),
          Channel.findOneAndUpdate({ owner: event.followingId }, { $inc: { 'stats.followersCount': event.delta } }),
        ]);
        break;

      case TOPICS.USER_REGISTERED:
        // Invalidate top-creators cache
        await Promise.all([
          getCache('feed:top_creators:all:20').then(c => c ? setCache('feed:top_creators:all:20', null, 1) : null),
        ]);
        break;
    }
  } catch (err) {
    logger.error('[KafkaConsumer] User event error', { topic, error: err.message });
  }
}

// ─────────────────────────────────────────────
//  WHATSAPP DELIVERY CONSUMER
//  Updates notification delivery status
// ─────────────────────────────────────────────

async function handleWhatsAppDelivery(topic, event) {
  const { messageId, status, phone } = event;
  if (!messageId || !status) return;

  try {
    await Notification.findOneAndUpdate(
      { 'channels.whatsapp.messageId': messageId },
      { $set: { 'channels.whatsapp.deliveryStatus': status } }
    );
    logger.debug(`[KafkaConsumer] WA delivery updated: ${messageId} → ${status}`);
  } catch (err) {
    logger.error('[KafkaConsumer] WA delivery error', { error: err.message });
  }
}

// ─────────────────────────────────────────────
//  START ALL CONSUMERS
// ─────────────────────────────────────────────

async function startKafkaConsumers() {
  if (process.env.KAFKA_ENABLED !== 'true') {
    logger.info('[Kafka] KAFKA_ENABLED is not true — consumers not started (using direct DB writes)');
    return;
  }

  try {
    // Analytics consumer
    await createConsumer(
      'sayari-analytics',
      [TOPICS.POST_VIEWED, TOPICS.POST_LIKED, TOPICS.POST_COMMENTED, TOPICS.POST_SAVED, TOPICS.AUDIO_PLAYED],
      handleAnalyticsEvent
    );

    // User events consumer
    await createConsumer(
      'sayari-user-events',
      [TOPICS.USER_FOLLOWED, TOPICS.USER_REGISTERED],
      handleUserEvent
    );

    // WhatsApp delivery consumer
    await createConsumer(
      'sayari-wa-delivery',
      [TOPICS.WA_DELIVERY],
      handleWhatsAppDelivery
    );

    logger.info('✅ All Kafka consumers started');
  } catch (err) {
    // Kafka startup failure should not crash the app
    logger.warn('[Kafka] Failed to start consumers — running without Kafka', { error: err.message });
  }
}

module.exports = { startKafkaConsumers };
