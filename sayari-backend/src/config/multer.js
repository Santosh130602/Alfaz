'use strict';

const multer = require('multer');
const { Errors } = require('../utils/appError');

// ─────────────────────────────────────────────
//  ALLOWED TYPES
// ─────────────────────────────────────────────

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const AUDIO_MIMES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/x-m4a'];
const ALL_MIMES   = [...IMAGE_MIMES, ...AUDIO_MIMES];

// Sizes
const MAX_IMAGE_MB = parseInt(process.env.MAX_IMAGE_MB || '15')  * 1024 * 1024;
const MAX_AUDIO_MB = parseInt(process.env.MAX_AUDIO_MB || '100') * 1024 * 1024;
const MAX_ASSET_MB = parseInt(process.env.MAX_ASSET_MB || '20')  * 1024 * 1024;

// ─────────────────────────────────────────────
//  MEMORY STORAGE (buffer → Google Drive)
// ─────────────────────────────────────────────

const memoryStorage = multer.memoryStorage();

// ── Image uploads (avatar, cover, template, asset) ──
const imageUpload = multer({
  storage : memoryStorage,
  limits  : { fileSize: MAX_IMAGE_MB, files: 1 },
  fileFilter (req, file, cb) {
    if (IMAGE_MIMES.includes(file.mimetype)) return cb(null, true);
    cb(Errors.badRequest(`Invalid image type. Allowed: jpeg, png, webp, gif`, 'INVALID_IMAGE_TYPE'));
  },
});

// ── Audio uploads ──
const audioUpload = multer({
  storage : memoryStorage,
  limits  : { fileSize: MAX_AUDIO_MB, files: 1 },
  fileFilter (req, file, cb) {
    if (AUDIO_MIMES.includes(file.mimetype)) return cb(null, true);
    cb(Errors.badRequest(`Invalid audio type. Allowed: mp3, wav, m4a, ogg`, 'INVALID_AUDIO_TYPE'));
  },
});

// ── Admin asset uploads (images + fonts) ──
const assetUpload = multer({
  storage : memoryStorage,
  limits  : { fileSize: MAX_ASSET_MB, files: 1 },
  fileFilter (req, file, cb) {
    const allowed = [...IMAGE_MIMES, 'font/ttf', 'font/otf', 'application/octet-stream'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(ttf|otf|woff|woff2)$/i)) {
      return cb(null, true);
    }
    cb(Errors.badRequest('Invalid file type', 'INVALID_FILE_TYPE'));
  },
});

// ── Multiple files (admin bulk asset upload) ──
const multiAssetUpload = multer({
  storage : memoryStorage,
  limits  : { fileSize: MAX_ASSET_MB, files: 20 },
  fileFilter (req, file, cb) {
    if ([...IMAGE_MIMES, 'application/octet-stream'].includes(file.mimetype)) return cb(null, true);
    cb(null, false); // silently skip unsupported files
  },
});

module.exports = { imageUpload, audioUpload, assetUpload, multiAssetUpload };
