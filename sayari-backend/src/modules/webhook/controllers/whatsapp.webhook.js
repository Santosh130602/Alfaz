'use strict';

const crypto = require('crypto');
const { Notification }  = require('../../../models');
const { publishEvent, TOPICS } = require('../../../config/kafka');
const { logger } = require('../../../config/logger');
const { catchAsync, sendSuccess } = require('../../../utils/appError');

// ─────────────────────────────────────────────
//  WATI WEBHOOK VERIFICATION
//  WATI sends a GET request to verify the endpoint
// ─────────────────────────────────────────────

exports.verifyWebhook = (req, res) => {
  const challenge = req.query['hub.challenge'];
  const token     = req.query['hub.verify_token'];

  if (token === process.env.WATI_WEBHOOK_VERIFY_TOKEN) {
    logger.info('[WhatsApp Webhook] Verified');
    return res.status(200).send(challenge);
  }

  logger.warn('[WhatsApp Webhook] Verification failed — wrong token');
  return res.status(403).json({ error: 'Forbidden' });
};

// ─────────────────────────────────────────────
//  WATI WEBHOOK SIGNATURE VERIFICATION
//  Middleware to validate WATI request signature
// ─────────────────────────────────────────────

exports.validateSignature = (req, res, next) => {
  const signature = req.headers['x-wati-signature'] || req.headers['x-hub-signature-256'];
  const secret    = process.env.WATI_WEBHOOK_SECRET;

  // Skip in development if no secret configured
  if (!secret) {
    if (process.env.NODE_ENV === 'development') return next();
    return res.status(401).json({ error: 'Webhook secret not configured' });
  }

  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  const rawBody = JSON.stringify(req.body);
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    logger.warn('[WhatsApp Webhook] Invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};

// ─────────────────────────────────────────────
//  HANDLE INCOMING WEBHOOK EVENT
//  WATI sends delivery receipts + incoming messages
// ─────────────────────────────────────────────

exports.handleWebhook = catchAsync(async (req, res) => {
  const payload = req.body;

  // WATI sends different event types
  const eventType = payload.type || payload.event_type;

  logger.debug('[WhatsApp Webhook] Event received', { type: eventType });

  switch (eventType) {
    // ── Delivery receipt ─────────────────────
    case 'message_status':
    case 'wamid_status': {
      const { wamid, status, timestamp } = payload;
      const deliveryStatusMap = {
        'sent'      : 'sent',
        'delivered' : 'delivered',
        'read'      : 'read',
        'failed'    : 'failed',
      };
      const mappedStatus = deliveryStatusMap[status] || status;

      // Update notification delivery status
      if (wamid) {
        await Notification.findOneAndUpdate(
          { 'channels.whatsapp.messageId': wamid },
          { $set: { 'channels.whatsapp.deliveryStatus': mappedStatus } }
        );

        // Also publish to Kafka for any downstream processing
        await publishEvent(TOPICS.WA_DELIVERY, {
          messageId: wamid,
          status   : mappedStatus,
          timestamp: timestamp || Date.now(),
        });
      }
      break;
    }

    // ── Incoming message (user replied on WhatsApp) ──
    case 'message': {
      const { from, text, timestamp } = payload;
      logger.info('[WhatsApp Webhook] Incoming message from user', {
        from,
        text: text?.body?.substring(0, 50),
      });
      // Future: handle user replies (e.g. STOP = unsubscribe from WhatsApp notifs)
      if (text?.body?.toLowerCase().trim() === 'stop') {
        const { User } = require('../../../models');
        await User.findOneAndUpdate(
          { 'whatsapp.number': from },
          { $set: { 'notificationPrefs.whatsapp': false } }
        );
        logger.info('[WhatsApp Webhook] User unsubscribed from WA notifications', { from });
      }
      break;
    }

    // ── Template approval status ──────────────
    case 'template_status': {
      logger.info('[WhatsApp Webhook] Template status update', {
        templateName: payload.template_name,
        status      : payload.status,
      });
      break;
    }

    default:
      logger.debug('[WhatsApp Webhook] Unhandled event type', { eventType });
  }

  // Always respond 200 quickly to avoid WATI retries
  sendSuccess(res, {}, 200, 'OK');
});
