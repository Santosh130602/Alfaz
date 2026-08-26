import api from './client'
import type {
  AuthUser, TokenPair, Post, Series, Channel, Comment,
  Notification, Template, Asset, ChannelOverview, FeedFilters,
  PostType, Visibility, Language, Mood, ReactionType, BadgeProgress,
} from '../types'

// ─────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; username: string; displayName: string; language?: string }) =>
    api.post<{ data: { user: AuthUser; tokens: TokenPair; channel: string } }>('/auth/register', data),

  login: (data: { email: string; password: string; deviceInfo?: object }) =>
    api.post<{ data: { user: AuthUser; tokens: TokenPair } }>('/auth/login', data),

  sendOtp: (phone: string, purpose: string) =>
    api.post('/auth/whatsapp/send-otp', { phone, purpose }),

  verifyOtp: (phone: string, otp: string, purpose: string) =>
    api.post<{ data: { verified: boolean; action: string; user?: AuthUser; tokens?: TokenPair; otpSessionToken?: string; phone?: string } }>(
      '/auth/whatsapp/verify-otp', { phone, otp, purpose }
    ),

  completeWhatsappSignup: (data: { phone: string; otpToken: string; username: string; displayName: string; language?: string }) =>
    api.post<{ data: { user: AuthUser; tokens: TokenPair } }>('/auth/whatsapp/complete-signup', data),

  googleAuth: (idToken: string, deviceInfo?: object) =>
    api.post<{ data: { user: AuthUser; tokens: TokenPair; isNew: boolean } }>('/auth/google', { idToken, deviceInfo }),

  appleAuth: (identityToken: string, user?: object, deviceInfo?: object) =>
    api.post<{ data: { user: AuthUser; tokens: TokenPair; isNew: boolean } }>('/auth/apple', { identityToken, user, deviceInfo }),

  refresh: (refreshToken: string) =>
    api.post<{ data: { tokens: TokenPair; user: AuthUser } }>('/auth/refresh', { refreshToken }),

  logout: (refreshToken?: string, allDevices?: boolean) =>
    api.post('/auth/logout', { refreshToken, allDevices }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string, confirmPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword, confirmPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),

  me: () =>
    api.get<{ data: { user: AuthUser } }>('/auth/me'),
}

// ─────────────────────────────────────────────
//  POSTS
// ─────────────────────────────────────────────

