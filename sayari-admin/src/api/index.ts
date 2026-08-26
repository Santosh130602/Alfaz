import api from './client'
import type {
  AuthUser, AdminUser, TokenPair, Post, Report, Template, Asset,
  Announcement, AdminAction, PlatformStats, AppConfig,
} from '../types'

// ─────────────────────────────────────────────
//  AUTH (admin login only — email/password)
// ─────────────────────────────────────────────

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<{ data: { user: AuthUser; tokens: TokenPair } }>('/auth/login', data),

  logout: (refreshToken?: string) =>
    api.post('/auth/logout', { refreshToken }),

  me: () =>
    api.get<{ data: { user: AuthUser } }>('/auth/me'),
}

// ─────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────

export const dashboardApi = {
  stats: (period?: '7d' | '30d' | '90d') =>
    api.get<{ data: PlatformStats }>('/admin/stats', { params: { period } }),

  auditLog: (params?: { page?: number; limit?: number; adminId?: string; actionType?: string; targetType?: string }) =>
    api.get<{ data: { actions: AdminAction[]; pagination: object } }>('/admin/audit-log', { params }),
}

// ─────────────────────────────────────────────
//  USER MANAGEMENT
// ─────────────────────────────────────────────

export const usersApi = {
  list: (params?: {
    page?: number; limit?: number; search?: string
    role?: string; status?: string; isVerified?: boolean
    sort?: 'newest' | 'oldest' | 'followers' | 'posts'
  }) => api.get<{ data: { users: AdminUser[]; pagination: object } }>('/admin/users', { params }),

  detail: (userId: string) =>
    api.get<{ data: { user: AdminUser; postCount: number; reportCount: number; recentActions: AdminAction[] } }>(`/admin/users/${userId}`),

  edit: (userId: string, data: { displayName?: string; bio?: string; language?: string; isVerified?: boolean; role?: string; reason?: string }) =>
    api.patch<{ data: { user: AdminUser } }>(`/admin/users/${userId}`, data),

  ban: (userId: string, reason: string, expiresAt?: string) =>
    api.post(`/admin/users/${userId}/ban`, { reason, expiresAt }),

  unban: (userId: string) =>
    api.post(`/admin/users/${userId}/unban`),

  delete: (userId: string, reason: string) =>
    api.delete(`/admin/users/${userId}`, { data: { reason } }),

  assignBadge: (userId: string, badgeType: string) =>
    api.post(`/admin/users/${userId}/badge`, { badgeType }),
}

// ─────────────────────────────────────────────
//  CONTENT (POSTS) MANAGEMENT
// ─────────────────────────────────────────────

export const postsApi = {
  list: (params?: {
    page?: number; limit?: number; search?: string
    type?: string; status?: string; visibility?: string
    isReported?: boolean; sort?: 'newest' | 'reported' | 'popular'
  }) => api.get<{ data: { posts: Post[]; pagination: object } }>('/admin/posts', { params }),

  delete: (postId: string, reason: string) =>
    api.delete(`/admin/posts/${postId}`, { data: { reason } }),

  feature: (postId: string, featured: boolean) =>
    api.patch(`/admin/posts/${postId}/feature`, { featured }),
}

// ─────────────────────────────────────────────
//  REPORTS
// ─────────────────────────────────────────────

export const reportsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; targetType?: string }) =>
    api.get<{ data: { reports: Report[]; pagination: object } }>('/admin/reports', { params }),

  review: (reportId: string, action: 'dismiss' | 'action_taken', note?: string) =>
    api.patch(`/admin/reports/${reportId}/review`, { action, note }),
}

// ─────────────────────────────────────────────
//  TEMPLATES & ASSETS
// ─────────────────────────────────────────────

export const templatesApi = {
  list: (params?: { category?: string; orientation?: string; page?: number; limit?: number }) =>
    api.get<{ data: { templates: Template[]; pagination: object } }>('/templates', { params }),

  upload: (formData: FormData, onProgress?: (pct: number) => void) =>
    api.post<{ data: { template: Template } }>('/templates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => { if (onProgress && e.total) onProgress(Math.round(e.loaded * 100 / e.total)) },
    }),

  update: (id: string, data: Partial<Template>) =>
    api.patch<{ data: { template: Template } }>(`/templates/${id}`, data),

  delete: (id: string) =>
    api.delete(`/templates/${id}`),
}

export const assetsApi = {
  list: (params?: { assetType?: string; category?: string; page?: number; limit?: number }) =>
    api.get<{ data: { assets: Asset[]; pagination: object } }>('/assets', { params }),

  upload: (formData: FormData, onProgress?: (pct: number) => void) =>
    api.post<{ data: { asset: Asset } }>('/assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => { if (onProgress && e.total) onProgress(Math.round(e.loaded * 100 / e.total)) },
    }),

  delete: (id: string) =>
    api.delete(`/assets/${id}`),
}

// ─────────────────────────────────────────────
//  ANNOUNCEMENTS
// ─────────────────────────────────────────────

export const announcementsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<{ data: { announcements: Announcement[]; pagination: object } }>('/admin/announcements', { params }),

  create: (data: {
    title: string; body: string
    type?: 'general' | 'feature' | 'maintenance' | 'celebration'
    targetAudience?: 'all' | 'creators' | 'new_users' | 'specific'
    targetUsers?: string[]
    scheduledAt?: string
  }) => api.post<{ data: { announcement: Announcement } }>('/admin/announcements', data),
}

// ─────────────────────────────────────────────
//  APP CONFIG
// ─────────────────────────────────────────────

export const configApi = {
  getAll: () =>
    api.get<{ data: { configs: AppConfig[] } }>('/system/config/all'),

  update: (key: string, value: unknown) =>
    api.patch<{ data: { config: AppConfig } }>(`/system/config/${key}`, { value }),

  cacheFlush: (pattern: string) =>
    api.post('/system/cache/flush', { pattern }),

  kafkaStatus: () =>
    api.get<{ data: { enabled: boolean; brokers: string[]; mode: string } }>('/system/kafka-status'),
}
