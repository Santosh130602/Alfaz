'use strict';

const { google }   = require('googleapis');
const { Readable } = require('stream');
const { DriveToken } = require('../models');
const { setCache, getCache } = require('../config/redis');
const { Errors } = require('../utils/appError');

const CACHE_KEY   = 'drive:token:primary';
const CACHE_TTL   = 3500;          // refresh token 58 min (expires in 1hr)

// ─────────────────────────────────────────────
//  BUILD AUTHORISED DRIVE CLIENT
//  Reads credentials from DB, caches in Redis
// ─────────────────────────────────────────────

// async function getDriveClient() {
//   // Try Redis cache first
//   let tokenDoc = await getCache(CACHE_KEY);

//   if (!tokenDoc) {
//     tokenDoc = await DriveToken.findOne({ label: 'primary', isActive: true })
//       .select('+accessToken +refreshToken');
//     if (!tokenDoc) throw Errors.internal('Google Drive not configured', 'DRIVE_NOT_CONFIGURED');
//     await setCache(CACHE_KEY, tokenDoc.toObject(), CACHE_TTL);
//   }

//   const oauth2 = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     'https://developers.google.com/oauthplayground',

//   );

//   oauth2.setCredentials({
//     access_token : tokenDoc.accessToken,
//     refresh_token: tokenDoc.refreshToken,
//   });

//   // Auto-refresh handler — save new token back to DB + Redis
//   oauth2.on('tokens', async (newTokens) => {
//     if (newTokens.access_token) {
//       await DriveToken.findOneAndUpdate(
//         { label: 'primary' },
//         { accessToken: newTokens.access_token, expiresAt: new Date(newTokens.expiry_date) }
//       );
//       await setCache(CACHE_KEY, { ...tokenDoc, accessToken: newTokens.access_token }, CACHE_TTL);
//     }
//   });

//   return { drive: google.drive({ version: 'v3', auth: oauth2 }), folders: tokenDoc.folders };
// }



async function getDriveClient() {
  let tokenDoc = await getCache(CACHE_KEY);

   if (tokenDoc && !tokenDoc.refreshToken) {
    tokenDoc = null;
  }

  if (!tokenDoc) {
    tokenDoc = await DriveToken.findOne({ label: 'primary', isActive: true })
      .select('+accessToken +refreshToken');
    if (!tokenDoc) throw Errors.internal('Google Drive not configured', 'DRIVE_NOT_CONFIGURED');
    await setCache(CACHE_KEY, tokenDoc.toObject(), CACHE_TTL);
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
  );

  // Only set refresh_token — let Google auto-generate a fresh access token
  oauth2.setCredentials({
    refresh_token: tokenDoc.refreshToken,
  });

  // Auto-refresh handler — save new token back to DB + Redis
  oauth2.on('tokens', async (newTokens) => {
    if (newTokens.access_token) {
      await DriveToken.findOneAndUpdate(
        { label: 'primary' },
        { 
          accessToken: newTokens.access_token, 
          expiresAt  : new Date(newTokens.expiry_date) 
        }
      );
      await setCache(CACHE_KEY, { 
        ...tokenDoc, 
        accessToken: newTokens.access_token 
      }, CACHE_TTL);
    }
  });

  return { 
    drive  : google.drive({ version: 'v3', auth: oauth2 }), 
    folders: tokenDoc.folders 
  };
}

// ─────────────────────────────────────────────
//  UPLOAD FILE TO GOOGLE DRIVE
// ─────────────────────────────────────────────

/**
 * @param {Buffer}  buffer    - File content
 * @param {string}  filename  - Desired filename
 * @param {string}  mimeType  - e.g. 'image/png', 'audio/mpeg'
 * @param {string}  folderKey - Key from DriveToken.folders: 'posts'|'audio'|'covers'|'avatars'|'templates'|'assets'
 * @returns {{ driveId, url, thumbnail }}
 */
async function uploadFile(buffer, filename, mimeType, folderKey = 'posts') {
  const { drive, folders } = await getDriveClient();
  const folderId = folders?.[folderKey] || null;

  const stream = Readable.from(buffer);

  const response = await drive.files.create({
    requestBody: {
      name    : filename,
      parents : folderId ? [folderId] : [],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, name, size, mimeType, webViewLink, webContentLink',
  });

  const fileId = response.data.id;

  // Make file publicly readable (so CDN / frontend can display it)
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  const url       = `https://drive.google.com/uc?export=view&id=${fileId}`;
  const thumbnail = `https://drive.google.com/thumbnail?id=${fileId}&sz=w300`;

  
  return {
    driveId  : fileId,
    url,
    thumbnail,
    sizeBytes: parseInt(response.data.size || 0),
    mimeType,
  };
}

// ─────────────────────────────────────────────
//  DELETE FILE FROM GOOGLE DRIVE
// ─────────────────────────────────────────────

async function deleteFile(driveId) {
  if (!driveId) return;
  try {
    const { drive } = await getDriveClient();
    await drive.files.delete({ fileId: driveId });
  } catch (err) {
    // Don't crash if file already deleted
    console.warn(`[Drive] Could not delete file ${driveId}:`, err.message);
  }
}

// ─────────────────────────────────────────────
//  GET FILE METADATA
// ─────────────────────────────────────────────

async function getFileMeta(driveId) {
  const { drive } = await getDriveClient();
  const res = await drive.files.get({ fileId: driveId, fields: 'id,name,size,mimeType,createdTime' });
  return res.data;
}

// ─────────────────────────────────────────────
//  CHECK QUOTA
// ─────────────────────────────────────────────

async function getQuotaInfo() {
  const { drive } = await getDriveClient();
  const res = await drive.about.get({ fields: 'storageQuota' });
  return res.data.storageQuota;  // { limit, usage, usageInDrive }
}

// ─────────────────────────────────────────────
//  ENSURE FOLDER EXISTS (creates if missing)
// ─────────────────────────────────────────────

async function ensureFolder(name, parentId = null) {
  const { drive } = await getDriveClient();

  // Search for existing
  const q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    + (parentId ? ` and '${parentId}' in parents` : '');

  const existing = await drive.files.list({ q, fields: 'files(id, name)', pageSize: 1 });
  if (existing.data.files.length > 0) return existing.data.files[0].id;

  // Create
  const res = await drive.files.create({
    requestBody: {
      name    : name,
      mimeType: 'application/vnd.google-apps.folder',
      parents : parentId ? [parentId] : [],
    },
    fields: 'id',
  });
  return res.data.id;
}





async function streamFile(driveId, res) {
  const { drive } = await getDriveClient();

  const response = await drive.files.get(
    { fileId: driveId, alt: 'media' },
    { responseType: 'stream' }
  );

  const contentType = response.headers['content-type'] || 'image/jpeg';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24 hours

  response.data.pipe(res);
}



module.exports = { uploadFile, deleteFile, getFileMeta, getQuotaInfo, ensureFolder, getDriveClient, streamFile };