export const postsApi = {
  list: (params?: FeedFilters & { channelId?: string; status?: string; visibility?: string }) =>
    api.get<{ data: { posts: Post[]; pagination: object } }>('/posts', { params }),

  myPosts: (params?: { status?: string; type?: string; visibility?: string; page?: number; limit?: number }) =>
    api.get<{ data: { posts: Post[]; pagination: object } }>('/posts/me', { params }),

  get: (id: string) =>
    api.get<{ data: { post: Post } }>(`/posts/${id}`),

  create: (data: {
    type: PostType; title?: string; language?: Language; mood?: Mood[]
    tags?: string[]; genre?: string; visibility?: Visibility
    canvasState?: object; seriesId?: string; chapterNumber?: number
    chapterTitle?: string; scheduledAt?: string; watermark?: object; channelId?: string
  }) => api.post<{ data: { post: Post } }>('/posts', data),

  update: (id: string, data: Partial<Post>) =>
    api.patch<{ data: { post: Post } }>(`/posts/${id}`, data),

  publish: (id: string, scheduledAt?: string) =>
    api.post<{ data: { post: Post } }>(`/posts/${id}/publish`, { scheduledAt }),

  delete: (id: string) =>
    api.delete(`/posts/${id}`),

  updateVisibility: (id: string, visibility: Visibility) =>
    api.patch(`/posts/${id}/visibility`, { visibility }),

  uploadAudio: (id: string, file: File, onProgress?: (pct: number) => void) => {
    const fd = new FormData(); fd.append('audio', file)
    return api.post<{ data: { post: Post } }>(`/posts/${id}/audio`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => { if (onProgress && e.total) onProgress(Math.round(e.loaded * 100 / e.total)) },
    })
  },

  uploadCover: (id: string, file: File) => {
    const fd = new FormData(); fd.append('cover', file)
    return api.post<{ data: { post: Post } }>(`/posts/${id}/cover`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  triggerRender: (id: string) =>
    api.post<{ data: { queued: boolean; jobId: string } }>(`/posts/${id}/render`),

  getRenderStatus: (id: string) =>
    api.get<{ data: { rendered: boolean; imageUrl: string | null; thumbnail: string | null; status: string } }>(`/posts/${id}/render`),
}

// ─────────────────────────────────────────────
//  SERIES
// ─────────────────────────────────────────────

export const seriesApi = {
  list: (params?: { type?: string; language?: string; completionStatus?: string; channelId?: string; page?: number; limit?: number }) =>
    api.get<{ data: { series: Series[]; pagination: object } }>('/series', { params }),

  get: (id: string) =>
    api.get<{ data: { series: Series } }>(`/series/${id}`),

  create: (data: { title: string; description?: string; type: string; language?: string; genre?: string; tags?: string[]; visibility?: Visibility; estimatedChapters?: number }) =>
    api.post<{ data: { series: Series } }>('/series', data),

  update: (id: string, data: Partial<Series>) =>
    api.patch<{ data: { series: Series } }>(`/series/${id}`, data),

  delete: (id: string) =>
    api.delete(`/series/${id}`),

  publish: (id: string) =>
    api.post<{ data: { series: Series } }>(`/series/${id}/publish`),

  uploadCover: (id: string, file: File) => {
    const fd = new FormData(); fd.append('cover', file)
    return api.post<{ data: { series: Series } }>(`/series/${id}/cover`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getChapters: (id: string) =>
    api.get<{ data: { series: Series; chapters: Post[] } }>(`/series/${id}/chapters`),

  reorderChapters: (id: string, orderedPostIds: string[]) =>
    api.patch(`/series/${id}/chapters/reorder`, { orderedPostIds }),
}

// ─────────────────────────────────────────────
//  TEMPLATES & ASSETS
// ─────────────────────────────────────────────

export const templatesApi = {
  list: (params?: { category?: string; orientation?: string; tags?: string; mood?: string; page?: number; limit?: number }) =>
    api.get<{ data: { templates: Template[]; pagination: object } }>('/templates', { params }),

  listAssets: (params?: { assetType?: string; category?: string; tags?: string; page?: number; limit?: number }) =>
    api.get<{ data: { assets: Asset[]; pagination: object } }>('/assets', { params }),
}

// ─────────────────────────────────────────────
//  ENGAGEMENT
// ─────────────────────────────────────────────

export const engagementApi = {
  toggleLike: (targetId: string, targetType: 'post' | 'series' | 'comment', reactionType?: ReactionType) =>
    api.post<{ data: { liked: boolean; reactionType: ReactionType | null } }>(`/likes/${targetId}`, { targetType, reactionType }),

  getLikes: (targetId: string, targetType: string) =>
    api.get<{ data: { count: number; userReaction: ReactionType | null; breakdown: Record<string, number> } }>(`/likes/${targetType}/${targetId}`),

  getComments: (postId: string, params?: { page?: number; limit?: number; parentId?: string }) =>
    api.get<{ data: { comments: Comment[]; pagination: object } }>(`/posts/${postId}/comments`, { params }),

  addComment: (postId: string, content: string, parentCommentId?: string) =>
    api.post<{ data: { comment: Comment } }>(`/posts/${postId}/comments`, { content, parentCommentId }),

  deleteComment: (commentId: string) =>
    api.delete(`/comments/${commentId}`),

  toggleSave: (targetId: string, targetType: 'post' | 'series', collection?: string) =>
    api.post<{ data: { saved: boolean; collection?: string } }>(`/saves/${targetId}`, { targetType, collection }),

  getSaved: (params?: { collection?: string; targetType?: string; page?: number; limit?: number }) =>
    api.get<{ data: { items: (Post | Series)[]; collections: string[]; pagination: object } }>('/saves', { params }),

  toggleFollow: (userId: string) =>
    api.post<{ data: { following: boolean } }>(`/users/${userId}/follow`),

  getFollowers: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get<{ data: { followers: AuthUser[]; pagination: object } }>(`/users/${userId}/followers`, { params }),

  getFollowing: (userId: string, params?: { page?: number; limit?: number }) =>
    api.get<{ data: { following: AuthUser[]; pagination: object } }>(`/users/${userId}/following`, { params }),

  getFollowStatus: (userId: string) =>
    api.get<{ data: { isFollowing: boolean; isFollowedBy: boolean } }>(`/users/${userId}/follow-status`),

  recordView: (targetId: string, targetType: 'post' | 'series', source?: string, audioProgress?: number, guestId?: string) =>
    api.post(`/views/${targetId}`, { targetType, source, audioProgress, guestId }),

  report: (targetId: string, targetType: string, reason: string, description?: string) =>
    api.post(`/reports/${targetId}`, { targetType, reason, description }),
}

// ─────────────────────────────────────────────
//  FEED
// ─────────────────────────────────────────────

export const feedApi = {
  forYou: (params?: FeedFilters) =>
    api.get<{ data: { posts: Post[]; feedType: string; pagination: object } }>('/feed/for-you', { params }),

  trending: (params?: { period?: 'hourly' | 'daily' | 'weekly'; type?: string; language?: string; genre?: string; page?: number; limit?: number }) =>
    api.get<{ data: { posts: Post[]; period: string; pagination: object } }>('/feed/trending', { params }),

  newReleases: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: { posts: Post[]; pagination: object } }>('/feed/new', { params }),

  explore: (params?: FeedFilters) =>
    api.get<{ data: { posts: Post[]; pagination: object } }>('/feed/explore', { params }),

  topCreators: (params?: { limit?: number; language?: string }) =>
    api.get<{ data: { creators: AuthUser[] } }>('/feed/top-creators', { params }),

  moodFeed: (mood: string, params?: { language?: string; page?: number; limit?: number }) =>
    api.get<{ data: { posts: Post[]; mood: string; pagination: object } }>(`/feed/mood/${mood}`, { params }),
}

// ─────────────────────────────────────────────
//  SEARCH
// ─────────────────────────────────────────────

export const searchApi = {
  global: (q: string, params?: { language?: string; type?: string }) =>
    api.get<{ data: { posts: Post[]; channels: Channel[]; series: Series[]; query: string } }>('/search', { params: { q, ...params } }),

  posts: (q: string, params?: { language?: string; type?: string; genre?: string; sort?: string; page?: number; limit?: number }) =>
    api.get<{ data: { posts: Post[]; pagination: object } }>('/search/posts', { params: { q, ...params } }),

  channels: (q: string, params?: { page?: number; limit?: number }) =>
    api.get<{ data: { channels: Channel[]; pagination: object } }>('/search/channels', { params: { q, ...params } }),

  series: (q: string, params?: { language?: string; type?: string; page?: number; limit?: number }) =>
    api.get<{ data: { series: Series[]; pagination: object } }>('/search/series', { params: { q, ...params } }),

  byTag: (tag: string, params?: { language?: string; type?: string; page?: number; limit?: number }) =>
    api.get<{ data: { posts: Post[]; tag: string; pagination: object } }>(`/search/tag/${tag}`, { params }),

  autocomplete: (q: string) =>
    api.get<{ data: { suggestions: { type: string; id: string; handle?: string; username?: string; name?: string; displayName?: string; logo?: object; avatar?: object; isVerified: boolean }[] } }>('/search/autocomplete', { params: { q } }),

  trendingTags: (limit?: number) =>
    api.get<{ data: { tags: { tag: string; count: number; score: number }[] } }>('/search/trending-tags', { params: { limit } }),
}

// ─────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────

export const notificationsApi = {
  list: (params?: { page?: number; limit?: number; type?: string; unreadOnly?: boolean }) =>
    api.get<{ data: { notifications: Notification[]; unreadCount: number; pagination: object } }>('/notifications', { params }),

  unreadCount: () =>
    api.get<{ data: { count: number } }>('/notifications/unread'),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch('/notifications/read-all'),

  delete: (id: string) =>
    api.delete(`/notifications/${id}`),

  registerToken: (token: string, platform: 'ios' | 'android' | 'web') =>
    api.post('/notifications/token', { token, platform }),

  removeToken: (token: string) =>
    api.delete('/notifications/token', { data: { token } }),

  getPrefs: () =>
    api.get<{ data: { prefs: object } }>('/notifications/prefs'),

  updatePrefs: (prefs: Partial<{ newFollower: boolean; newComment: boolean; newLike: boolean; newChapter: boolean; adminAnnouncement: boolean; whatsapp: boolean; push: boolean; email: boolean }>) =>
    api.patch('/notifications/prefs', prefs),
}

// ─────────────────────────────────────────────
//  ANALYTICS
// ─────────────────────────────────────────────

export const analyticsApi = {
  overview: (period?: string) =>
    api.get<{ data: ChannelOverview }>('/analytics/overview', { params: { period } }),

  followerGrowth: (period?: string) =>
    api.get<{ data: { period: string; data: { date: string; count: number; total: number }[]; totalNow: number } }>('/analytics/followers', { params: { period } }),

  viewsChart: (period?: string) =>
    api.get<{ data: { period: string; data: { date: string; views: number; uniqueViews?: number }[] } }>('/analytics/views', { params: { period } }),

  topPosts: (period?: string, sortBy?: string, limit?: number) =>
    api.get<{ data: { period: string; sortBy: string; posts: Post[] } }>('/analytics/top-posts', { params: { period, sortBy, limit } }),

  engagement: (period?: string) =>
    api.get<{ data: { period: string; reactions: object[]; contentTypes: object[]; languages: object[]; moods: object[]; sources: object[] } }>('/analytics/engagement', { params: { period } }),

  audio: (period?: string) =>
    api.get<{ data: { period: string; totalPlays: number; avgCompletion: number; topAudio: Post[]; playsByDay: object[] } }>('/analytics/audio', { params: { period } }),

  seriesAnalytics: (period?: string) =>
    api.get<{ data: { period: string; series: Series[] } }>('/analytics/series', { params: { period } }),

  bestTimes: () =>
    api.get<{ data: { bestHours: { hour: number; views: number; label: string }[]; bestDays: { day: number; name: string; views: number }[] } }>('/analytics/best-times'),

  postDeepDive: (postId: string, period?: string) =>
    api.get<{ data: { post: Post; period: string; dailyViews: object[]; dailyLikes: object[]; reactions: object[]; hourly: object[]; sources: object[] } }>(`/analytics/posts/${postId}`, { params: { period } }),
}

// ─────────────────────────────────────────────
//  CREATOR PROFILE
// ─────────────────────────────────────────────

export const creatorApi = {
  getMyProfile: () =>
    api.get<{ data: { user: AuthUser } }>('/me'),

  updateMyProfile: (data: { username?: string; displayName?: string; bio?: string; language?: string; socialLinks?: object }) =>
    api.patch<{ data: { user: AuthUser } }>('/me', data),

  uploadAvatar: (file: File) => {
    const fd = new FormData(); fd.append('avatar', file)
    return api.post<{ data: { avatar: object } }>('/upload/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getMyChannel: () =>
    api.get<{ data: { channel: Channel } }>('/channels/me'),

  updateChannel: (data: Partial<Channel>) =>
    api.patch<{ data: { channel: Channel } }>('/channels/me', data),

  setFeaturedPost: (postId: string | null) =>
    api.post('/channels/me/featured', { postId }),

  getChannelPage: (handle: string) =>
    api.get<{ data: { channel: Channel; isFollowing: boolean } }>(`/channels/${handle}`),

  getChannelPosts: (handle: string, params?: FeedFilters) =>
    api.get<{ data: { posts: Post[]; pagination: object } }>(`/channels/${handle}/posts`, { params }),

  getChannelSeries: (handle: string, params?: { type?: string; sort?: string; page?: number; limit?: number }) =>
    api.get<{ data: { series: Series[]; pagination: object } }>(`/channels/${handle}/series`, { params }),

  getUserProfile: (username: string) =>
    api.get<{ data: { user: AuthUser; isFollowing: boolean; isFollowedBy: boolean } }>(`/users/${username}`),

  getSimilarChannels: (channelId: string, limit?: number) =>
    api.get<{ data: { channels: Channel[] } }>(`/channels/${channelId}/similar`, { params: { limit } }),
}

// ─────────────────────────────────────────────
//  BADGES
// ─────────────────────────────────────────────

export const badgesApi = {
  myProgress: () =>
    api.get<{ data: { earned: object[]; progress: BadgeProgress[] } }>('/badges/progress'),

  leaderboard: (badgeType: string, limit?: number) =>
    api.get<{ data: { badgeType: string; users: AuthUser[] } }>(`/badges/leaderboard/${badgeType}`, { params: { limit } }),
}

// ─────────────────────────────────────────────
//  SYSTEM CONFIG
// ─────────────────────────────────────────────

export const systemApi = {
  getPublicConfig: () =>
    api.get<{ data: { config: Record<string, unknown> } }>('/system/config'),
}
