import { create } from 'zustand'
import type { Notification, Post } from '../types'

// ─────────────────────────────────────────────
//  NOTIFICATION STORE
// ─────────────────────────────────────────────

interface NotifState {
  unreadCount    : number
  notifications  : Notification[]
  setUnreadCount : (n: number) => void
  incrementUnread: () => void
  decrementUnread: () => void
  addNotification: (n: Notification) => void
  setNotifications: (ns: Notification[]) => void
  markRead       : (id: string) => void
  markAllRead    : () => void
}

export const useNotifStore = create<NotifState>((set) => ({
  unreadCount    : 0,
  notifications  : [],
  setUnreadCount : (n) => set({ unreadCount: n }),
  incrementUnread: () => set(s => ({ unreadCount: s.unreadCount + 1 })),
  decrementUnread: () => set(s => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  addNotification: (n) => set(s => ({ notifications: [n, ...s.notifications], unreadCount: s.unreadCount + 1 })),
  setNotifications: (ns) => set({ notifications: ns }),
  markRead: (id) => set(s => ({
    notifications: s.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
    unreadCount  : Math.max(0, s.unreadCount - 1),
  })),
  markAllRead: () => set(s => ({
    notifications: s.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount  : 0,
  })),
}))

// ─────────────────────────────────────────────
//  AUDIO PLAYER STORE
// ─────────────────────────────────────────────

interface AudioState {
  currentPost    : Post | null
  queue          : Post[]
  isPlaying      : boolean
  currentTime    : number
  duration       : number
  playbackSpeed  : number
  volume         : number
  isMinimised    : boolean

  setPost        : (post: Post, queue?: Post[]) => void
  setPlaying     : (v: boolean) => void
  setCurrentTime : (t: number) => void
  setDuration    : (d: number) => void
  setSpeed       : (s: number) => void
  setVolume      : (v: number) => void
  setMinimised   : (v: boolean) => void
  playNext       : () => void
  playPrev       : () => void
  clearPlayer    : () => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentPost  : null,
  queue        : [],
  isPlaying    : false,
  currentTime  : 0,
  duration     : 0,
  playbackSpeed: 1,
  volume       : 1,
  isMinimised  : false,

  setPost    : (post, queue = []) => set({ currentPost: post, queue, isPlaying: true, currentTime: 0 }),
  setPlaying : (v) => set({ isPlaying: v }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setSpeed   : (s) => set({ playbackSpeed: s }),
  setVolume  : (v) => set({ volume: v }),
  setMinimised: (v) => set({ isMinimised: v }),
  clearPlayer: () => set({ currentPost: null, isPlaying: false, currentTime: 0 }),

  playNext: () => {
    const { currentPost, queue } = get()
    if (!currentPost || !queue.length) return
    const idx  = queue.findIndex(p => p._id === currentPost._id)
    const next = queue[idx + 1]
    if (next) set({ currentPost: next, isPlaying: true, currentTime: 0 })
  },

  playPrev: () => {
    const { currentPost, queue } = get()
    if (!currentPost || !queue.length) return
    const idx  = queue.findIndex(p => p._id === currentPost._id)
    const prev = queue[idx - 1]
    if (prev) set({ currentPost: prev, isPlaying: true, currentTime: 0 })
  },
}))

// ─────────────────────────────────────────────
//  UI STORE
// ─────────────────────────────────────────────

interface UiState {
  sidebarOpen    : boolean
  isSidebarCollapsed   : boolean          // <--- Added this
  postModalOpen  : boolean
  postModalType  : 'image' | 'audio' | null
  editingPostId  : string | null
  setSidebarOpen : (v: boolean) => void
  toggleSidebar  : () => void
  toggleSidebarCollapse: () => void
  openPostModal  : (type: 'image' | 'audio', postId?: string) => void
  closePostModal : () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen   : false,
  isSidebarCollapsed   : false,
  postModalOpen : false,
  postModalType : null,
  editingPostId : null,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar : () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapse: () => set(s => ({ isSidebarCollapsed: !s.isSidebarCollapsed })), // <--- Added toggle logic
  openPostModal : (type, postId) => set({ postModalOpen: true, postModalType: type, editingPostId: postId ?? null }),
  closePostModal: () => set({ postModalOpen: false, postModalType: null, editingPostId: null }),
}))
