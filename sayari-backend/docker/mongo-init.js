// docker/mongo-init.js
// Runs once when MongoDB container starts for the first time

db = db.getSiblingDB('sayari');

db.createUser({
  user: 'sayari_user',
  pwd : 'sayari_db_pass_changeme',
  roles: [{ role: 'readWrite', db: 'sayari' }],
});

const collections = [
  'users','channels','posts','series',
  'templates','assets','likes','comments',
  'saves','follows','views','reports',
  'notifications','whatsapp_otps','announcements',
  'post_analytics','channel_analytics','platform_analytics','trending',
  'sessions','admin_actions','app_configs','drive_tokens',
];

collections.forEach(name => {
  try { db.createCollection(name); } catch(e) { /* already exists */ }
});

// Create indexes upfront for performance
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 },    { unique: true, sparse: true });
db.posts.createIndex({ channel: 1, status: 1, visibility: 1, isDeleted: 1, publishedAt: -1 });
db.follows.createIndex({ follower: 1, following: 1 }, { unique: true });
db.likes.createIndex({ user: 1, target: 1, targetType: 1 }, { unique: true });
db.sessions.createIndex({ refreshToken: 1 }, { unique: true });

print('✅ Sayari MongoDB initialised');
