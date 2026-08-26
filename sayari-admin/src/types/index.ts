// ─────────────────────────────────────────────
//  SAYARI FRONTEND — GLOBAL TYPES
// ─────────────────────────────────────────────

// ── Common ───────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

// ── Auth ──────────────────────────────────────

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  _id: string
  username: string
  displayName: string
  email?: string
  avatar?: { url: string | null; thumbnail: string | null }
  bio?: string
  isVerified: boolean
  badges: Badge[]
  stats: UserStats
  channel?: string | Channel
  role: 'user' | 'creator' | 'moderator' | 'admin' | 'superadmin'
  language: 'ur' | 'hi' | 'en' | 'mixed'
  notificationPrefs: NotificationPrefs
  socialLinks?: { instagram?: string | null; youtube?: string | null; twitter?: string | null; website?: string | null }
  createdAt: string
}

export interface UserStats {
  followersCount: number
  followingCount: number
  postsCount: number
  totalLikes: number
  totalViews: number
  totalPlays: number
}

export interface NotificationPrefs {
  newFollower: boolean
  newComment: boolean
  newLike: boolean
  newChapter: boolean
  adminAnnouncement: boolean
  whatsapp: boolean
  push: boolean
  email: boolean
}

// ── Badge ─────────────────────────────────────

export type BadgeType = 'verified' | 'rising_star' | 'top_creator' | 'voice_artist' | 'author' | 'admin_pick'

export interface Badge {
  type: BadgeType
  awardedAt: string
}

export interface BadgeProgress {
  type: BadgeType
  label: string
  earned: boolean
  pct?: number
  followers?: number
  target?: number
  likes?: number
  audioPosts?: number
  completedSeries?: number
  daysRemaining?: number
}

// ── Channel ───────────────────────────────────

export interface Channel {
  _id: string
  handle: string
  name: string
  tagline?: string
  description?: string
  logo?: { url: string | null; thumbnail: string | null }
  theme?: { bannerImage?: { url: string | null }; accentColor?: string }
  category?: { primary: string; secondary?: string[] }
  languages?: string[]
  isPublic: boolean
  isVerified: boolean
  stats: ChannelStats
  featuredPost?: Post | null
  owner?: AuthUser
  createdAt: string
}

export interface ChannelStats {
  followersCount: number
  postsCount: number
  seriesCount: number
  audioCount: number
  totalViews: number
  totalLikes: number
}

// ── Post ──────────────────────────────────────

export type PostType = 'sayari' | 'kavita' | 'ghazal' | 'nazm' | 'story_chapter' | 'book_chapter' | 'audio' | 'quote' | 'shayari'
export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived' | 'under_review'
export type Visibility = 'public' | 'private' | 'followers_only'
export type Language = 'ur' | 'hi' | 'en' | 'pa' | 'mixed'
export type Mood = 'ishq' | 'dard' | 'khushi' | 'udaasi' | 'gussa' | 'ummeed' | 'motivational' | 'romantic' | 'funny' | 'religious' | 'patriotic' | 'nature'

export interface Post {
  _id: string
  type: PostType
  title?: string
  slug?: string
  status: PostStatus
  visibility: Visibility
  language: Language
  mood: Mood[]
  tags: string[]
  genre?: string
  renderedImage?: {
    url: string
    thumbnail: string
    width: number
    height: number
    renderedAt: string
  } | null
  canvasState?: CanvasState | null
  audio?: AudioMeta | null
  series?: Series | null
  chapterNumber?: number
  chapterTitle?: string
  scheduledAt?: string
  publishedAt?: string
  stats: PostStats
  watermark?: { enabled: boolean; position: string; opacity: number }
  isFeatured: boolean
  isTrending: boolean
  author: AuthUser
  channel: Channel
  createdAt: string
}

export interface PostStats {
  viewCount: number
  likeCount: number
  commentCount: number
  saveCount: number
  shareCount: number
  playCount: number
}

export interface CanvasState {
  templateId?: string
  backgroundType: 'color' | 'gradient' | 'template_image' | 'custom_image'
  backgroundColor?: string
  backgroundImage?: { url: string; driveId: string } | null
  canvasWidth: number
  canvasHeight: number
  fabricJson?: object | null
  stickersUsed?: string[]
  fontsUsed?: string[]
}

export interface AudioMeta {
  fileUrl?: string
  duration?: number
  sizeBytes?: number
  mimeType?: string
  coverImage?: { url: string | null; thumbnail: string | null }
  waveformData?: number[]
  narrator?: string
  isProcessed?: boolean
}

// ── Series ────────────────────────────────────

export type SeriesType = 'story' | 'novel' | 'poetry_collection' | 'audiobook' | 'audio_series' | 'book'
export type CompletionStatus = 'ongoing' | 'completed' | 'on_hiatus' | 'dropped'

export interface Series {
  _id: string
  title: string
  slug?: string
  description?: string
  type: SeriesType
  cover?: { url: string | null; thumbnail: string | null }
  language: Language
  genre?: string
  tags: string[]
  completionStatus: CompletionStatus
  totalChapters: number
  publishedChapters: number
  estimatedChapters?: number
  status: 'draft' | 'published' | 'archived'
  visibility: Visibility
  stats: { viewCount: number; likeCount: number; saveCount: number; commentCount: number }
  author: AuthUser
  channel: Channel
  chapters?: ChapterMeta[]
  createdAt: string
}

export interface ChapterMeta {
  postId: string
  chapterNumber: number
  title?: string
  publishedAt?: string
  status: 'draft' | 'published' | 'scheduled'
  scheduledAt?: string
}

