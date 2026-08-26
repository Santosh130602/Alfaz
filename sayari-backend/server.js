'use strict';

require('dotenv').config();

// ── Env validation first ──────────────────────
const validateEnv = require('./src/config/env.validator');
validateEnv();

require('dotenv').config();

const http = require('http');
const app  = require('./src/app');

let logger;
try { logger = require('./src/config/logger').logger; } catch { logger = console; }

const PORT = parseInt(process.env.PORT || '5000');

async function start() {
  try {
    // ── 1. MongoDB ────────────────────────────
    const connectDB = require('./src/config/database');
    await connectDB();

    // ── 2. Redis ──────────────────────────────
    const { getRedis } = require('./src/config/redis');
    getRedis();
    logger.info ? logger.info('✅ Redis connected') : console.log('✅ Redis connected');

    // ── 3. Firebase (push notifications) ──────
    try {
      const { initFirebase } = require('./src/config/firebase');
      initFirebase();
    } catch { logger.warn ? logger.warn('Firebase not configured') : console.warn('Firebase not configured'); }

    // ── 4. HTTP server + Socket.io ────────────
    const server = http.createServer(app);
    try {
      const { initSocket } = require('./src/sockets/socket');
      initSocket(server);
    } catch { logger.warn ? logger.warn('Socket.io init failed') : console.warn('Socket.io skipped'); }

    // ── 5. BullMQ Workers ─────────────────────
    try { require('./src/jobs/render.workers'); logger.info ? logger.info('✅ Render workers started') : null; } catch (e) { console.warn('Render workers:', e.message); }
    try { require('./src/jobs/notification.queue'); logger.info ? logger.info('✅ Notification workers started') : null; } catch (e) { console.warn('Notif workers:', e.message); }

    // ── 6. Cron Jobs ──────────────────────────
    try {
      const { startTrendingJobs }  = require('./src/jobs/trending.job');
      const { startAnalyticsJobs } = require('./src/jobs/analytics.job');
      const { startSystemJobs }    = require('./src/jobs/system.jobs');
      startTrendingJobs();
      startAnalyticsJobs();
      startSystemJobs();
      logger.info ? logger.info('✅ All cron jobs started') : null;
    } catch (e) { console.warn('Cron jobs partial start:', e.message); }

    // ── 7. Kafka consumers (optional) ─────────
    try {
      if (process.env.KAFKA_ENABLED === 'true') {
        const { startKafkaConsumers } = require('./src/jobs/kafka.consumers');
        await startKafkaConsumers();
      }
    } catch (e) { console.warn('Kafka consumers skipped:', e.message); }

    // ── 8. Listen ─────────────────────────────
    server.listen(PORT, () => {
      const msg = `\n🚀 Sayari Platform API — All Phases Combined\n   Port   : ${PORT}\n   Env    : ${process.env.NODE_ENV}\n   Health : http://localhost:${PORT}/health\n   Docs   : http://localhost:${PORT}/api/docs\n   WS     : ws://localhost:${PORT}\n`;
      logger.info ? logger.info(msg) : console.log(msg);
    });

    // ── 9. Graceful shutdown ──────────────────
    setupGracefulShutdown(server);

  } catch (err) {
    const msg = `❌ Startup failed: ${err.message}`;
    logger.error ? logger.error(msg, { stack: err.stack }) : console.error(msg);
    process.exit(1);
  }
}

function setupGracefulShutdown(server) {
  async function shutdown(sig) {
    const msg = `${sig} received — shutting down gracefully...`;
    logger.info ? logger.info(msg) : console.log(msg);

    server.close(async () => {
      try {
        // Workers
        try { const { closeWorkers } = require('./src/jobs/render.workers'); await closeWorkers(); } catch {}
        try { const { closeNotifWorkers } = require('./src/jobs/notification.queue'); await closeNotifWorkers(); } catch {}
        // Kafka
        try { const { disconnectKafka } = require('./src/config/kafka'); await disconnectKafka(); } catch {}
        // Puppeteer
        try { const { closeBrowser } = require('./src/utils/renderer'); await closeBrowser(); } catch {}
        // DB + Cache
        const mongoose = require('mongoose');
        const { getRedis } = require('./src/config/redis');
        await mongoose.connection.close();
        await getRedis().quit();
        logger.info ? logger.info('✅ Graceful shutdown complete') : console.log('✅ Shutdown complete');
        process.exit(0);
      } catch (e) {
        console.error('Shutdown error:', e.message);
        process.exit(1);
      }
    });

    setTimeout(() => { console.error('❌ Forced shutdown'); process.exit(1); }, 20000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', String(reason));
    server.close(() => process.exit(1));
  });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
  });
}

start();
