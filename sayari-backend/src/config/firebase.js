'use strict';

const admin = require('firebase-admin');

let messaging = null;

// ─────────────────────────────────────────────
//  INITIALISE FIREBASE ADMIN (once)
//  Service account JSON is stored as env var
// ─────────────────────────────────────────────

function initFirebase() {
  if (admin.apps.length) {
    messaging = admin.messaging();
    return messaging;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.warn('[Firebase] FIREBASE_SERVICE_ACCOUNT not set — push notifications disabled');
    return null;
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    console.error('[Firebase] Invalid FIREBASE_SERVICE_ACCOUNT JSON');
    return null;
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  messaging = admin.messaging();
  console.log('✅ Firebase Admin initialised');
  return messaging;
}

function getMessaging() {
  if (messaging) return messaging;
  return initFirebase();
}

// ─────────────────────────────────────────────
//  SEND PUSH TO A SINGLE TOKEN
// ─────────────────────────────────────────────

async function sendPush(token, { title, body, data = {}, imageUrl = null }) {
  const fcm = getMessaging();
  if (!fcm) return { sent: false, reason: 'firebase_not_configured' };

  const message = {
    token,
    notification: {
      title,
      body,
      ...(imageUrl ? { imageUrl } : {}),
    },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
    android: {
      notification: {
        sound   : 'default',
        priority: 'high',
        ...(imageUrl ? { imageUrl } : {}),
      },
    },
    apns: {
      payload: {
        aps: {
          sound   : 'default',
          badge   : 1,
          'content-available': 1,
        },
      },
    },
  };

  try {
    const result = await fcm.send(message);
    return { sent: true, messageId: result };
  } catch (err) {
    // Token invalid/expired — signal to caller to remove it
    const isStale = ['messaging/invalid-registration-token',
                     'messaging/registration-token-not-registered'].includes(err.code);
    return { sent: false, reason: err.code, staleToken: isStale };
  }
}

// ─────────────────────────────────────────────
//  SEND PUSH TO MULTIPLE TOKENS (batch)
//  Firebase allows up to 500 tokens per batch
// ─────────────────────────────────────────────

async function sendPushMulticast(tokens, payload) {
  const fcm = getMessaging();
  if (!fcm || !tokens.length) return { sent: 0, failed: 0 };

  const { title, body, data = {}, imageUrl = null } = payload;

  // Chunk into batches of 500
  const chunks    = [];
  for (let i = 0; i < tokens.length; i += 500) chunks.push(tokens.slice(i, i + 500));

  let totalSent   = 0;
  let staleTokens = [];

  for (const chunk of chunks) {
    const message = {
      tokens: chunk,
      notification: { title, body, ...(imageUrl ? { imageUrl } : {}) },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: { notification: { sound: 'default', priority: 'high' } },
      apns  : { payload: { aps: { sound: 'default', badge: 1 } } },
    };

    const result = await fcm.sendEachForMulticast(message);
    totalSent += result.successCount;

    result.responses.forEach((r, idx) => {
      if (!r.success) {
        const isStale = ['messaging/invalid-registration-token',
                         'messaging/registration-token-not-registered'].includes(r.error?.code);
        if (isStale) staleTokens.push(chunk[idx]);
      }
    });
  }

  return { sent: totalSent, failed: tokens.length - totalSent, staleTokens };
}

module.exports = { initFirebase, getMessaging, sendPush, sendPushMulticast };
