'use strict';

const axios = require('axios');

// ─────────────────────────────────────────────
//  WATI CLIENT (WhatsApp Business API via WATI)
//  Swap baseUrl + token for Twilio / Meta if needed
// ─────────────────────────────────────────────

function getWatiClient() {
  const baseUrl = process.env.WATI_API_URL;
  const token   = process.env.WATI_ACCESS_TOKEN;

  if (!baseUrl || !token) return null;

  return axios.create({
    baseURL: baseUrl,
    headers: {
      Authorization : `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
}

// ─────────────────────────────────────────────
//  SEND OTP MESSAGE
// ─────────────────────────────────────────────

async function sendOtpMessage(phone, otp) {
  const provider = process.env.WHATSAPP_PROVIDER || 'console';

  if (provider === 'console') {
    console.log(`\n📱 [DEV WhatsApp OTP] Phone: ${phone}  OTP: ${otp}\n`);
    return { sent: true, provider: 'console' };
  }

  const client = getWatiClient();
  if (!client) throw new Error('WhatsApp client not configured');

  const templateName = process.env.WATI_OTP_TEMPLATE_NAME || 'sayari_otp';

  try {
    await client.post('/api/v1/sendTemplateMessage', {
      template_name : templateName,
      broadcast_name: `otp_${Date.now()}`,
      receivers     : [{
        whatsappNumber: phone.replace(/\D/g, ''),
        customParams  : [{ name: 'otp', value: otp }, { name: 'validity', value: '10 minutes' }],
      }],
    });
    return { sent: true, provider: 'wati' };
  } catch (err) {
    console.error('[WhatsApp] OTP send failed:', err.response?.data || err.message);
    throw new Error(`WhatsApp OTP failed: ${err.message}`);
  }
}

// ─────────────────────────────────────────────
//  SEND NOTIFICATION MESSAGE (non-OTP)
//  Uses a pre-approved WhatsApp template
// ─────────────────────────────────────────────

async function sendNotificationMessage(phone, templateName, params = []) {
  const provider = process.env.WHATSAPP_PROVIDER || 'console';

  if (provider === 'console') {
    console.log(`\n📱 [DEV WhatsApp Notif] Phone: ${phone}  Template: ${templateName}  Params:`, params);
    return { sent: true, provider: 'console' };
  }

  const client = getWatiClient();
  if (!client) return { sent: false, reason: 'not_configured' };

  try {
    const res = await client.post('/api/v1/sendTemplateMessage', {
      template_name : templateName,
      broadcast_name: `notif_${Date.now()}`,
      receivers     : [{
        whatsappNumber: phone.replace(/\D/g, ''),
        customParams  : params,
      }],
    });

    const messageId = res.data?.result?.messageId || null;
    return { sent: true, messageId, provider: 'wati' };
  } catch (err) {
    console.error('[WhatsApp] Notif send failed:', err.response?.data || err.message);
    return { sent: false, reason: err.message };
  }
}

// ─────────────────────────────────────────────
//  WHATSAPP TEMPLATE NAMES
//  These must be pre-approved in WATI dashboard
// ─────────────────────────────────────────────

const TEMPLATES = {
  OTP             : process.env.WATI_OTP_TEMPLATE_NAME   || 'sayari_otp',
  NEW_FOLLOWER    : 'sayari_new_follower',       // {{name}} ne aapko follow kiya
  NEW_CHAPTER     : 'sayari_new_chapter',        // {{author}} ne naya chapter publish kiya: {{title}}
  POST_LIKED      : 'sayari_post_liked',         // Aapki post ko {{count}} logon ne pasand kiya
  ACCOUNT_WARNING : 'sayari_account_warning',    // Admin warning message
  WELCOME         : 'sayari_welcome',            // Welcome to Sayari!
};

module.exports = { sendOtpMessage, sendNotificationMessage, TEMPLATES };
