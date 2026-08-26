'use strict';

const Redis = require('ioredis');

let client = null;

function getRedis() {
  if (client) return client;

  client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableReadyCheck    : true,
    lazyConnect         : false,
    retryStrategy (times) {
      if (times > 10) return null; // stop retrying
      return Math.min(times * 200, 3000);
    },
  });

  client.on('connect',  () => console.log('✅ Redis connected'));
  client.on('error',    (e) => console.error('❌ Redis error:', e.message));
  client.on('reconnecting', () => console.warn('⚠️  Redis reconnecting...'));

  return client;
}

// ─── Helpers ──────────────────────────────────

/**
 * Cache a value with optional TTL (seconds)
 */
async function setCache(key, value, ttlSeconds = null) {
  const redis = getRedis();
  const serialised = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.setex(key, ttlSeconds, serialised);
  } else {
    await redis.set(key, serialised);
  }
}

/**
 * Get a cached value (returns null if missing)
 */
async function getCache(key) {
  const redis = getRedis();
  const raw   = await redis.get(key);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Delete a key
 */
async function delCache(key) {
  return getRedis().del(key);
}

/**
 * Check if a key exists
 */
async function exists(key) {
  return getRedis().exists(key);
}

/**
 * Increment a counter (for rate limiting / OTP attempt tracking)
 */
async function incr(key, ttlSeconds = null) {
  const redis  = getRedis();
  const newVal = await redis.incr(key);
  if (newVal === 1 && ttlSeconds) {
    await redis.expire(key, ttlSeconds);
  }
  return newVal;
}

/**
 * Add a token to a blacklist set (for logout / refresh revocation)
 */
async function blacklistToken(jti, ttlSeconds) {
  const redis = getRedis();
  await redis.setex(`bl:${jti}`, ttlSeconds, '1');
}

/**
 * Check if a token is blacklisted
 */
async function isBlacklisted(jti) {
  const result = await getRedis().get(`bl:${jti}`);
  return result === '1';
}

module.exports = { getRedis, setCache, getCache, delCache, exists, incr, blacklistToken, isBlacklisted };
