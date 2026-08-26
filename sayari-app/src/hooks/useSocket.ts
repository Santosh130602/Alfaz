import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuthStore } from '../store/auth.store'
import { useNotifStore } from '../store/index'
import type { Notification } from '../types'
import toast from 'react-hot-toast'
import { tokenStorage } from '../api/client'

let socketInstance: Socket | null = null

export function useSocket() {
  const { isAuthenticated } = useAuthStore()
  const { addNotification, setUnreadCount } = useNotifStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || initialized.current) return
    initialized.current = true

    const token = tokenStorage.get()
    if (!token) return

    socketInstance = io('/', {
      auth      : { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay   : 2000,
    })

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected')
      // Heartbeat every 60s
      const hb = setInterval(() => socketInstance?.emit('heartbeat'), 60000)
      socketInstance?.on('disconnect', () => clearInterval(hb))
    })

    socketInstance.on('notification', (notif: Notification) => {
      addNotification(notif)
      // Show toast for important notifications
      const icons: Record<string, string> = {
        new_follower    : '👤',
        post_liked      : '❤️',
        post_commented  : '💬',
        badge_awarded   : '🎉',
        new_chapter     : '📖',
        admin_announcement: '📢',
      }
      const icon = icons[notif.type] || '🔔'
      toast(`${icon} ${notif.title}`, { duration: 4000 })
    })

    socketInstance.on('all_read', () => setUnreadCount(0))

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected')
    })

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket] Error:', err.message)
    })

    return () => {
      socketInstance?.disconnect()
      socketInstance      = null
      initialized.current = false
    }
  }, [isAuthenticated, addNotification, setUnreadCount])

  const markRead = (notificationId: string) => {
    socketInstance?.emit('mark_read', { notificationId })
  }

  const markAllRead = () => {
    socketInstance?.emit('mark_all_read')
  }

  return { markRead, markAllRead }
}

export function getSocket() { return socketInstance }
