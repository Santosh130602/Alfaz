'use strict';

const { Server }     = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt');
const { setCache, getCache, delCache } = require('../config/redis');

let io = null;

// ─────────────────────────────────────────────
//  INITIALISE SOCKET.IO
// ─────────────────────────────────────────────

function initSocket(httpServer) {
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');

  io = new Server(httpServer, {
    cors: {
      origin     : allowedOrigins,
      methods    : ['GET', 'POST'],
      credentials: true,
    },
    transports : ['websocket', 'polling'],
    pingTimeout : 60000,
    pingInterval: 25000,
  });

  // ── Auth middleware for socket connections ──
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
        || socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        socket.userId = null;
        return next(); // allow unauthenticated connections (for public rooms)
      }

      const decoded  = await verifyAccessToken(token);
      socket.userId  = decoded.sub;
      socket.role    = decoded.role;
      socket.username= decoded.username;
      next();
    } catch {
      next(); // don't block connection on bad token
    }
  });

  // ── Connection handler ──
  io.on('connection', async (socket) => {
    if (socket.userId) {
      // Join user's private room for targeted notifications
      socket.join(`user:${socket.userId}`);

      // Track online status in Redis (expire after 5 min — refreshed on heartbeat)
      await setCache(`online:${socket.userId}`, { socketId: socket.id, connectedAt: Date.now() }, 300);

      console.log(`[Socket] User ${socket.username} connected (${socket.id})`);

      // ── Client sends heartbeat every 60s to maintain online status
      socket.on('heartbeat', async () => {
        await setCache(`online:${socket.userId}`, { socketId: socket.id, connectedAt: Date.now() }, 300);
        socket.emit('heartbeat_ack', { ts: Date.now() });
      });

      // ── Client marks notifications as read ──
      socket.on('mark_read', async ({ notificationId }) => {
        try {
          const { Notification } = require('../models');
          await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: socket.userId },
            { isRead: true, readAt: new Date() }
          );
          socket.emit('notification_read', { notificationId });
        } catch { /* ignore */ }
      });

      // ── Client marks ALL notifications as read ──
      socket.on('mark_all_read', async () => {
        try {
          const { Notification } = require('../models');
          await Notification.updateMany(
            { recipient: socket.userId, isRead: false },
            { isRead: true, readAt: new Date() }
          );
          socket.emit('all_read', { ts: Date.now() });
        } catch { /* ignore */ }
      });

      // ── Disconnect ──
      socket.on('disconnect', async () => {
        await delCache(`online:${socket.userId}`);
        console.log(`[Socket] User ${socket.username} disconnected`);
      });
    }
  });

  console.log('✅ Socket.io initialised');
  return io;
}

// ─────────────────────────────────────────────
//  EMIT NOTIFICATION TO A USER
//  Called by notification service after saving to DB
// ─────────────────────────────────────────────

async function emitToUser(userId, event, data) {
  if (!io) return false;
  const room = `user:${userId}`;
  const sockets = await io.in(room).fetchSockets();
  if (!sockets.length) return false; // user offline

  io.to(room).emit(event, data);
  return true;
}

// ─────────────────────────────────────────────
//  CHECK IF USER IS ONLINE
// ─────────────────────────────────────────────

async function isUserOnline(userId) {
  const cached = await getCache(`online:${userId}`);
  return !!cached;
}

// ─────────────────────────────────────────────
//  BROADCAST TO ALL CONNECTED USERS (admin)
// ─────────────────────────────────────────────

function broadcastToAll(event, data) {
  if (!io) return;
  io.emit(event, data);
}

function getIo() { return io; }

module.exports = { initSocket, emitToUser, isUserOnline, broadcastToAll, getIo };
