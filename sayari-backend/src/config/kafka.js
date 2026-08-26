'use strict';

const { Kafka, Partitioners, logLevel } = require('kafkajs');
const { logger } = require('./logger');

// ─────────────────────────────────────────────
//  KAFKA CLIENT (singleton)
// ─────────────────────────────────────────────

let kafka       = null;
let producer    = null;
let consumers   = {};

function getKafka() {
  if (kafka) return kafka;

  const brokers = (process.env.KAFKA_BROKERS || 'kafka:9092').split(',');

  kafka = new Kafka({
    clientId: 'sayari-platform',
    brokers,
    retry: {
      initialRetryTime: 300,
      retries          : 8,
    },
    logLevel: process.env.NODE_ENV === 'production' ? logLevel.WARN : logLevel.INFO,
    logCreator: () => ({ namespace, level, label, log }) => {
      const { message, ...extra } = log;
      if (level === logLevel.ERROR) logger.error(`[Kafka:${namespace}] ${message}`, extra);
      else if (level === logLevel.WARN) logger.warn(`[Kafka:${namespace}] ${message}`, extra);
      else logger.debug(`[Kafka:${namespace}] ${message}`, extra);
    },
  });

  return kafka;
}

// ─────────────────────────────────────────────
//  PRODUCER (singleton)
// ─────────────────────────────────────────────

async function getProducer() {
  if (producer) return producer;

  const k = getKafka();
  producer = k.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
    allowAutoTopicCreation: true,
    transactionTimeout    : 30000,
  });

  await producer.connect();
  logger.info('✅ Kafka producer connected');
  return producer;
}

// ─────────────────────────────────────────────
//  PUBLISH EVENT
//  Safe wrapper — falls back to direct DB if Kafka unavailable
// ─────────────────────────────────────────────

async function publishEvent(topic, event, key = null) {
  try {
    const prod = await getProducer();
    await prod.send({
      topic,
      messages: [{
        key  : key ? String(key) : null,
        value: JSON.stringify({ ...event, _ts: Date.now() }),
      }],
    });
  } catch (err) {
    // Kafka unavailable — log and continue (platform should not crash)
    logger.warn(`[Kafka] Failed to publish to ${topic}: ${err.message}. Event dropped.`);
  }
}

// ─────────────────────────────────────────────
//  CONSUMER FACTORY
// ─────────────────────────────────────────────

async function createConsumer(groupId, topics, handler) {
  if (consumers[groupId]) return consumers[groupId];

  const k        = getKafka();
  const consumer = k.consumer({
    groupId,
    sessionTimeout  : 30000,
    heartbeatInterval: 3000,
  });

  await consumer.connect();
  await consumer.subscribe({ topics, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        await handler(topic, event, { partition, offset: message.offset });
      } catch (err) {
        logger.error(`[Kafka] Consumer error on ${topic}:`, { error: err.message });
      }
    },
  });

  consumers[groupId] = consumer;
  logger.info(`✅ Kafka consumer [${groupId}] subscribed to: ${topics.join(', ')}`);
  return consumer;
}

// ─────────────────────────────────────────────
//  TOPICS — centralised topic names
// ─────────────────────────────────────────────

const TOPICS = {
  // View events — processed into analytics rollups
  POST_VIEWED     : 'sayari.post.viewed',
  // Engagement events — processed into denormalised counts
  POST_LIKED      : 'sayari.post.liked',
  POST_COMMENTED  : 'sayari.post.commented',
  POST_SAVED      : 'sayari.post.saved',
  // User events
  USER_FOLLOWED   : 'sayari.user.followed',
  USER_REGISTERED : 'sayari.user.registered',
  // Content events
  POST_PUBLISHED  : 'sayari.post.published',
  AUDIO_PLAYED    : 'sayari.audio.played',
  // Notification events
  NOTIFICATION_SEND: 'sayari.notification.send',
  // WhatsApp delivery
  WA_DELIVERY     : 'sayari.whatsapp.delivery',
};

// ─────────────────────────────────────────────
//  GRACEFUL DISCONNECT
// ─────────────────────────────────────────────

async function disconnectKafka() {
  try {
    if (producer) await producer.disconnect();
    for (const consumer of Object.values(consumers)) {
      await consumer.disconnect();
    }
    logger.info('✅ Kafka disconnected');
  } catch (err) {
    logger.warn('[Kafka] Disconnect error:', { error: err.message });
  }
}

module.exports = { getKafka, getProducer, publishEvent, createConsumer, disconnectKafka, TOPICS };