// ── Comment ───────────────────────────────────

export interface Comment {
  _id: string
  author: AuthUser
  postId: string
  parentComment?: string | null
  content: string
  likeCount: number
  replyCount: number
  userReaction?: string | null
  isDeleted: boolean
  createdAt: string
}

// ── Notification ──────────────────────────────

export type NotificationType =
  | 'new_follower' | 'post_liked' | 'post_commented' | 'comment_replied'
  | 'comment_liked' | 'new_chapter' | 'series_completed' | 'post_saved'
  | 'post_featured' | 'badge_awarded' | 'admin_announcement' | 'account_warning'
  | 'scheduled_published' | 'mention'

export interface Notification {
  _id: string
  type: NotificationType
  title: string
  body: string
  actor?: AuthUser | null
  meta?: {
    postId?: string
    seriesId?: string
    commentId?: string
    deepLink?: string
    imageUrl?: string
    badgeType?: string
  }
  isRead: boolean
  readAt?: string
  createdAt: string
}

// ── Template / Asset ──────────────────────────

export interface Template {
  _id: string
  name: string
  category: string
  tags: string[]
  mood: string[]
  orientation: 'square' | 'portrait' | 'landscape' | 'story'
  dimensions: { width: number; height: number }
  image: { url: string; thumbnail: string }
  defaultTextZones?: TextZone[]
  isPremium: boolean
  usageCount: number
  sortOrder: number
}

export interface TextZone {
  id: string
  x: number
  y: number
  width: number
  height: number
  textAlign: 'left' | 'center' | 'right'
  fontColor: string
  fontSize: number
  fontFamily: string
}

export interface Asset {
  _id: string
  name: string
  assetType: 'sticker' | 'logo' | 'font' | 'icon' | 'frame' | 'divider' | 'watermark'
  category: string
  tags: string[]
  file: { url: string; thumbnail: string | null; mimeType: string }
  fontMeta?: {
    fontFamily: string
    supportsUrdu: boolean
    supportsHindi: boolean
    previewText: string
  }
  isPremium: boolean
  usageCount: number
}

// ── Analytics ─────────────────────────────────

export interface ChannelOverview {
  period: string
  posts: { total: number; published: number; draft: number }
  series: { total: number }
  followers: { total: number; new: number }
  engagement: {
    views: number
    likes: number
    comments: number
    saves: number
    audioPlays: number
  }
}

export interface ChartDataPoint {
  date: string
  count?: number
  total?: number
  views?: number
  uniqueViews?: number
  likes?: number
}

// ── Feed / Search ─────────────────────────────

export type FeedSort = 'newest' | 'popular' | 'trending'
export type SearchSort = 'relevance' | 'newest' | 'popular'

export interface FeedFilters {
  type?: PostType
  language?: Language
  mood?: Mood
  genre?: string
  sort?: FeedSort
  page?: number
  limit?: number
}

// ── Reactions ─────────────────────────────────

export type ReactionType = 'like' | 'wah_wah' | 'dil' | 'kya_baat' | 'rula_diya' | 'haha'

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'like',      emoji: '👍', label: 'Like'      },
  { type: 'dil',       emoji: '❤️', label: 'Dil'       },
  { type: 'wah_wah',   emoji: '👏', label: 'Wah Wah'   },
  { type: 'kya_baat',  emoji: '🔥', label: 'Kya Baat'  },
  { type: 'rula_diya', emoji: '😢', label: 'Rula Diya' },
  { type: 'haha',      emoji: '😄', label: 'Haha'      },
]

// ── Admin ─────────────────────────────────────

export interface AdminUser extends AuthUser {
  email: string
  accountStatus: 'active' | 'suspended' | 'banned' | 'deactivated'
  phone?: { number: string; isVerified: boolean }
  whatsapp?: { number: string; isVerified: boolean }
  banInfo?: { reason?: string; bannedAt?: string; banExpiresAt?: string }
  emailVerified: boolean
  lastLoginAt?: string
}

export interface Report {
  _id: string
  reporter: AuthUser
  targetType: 'post' | 'comment' | 'user' | 'series'
  target: string
  reason: string
  description?: string
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed'
  reviewedBy?: AuthUser
  reviewedAt?: string
  adminNote?: string
  createdAt: string
}

export interface Announcement {
  _id: string
  title: string
  body: string
  type: 'general' | 'feature' | 'maintenance' | 'celebration'
  targetAudience: 'all' | 'creators' | 'new_users' | 'specific'
  isActive: boolean
  sentCount: number
  publishedAt?: string
  scheduledAt?: string
  createdBy: AuthUser
  createdAt: string
}

export interface AdminAction {
  _id: string
  admin: AuthUser
  actionType: string
  targetType: string
  targetId: string
  reason: string
  createdAt: string
}

export interface PlatformStats {
  period: string
  overview: {
    totalUsers: number
    newUsers: number
    totalPosts: number
    newPosts: number
    totalSeries: number
    bannedUsers: number
    reportsPending: number
  }
  topPosts: Post[]
  topChannels: Channel[]
  dailyRegistrations: { _id: string; count: number }[]
  postTypeBreakdown: Record<string, number>
}

export interface AppConfig {
  _id: string
  key: string
  value: unknown
  valueType: string
  description: string
  isPublic: boolean
}



export interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  // Add icon?: React.ReactNode so TypeScript knows it's allowed!
  options: { value: string; label: string; icon?: React.ReactNode }[] 
  className?: string
  placeholder?: string
}