import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

// ── Class name helper ─────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Drive images 
export const driveImg = (driveId: string) => `/api/proxy/image?id=${driveId}`;


// ── Date formatters ───────────────────────────
export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy') {
  return format(new Date(date), fmt)
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'dd MMM yyyy, hh:mm a')
}

// ── Number formatters ─────────────────────────
export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

// ── String helpers ────────────────────────────
export function truncate(str: string, len = 100) {
  return str.length > len ? str.slice(0, len) + '...' : str
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ── Image helpers ─────────────────────────────
export function getAvatarUrl(avatar?: { url?: string | null; thumbnail?: string | null } | null, size: 'thumb' | 'full' = 'thumb') {
  const url = size === 'thumb' ? avatar?.thumbnail : avatar?.url
  return url || null
}

export function getDriveThumb(url?: string | null) {
  return url || '/placeholder-image.svg'
}

// ── Post type labels ──────────────────────────
export const POST_TYPE_LABELS: Record<string, string> = {
  sayari       : 'Sayari',
  kavita       : 'Kavita',
  ghazal       : 'Ghazal',
  nazm         : 'Nazm',
  story_chapter: 'Story',
  book_chapter : 'Book Chapter',
  audio        : 'Audio',
  quote        : 'Quote',
  shayari      : 'Shayari',
}

export const MOOD_LABELS: Record<string, string> = {
  ishq        : '❤️ Ishq',
  dard        : '💔 Dard',
  khushi      : '😊 Khushi',
  udaasi      : '😢 Udaasi',
  gussa       : '😠 Gussa',
  ummeed      : '🌟 Ummeed',
  motivational: '💪 Motivational',
  romantic    : '🌹 Romantic',
  funny       : '😄 Funny',
  religious   : '🕌 Religious',
  patriotic   : '🇮🇳 Patriotic',
  nature      : '🌿 Nature',
}

export const LANGUAGE_LABELS: Record<string, string> = {
  ur   : 'اردو',
  hi   : 'हिंदी',
  en   : 'English',
  pa   : 'ਪੰਜਾਬੀ',
  mixed: 'Mixed',
}

// ── Local storage helpers ─────────────────────
export const guestId = (() => {
  const key = 'sayari_guest_id'
  let id = localStorage.getItem(key)
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id) }
  return id
})()

// ── Error message extractor ───────────────────
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (error as { response?: { data?: { message?: string } } }).response
    return res?.data?.message || 'Something went wrong'
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}
