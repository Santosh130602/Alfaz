'use strict';

const { Notification, User, Follow } = require('../../../models');
const { queueNotification }           = require('../../../jobs/notification.queue');
const { getCache, setCache, delCache } = require('../../../config/redis');
const { Errors }                       = require('../../../utils/appError');

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function paginate(q) {
  const page  = Math.max(1, parseInt(q.page  || 1));
  const limit = Math.min(50, Math.max(1, parseInt(q.limit || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

// ─────────────────────────────────────────────
//  TRIGGER FUNCTIONS
//  Called by engagement/post/admin services
//  Each function checks user prefs before queuing
// ─────────────────────────────────────────────

/**
 * Someone followed you
 */
async function notifyNewFollower(followerId, followingId) {
  const follower = await User.findById(followerId).select('username displayName avatar').lean();
  if (!follower) return;

  await queueNotification(followingId, {
    type  : 'new_follower',
    title : 'New Follower!',
    body  : `${follower.displayName} (@${follower.username}) ne aapko follow kiya`,
    actor : followerId,
    meta  : {
      imageUrl: follower.avatar?.thumbnail || null,
      deepLink: `/u/${follower.username}`,
    },
  });
}

/**
 * Someone liked your post
 * Batched — only notify when total reaches 1, 10, 50, 100, 500...
 */
async function notifyPostLiked(likerId, postId, postAuthorId, currentLikeCount) {
  if (String(likerId) === String(postAuthorId)) return;

  const milestones = [1, 10, 50, 100, 500, 1000, 5000, 10000];
  if (!milestones.includes(currentLikeCount)) return;

  const liker = await User.findById(likerId).select('username displayName avatar').lean();
  if (!liker) return;

  const body = currentLikeCount === 1
    ? `${liker.displayName} ne aapki post ko pasand kiya`
    : `Aapki post ko ${currentLikeCount} logon ne pasand kiya! 🎉`;

  await queueNotification(postAuthorId, {
    type  : 'post_liked',
    title : '❤️ Post Liked!',
    body,
    actor : likerId,
    meta  : { postId, deepLink: `/post/${postId}`, imageUrl: liker.avatar?.thumbnail || null },
  });
}

/**
 * Someone commented on your post
 */
async function notifyPostCommented(commenterId, postId, postAuthorId, commentContent) {
  if (String(commenterId) === String(postAuthorId)) return;

  const commenter = await User.findById(commenterId).select('username displayName avatar').lean();
  if (!commenter) return;

  await queueNotification(postAuthorId, {
    type  : 'post_commented',
    title : '💬 New Comment',
    body  : `${commenter.displayName}: "${commentContent.substring(0, 60)}${commentContent.length > 60 ? '...' : ''}"`,
    actor : commenterId,
    meta  : { postId, deepLink: `/post/${postId}`, imageUrl: commenter.avatar?.thumbnail || null },
  });
}

/**
 * Someone replied to your comment
 */
async function notifyCommentReplied(replierId, parentCommentAuthorId, postId, replyContent) {
  if (String(replierId) === String(parentCommentAuthorId)) return;

  const replier = await User.findById(replierId).select('username displayName').lean();
  if (!replier) return;

  await queueNotification(parentCommentAuthorId, {
    type  : 'comment_replied',
    title : '↩️ Reply on your comment',
    body  : `${replier.displayName} ne aapke comment ka jawab diya`,
    actor : replierId,
    meta  : { postId, deepLink: `/post/${postId}` },
  });
}

/**
 * Someone mentioned you in a comment
 */
async function notifyMention(mentionerId, mentionedUserId, postId, commentId) {
  if (String(mentionerId) === String(mentionedUserId)) return;

  const mentioner = await User.findById(mentionerId).select('username displayName avatar').lean();
  if (!mentioner) return;

  await queueNotification(mentionedUserId, {
    type  : 'mention',
    title : '@ Mention',
    body  : `${mentioner.displayName} (@${mentioner.username}) ne aapko mention kiya`,
    actor : mentionerId,
    meta  : { postId, commentId, deepLink: `/post/${postId}` },
  });
}

/**
 * New chapter published — notify all followers of the author
 * Paginated fan-out to avoid huge memory use
 */
async function notifyNewChapter(authorId, seriesId, postId, chapterTitle, seriesTitle) {
  const author = await User.findById(authorId).select('username displayName avatar').lean();
  if (!author) return;

  const CHUNK = 500;
  let   skip  = 0;
  let   total = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const followers = await Follow.find({ following: authorId })
      .select('follower notifyNewPosts')
      .skip(skip).limit(CHUNK).lean();

    if (!followers.length) break;

    const notifyList = followers.filter(f => f.notifyNewPosts !== false);

    await Promise.all(notifyList.map(f =>
      queueNotification(f.follower, {
        type  : 'new_chapter',
        title : `📖 ${author.displayName} ka naya chapter!`,
        body  : `"${seriesTitle}" — ${chapterTitle || 'Naya chapter publish hua'}`,
        actor : authorId,
        meta  : {
          seriesId,
          postId,
          deepLink: `/series/${seriesId}`,
          imageUrl: author.avatar?.thumbnail || null,
        },
      }).catch(() => {})
    ));

    total += notifyList.length;
    skip  += CHUNK;
    if (followers.length < CHUNK) break;
  }

  console.log(`[Notify] New chapter queued for ${total} followers of ${author.username}`);
}

/**
 * Admin awarded a badge
 */
async function notifyBadgeAwarded(userId, badgeType) {
  const badgeNames = {
    verified    : '✅ Verified Badge',
    rising_star : '🌟 Rising Star',
    top_creator : '🏆 Top Creator',
    voice_artist: '🎙️ Voice Artist',
    author      : '📚 Author Badge',
    admin_pick  : '⭐ Admin Pick',
  };

  await queueNotification(userId, {
    type    : 'badge_awarded',
    title   : '🎉 Badge Mila!',
    body    : `Mubarak ho! Aapko "${badgeNames[badgeType] || badgeType}" mila`,
    meta    : { badgeType, deepLink: '/profile/badges' },
    priority: 1,
  });
}

/**
 * Account warning from admin
 */
async function notifyAccountWarning(userId, reason) {
  await queueNotification(userId, {
    type    : 'account_warning',
    title   : '⚠️ Account Warning',
    body    : `Aapko admin ki taraf se warning mili hai: ${reason}`,
    meta    : { deepLink: '/support' },
    priority: 1,
    channels: { isAdmin: true },
  });
}

/**
 * Scheduled post went live
 */
async function notifyScheduledPublished(userId, postId, postTitle) {
  await queueNotification(userId, {
    type : 'scheduled_published',
    title: '✅ Post Published!',
    body : `Aapki scheduled post "${postTitle || 'Aapki post'}" publish ho gayi`,
    meta : { postId, deepLink: `/post/${postId}` },
  });
}

/**
 * Series marked as completed
 */
async function notifySeriesCompleted(authorId, seriesId, seriesTitle) {
  const author = await User.findById(authorId).select('username displayName avatar').lean();
  if (!author) return;

  const CHUNK = 500;
  let   skip  = 0;

  while (true) {
    const followers = await Follow.find({ following: authorId })
      .select('follower').skip(skip).limit(CHUNK).lean();
    if (!followers.length) break;

    await Promise.all(followers.map(f =>
      queueNotification(f.follower, {
        type : 'series_completed',
        title: '🎊 Series Complete!',
        body : `${author.displayName} ki series "${seriesTitle}" complete ho gayi!`,
        actor: authorId,
        meta : { seriesId, deepLink: `/series/${seriesId}` },
      }).catch(() => {})
    ));

    skip += CHUNK;
    if (followers.length < CHUNK) break;
  }
}

// ─────────────────────────────────────────────
//  NOTIFICATION CRUD (for user's inbox)
// ─────────────────────────────────────────────

async function getMyNotifications(userId, query) {
  const { page, limit, skip } = paginate(query);
  const { type, unreadOnly }  = query;

  const filter = { recipient: userId };
  if (type)      filter.type    = type;
  if (unreadOnly === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('actor', 'username displayName avatar isVerified')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  // Sync unread count in Redis
  await setCache(`notif_unread:${userId}`, unreadCount, 86400);

  return {
    notifications,
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function markAsRead(userId, notificationId) {
  const notif = await Notification.findOne({ _id: notificationId, recipient: userId });
  if (!notif) throw Errors.notFound('Notification not found', 'NOTIF_NOT_FOUND');

  if (!notif.isRead) {
    notif.isRead = true;
    notif.readAt = new Date();
    await notif.save();

    // Decrement Redis unread counter
    const current = parseInt(await getCache(`notif_unread:${userId}`) || 0);
    if (current > 0) await setCache(`notif_unread:${userId}`, current - 1, 86400);
  }

  return { read: true };
}

async function markAllAsRead(userId) {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  await setCache(`notif_unread:${userId}`, 0, 86400);
  return { read: true };
}

async function deleteNotification(userId, notificationId) {
  const notif = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  if (!notif) throw Errors.notFound('Notification not found', 'NOTIF_NOT_FOUND');

  if (!notif.isRead) {
    const current = parseInt(await getCache(`notif_unread:${userId}`) || 0);
    if (current > 0) await setCache(`notif_unread:${userId}`, current - 1, 86400);
  }
  return { deleted: true };
}

async function getUnreadCount(userId) {
  const cached = await getCache(`notif_unread:${userId}`);
  if (cached !== null) return { count: parseInt(cached) };

  const count = await Notification.countDocuments({ recipient: userId, isRead: false });
  await setCache(`notif_unread:${userId}`, count, 86400);
  return { count };
}

async function updateDeviceToken(userId, token, platform) {
  if (!token || !platform) throw Errors.badRequest('Token and platform required', 'MISSING_FIELDS');

  // Remove any existing entry with same token, then add fresh
  await User.findByIdAndUpdate(userId, {
    $pull: { deviceTokens: { token } },
  });
  await User.findByIdAndUpdate(userId, {
    $push: { deviceTokens: { token, platform, addedAt: new Date() } },
  });

  return { registered: true };
}

async function removeDeviceToken(userId, token) {
  await User.findByIdAndUpdate(userId, {
    $pull: { deviceTokens: { token } },
  });
  return { removed: true };
}

async function updateNotifPrefs(userId, prefs) {
  const allowed = ['newFollower','newComment','newLike','newChapter','adminAnnouncement','whatsapp','push','email'];
  const update  = {};
  allowed.forEach(k => { if (prefs[k] !== undefined) update[`notificationPrefs.${k}`] = prefs[k]; });

  await User.findByIdAndUpdate(userId, { $set: update });
  return { updated: true };
}

module.exports = {
  // Triggers
  notifyNewFollower,
  notifyPostLiked,
  notifyPostCommented,
  notifyCommentReplied,
  notifyMention,
  notifyNewChapter,
  notifyBadgeAwarded,
  notifyAccountWarning,
  notifyScheduledPublished,
  notifySeriesCompleted,
  // Inbox CRUD
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  // Device tokens
  updateDeviceToken,
  removeDeviceToken,
  // Preferences
  updateNotifPrefs,
};
