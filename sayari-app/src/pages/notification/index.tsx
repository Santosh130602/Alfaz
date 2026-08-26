// import { useState } from 'react'
// import { Link } from 'react-router-dom'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { Bell, Check, CheckCheck, Trash2, Settings, Bookmark, Trophy, Lock } from 'lucide-react'
// import { notificationsApi, badgesApi, engagementApi } from '../../api'
// import { useNotifStore } from '../../store/index'
// import { useSocket } from '../../hooks/useSocket'
// import { Avatar, Button, Toggle, PageSpinner, EmptyState, Card } from '../../components/ui'
// import { cn, timeAgo, getErrorMessage } from '../../utils'
// import type { Notification, BadgeProgress } from '../../types'
// import toast from 'react-hot-toast'

// // ─────────────────────────────────────────────
// //  NOTIFICATIONS PAGE
// // ─────────────────────────────────────────────

// export function NotificationsPage() {
//   const [showPrefs, setShowPrefs] = useState(false)
//   const { markAllRead: storeMarkAll } = useNotifStore()
//   const { markAllRead } = useSocket()
//   const queryClient = useQueryClient()

//   const { data, isLoading } = useQuery({
//     queryKey: ['notifications'],
//     queryFn : () => notificationsApi.list({ limit: 50 }).then(r => r.data.data),
//     refetchInterval: 30000,
//   })

//   const markAllMutation = useMutation({
//     mutationFn: () => notificationsApi.markAllRead(),
//     onSuccess : () => {
//       storeMarkAll()
//       markAllRead()
//       queryClient.invalidateQueries({ queryKey: ['notifications'] })
//       toast.success('All marked as read')
//     },
//   })

//   const deleteMutation = useMutation({
//     mutationFn: (id: string) => notificationsApi.delete(id),
//     onSuccess  : () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
//   })

//   const notifications = data?.notifications ?? []
//   const unread        = data?.unreadCount ?? 0

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-xl font-bold text-white flex items-center gap-2">
//             <Bell className="w-5 h-5 text-[#6C63FF]" /> Notifications
//           </h1>
//           {unread > 0 && <p className="text-sm text-[#888] mt-0.5">{unread} unread</p>}
//         </div>
//         <div className="flex items-center gap-2">
//           {unread > 0 && (
//             <Button variant="ghost" size="sm" icon={<CheckCheck className="w-4 h-4" />}
//               onClick={() => markAllMutation.mutate()} loading={markAllMutation.isPending}>
//               Read all
//             </Button>
//           )}
//           <Button variant="ghost" size="sm" icon={<Settings className="w-4 h-4" />}
//             onClick={() => setShowPrefs(!showPrefs)}>
//             Prefs
//           </Button>
//         </div>
//       </div>

//       {/* Preferences panel */}
//       {showPrefs && <NotifPrefsPanel onClose={() => setShowPrefs(false)} />}

//       {isLoading ? (
//         <div className="flex flex-col gap-2">
//           {Array.from({ length: 5 }).map((_, i) => (
//             <div key={i} className="h-16 bg-[#1A1A1A] rounded-2xl animate-pulse" />
//           ))}
//         </div>
//       ) : !notifications.length ? (
//         <EmptyState icon="🔔" title="No notifications yet" description="We'll notify you when something happens" />
//       ) : (
//         <div className="flex flex-col gap-1">
//           {notifications.map(n => (
//             <NotifItem
//               key={n._id}
//               notif={n}
//               onDelete={() => deleteMutation.mutate(n._id)}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Notification Item ─────────────────────────

// const NOTIF_ICONS: Record<string, string> = {
//   new_follower      : '👤', post_liked       : '❤️', post_commented: '💬',
//   comment_replied   : '↩️', badge_awarded    : '🎉', new_chapter   : '📖',
//   series_completed  : '🎊', post_saved       : '🔖', post_featured : '⭐',
//   account_warning   : '⚠️', admin_announcement: '📢', mention       : '@',
//   scheduled_published:'✅',
// }

// function NotifItem({ notif, onDelete }: { notif: Notification; onDelete: () => void }) {
//   const [read, setRead] = useState(notif.isRead)
//   const { markRead } = useSocket()

//   const handleClick = () => {
//     if (!read) { setRead(true); markRead(notif._id) }
//   }

//   const deepLink = notif.meta?.deepLink

//   const content = (
//     <div className={cn('flex items-start gap-3 px-4 py-3 rounded-2xl transition-colors group',
//       !read ? 'bg-[#6C63FF]/5 border border-[#6C63FF]/20' : 'bg-[#1A1A1A] border border-[#2E2E2E]',
//       'hover:border-[#3E3E3E]'
//     )} onClick={handleClick}>
//       {/* Icon / Avatar */}
//       <div className="shrink-0 mt-0.5">
//         {notif.actor ? (
//           <div className="relative">
//             <Avatar user={notif.actor} size="sm" />
//             <span className="absolute -bottom-1 -right-1 text-xs bg-[#0F0F0F] rounded-full px-0.5">
//               {NOTIF_ICONS[notif.type] || '🔔'}
//             </span>
//           </div>
//         ) : (
//           <div className="w-9 h-9 bg-[#242424] rounded-full flex items-center justify-center text-base">
//             {NOTIF_ICONS[notif.type] || '🔔'}
//           </div>
//         )}
//       </div>

//       {/* Content */}
//       <div className="flex-1 min-w-0">
//         <p className={cn('text-sm leading-snug', read ? 'text-[#ccc]' : 'text-white font-medium')}>
//           {notif.body}
//         </p>
//         <p className="text-xs text-[#555] mt-1">{timeAgo(notif.createdAt)}</p>
//       </div>

//       {/* Unread dot */}
//       {!read && <div className="w-2 h-2 bg-[#6C63FF] rounded-full shrink-0 mt-2" />}

//       {/* Delete button */}
//       <button
//         onClick={e => { e.stopPropagation(); onDelete() }}
//         className="shrink-0 opacity-0 group-hover:opacity-100 text-[#555] hover:text-red-400 transition-all"
//       >
//         <Trash2 className="w-3.5 h-3.5" />
//       </button>
//     </div>
//   )

//   if (deepLink) return <Link to={deepLink}>{content}</Link>
//   return content
// }

// // ── Notification Preferences Panel ───────────

// function NotifPrefsPanel({ onClose }: { onClose: () => void }) {
//   const queryClient = useQueryClient()

//   const { data } = useQuery({
//     queryKey: ['notif-prefs'],
//     queryFn : () => notificationsApi.getPrefs().then(r => r.data.data.prefs as Record<string, boolean>),
//   })

//   const updateMutation = useMutation({
//     mutationFn: (prefs: Record<string, boolean>) => notificationsApi.updatePrefs(prefs),
//     onSuccess  : () => queryClient.invalidateQueries({ queryKey: ['notif-prefs'] }),
//   })

//   const prefs = data || {}

//   const prefItems = [
//     { key: 'newFollower',       label: 'New followers'        },
//     { key: 'newComment',        label: 'Comments on posts'    },
//     { key: 'newLike',           label: 'Post likes'           },
//     { key: 'newChapter',        label: 'New chapters'         },
//     { key: 'adminAnnouncement', label: 'Announcements'        },
//     { key: 'push',              label: 'Push notifications'   },
//     { key: 'whatsapp',          label: 'WhatsApp notifications'},
//   ]

//   return (
//     <Card className="p-4 mb-6">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="font-semibold text-white">Notification Preferences</h3>
//         <button onClick={onClose} className="text-[#888] hover:text-white text-sm">Close</button>
//       </div>
//       <div className="flex flex-col gap-3">
//         {prefItems.map(item => (
//           <div key={item.key} className="flex items-center justify-between">
//             <span className="text-sm text-[#ccc]">{item.label}</span>
//             <Toggle
//               checked={!!prefs[item.key]}
//               onChange={(v) => updateMutation.mutate({ [item.key]: v })}
//             />
//           </div>
//         ))}
//       </div>
//     </Card>
//   )
// }

// // ─────────────────────────────────────────────
// //  SAVED PAGE
// // ─────────────────────────────────────────────

// export function SavedPage() {
//   const [activeCollection, setActiveCollection] = useState('Saved')

//   const { data, isLoading } = useQuery({
//     queryKey: ['saved', activeCollection],
//     queryFn : () => engagementApi.getSaved({ collection: activeCollection, limit: 50 }).then(r => r.data.data),
//   })

//   const collections = data?.collections ?? ['Saved']
//   const items       = data?.items ?? []

//   return (
//     <div>
//       <div className="flex items-center gap-3 mb-6">
//         <Bookmark className="w-5 h-5 text-[#6C63FF]" />
//         <h1 className="text-xl font-bold text-white">Saved</h1>
//       </div>

//       {/* Collections */}
//       {collections.length > 1 && (
//         <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
//           {collections.map(col => (
//             <button
//               key={col}
//               onClick={() => setActiveCollection(col)}
//               className={cn('shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
//                 activeCollection === col
//                   ? 'bg-[#6C63FF] text-white'
//                   : 'bg-[#1A1A1A] text-[#888] border border-[#2E2E2E] hover:text-white'
//               )}
//             >
//               {col}
//             </button>
//           ))}
//         </div>
//       )}

//       {isLoading ? (
//         <div className="grid grid-cols-3 gap-0.5">
//           {Array.from({ length: 9 }).map((_, i) => <div key={i} className="aspect-square bg-[#1A1A1A] animate-pulse" />)}
//         </div>
//       ) : !items.length ? (
//         <EmptyState
//           icon="🔖"
//           title="Nothing saved yet"
//           description="Tap the bookmark icon on any post to save it here"
//           action={<Link to="/explore"><Button>Explore Posts</Button></Link>}
//         />
//       ) : (
//         <div className="grid grid-cols-3 gap-0.5">
//           {items.map((item: any) => (
//             <Link key={item._id} to={`/post/${item._id}`} className="aspect-square relative overflow-hidden bg-[#1A1A1A]">
//               {item.renderedImage?.thumbnail
//                 ? <img src={item.renderedImage.thumbnail} alt="" className="w-full h-full object-cover" />
//                 : <div className="w-full h-full flex items-center justify-center text-2xl">
//                     {item.cover?.thumbnail ? <img src={item.cover.thumbnail} alt="" className="w-full h-full object-cover" /> : '📚'}
//                   </div>
//               }
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// //  BADGES PAGE
// // ─────────────────────────────────────────────

// export function BadgesPage() {
//   const { data, isLoading } = useQuery({
//     queryKey: ['badges', 'progress'],
//     queryFn : () => badgesApi.myProgress().then(r => r.data.data),
//   })

//   if (isLoading) return <PageSpinner />

//   const earned   = data?.earned   ?? []
//   const progress = data?.progress ?? []

//   return (
//     <div>
//       <div className="flex items-center gap-3 mb-6">
//         <Trophy className="w-5 h-5 text-[#6C63FF]" />
//         <h1 className="text-xl font-bold text-white">Badges</h1>
//       </div>

//       {earned.length > 0 && (
//         <div className="mb-8">
//           <h2 className="text-sm font-medium text-[#888] uppercase tracking-wider mb-3">Earned ({earned.length})</h2>
//           <div className="grid grid-cols-3 gap-3">
//             {(earned as { type: string; awardedAt: string }[]).map((b) => (
//               <BadgeCardEarned key={b.type} badgeType={b.type} awardedAt={b.awardedAt} />
//             ))}
//           </div>
//         </div>
//       )}

//       <h2 className="text-sm font-medium text-[#888] uppercase tracking-wider mb-3">Progress</h2>
//       <div className="flex flex-col gap-3">
//         {progress.map((p: BadgeProgress) => (
//           <BadgeProgressCard key={p.type} progress={p} />
//         ))}
//       </div>
//     </div>
//   )
// }

// const BADGE_INFO: Record<string, { emoji: string; name: string; desc: string }> = {
//   verified    : { emoji: '✅', name: 'Verified',    desc: 'Verified creator account'              },
//   rising_star : { emoji: '🌟', name: 'Rising Star', desc: '100 followers in first 30 days'         },
//   top_creator : { emoji: '🏆', name: 'Top Creator', desc: '10,000 total likes on your posts'       },
//   voice_artist: { emoji: '🎙️', name: 'Voice Artist',desc: 'Published 10 audio posts'               },
//   author      : { emoji: '📚', name: 'Author',      desc: 'Completed a full series'                },
//   admin_pick  : { emoji: '⭐', name: 'Admin Pick',  desc: 'Handpicked by Sayari team'              },
// }

// function BadgeCardEarned({ badgeType, awardedAt }: { badgeType: string; awardedAt: string }) {
//   const info = BADGE_INFO[badgeType] || { emoji: '🏅', name: badgeType, desc: '' }
//   return (
//     <div className="bg-[#1A1A1A] border border-[#6C63FF]/30 rounded-2xl p-4 text-center">
//       <div className="text-4xl mb-2">{info.emoji}</div>
//       <p className="text-sm font-semibold text-white">{info.name}</p>
//       <p className="text-[10px] text-[#888] mt-1">Earned {timeAgo(awardedAt)}</p>
//     </div>
//   )
// }

// function BadgeProgressCard({ progress }: { progress: BadgeProgress }) {
//   const info = BADGE_INFO[progress.type] || { emoji: '🏅', name: progress.type, desc: '' }
//   const pct  = progress.pct ?? (progress.earned ? 100 : 0)

//   return (
//     <Card className={cn('p-4', progress.earned && 'border-[#6C63FF]/30')}>
//       <div className="flex items-center gap-4">
//         <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-2xl', progress.earned ? 'bg-[#6C63FF]/20' : 'bg-[#242424] grayscale opacity-60')}>
//           {progress.earned ? info.emoji : <Lock className="w-5 h-5 text-[#555]" />}
//         </div>
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center justify-between mb-1">
//             <p className={cn('text-sm font-semibold', progress.earned ? 'text-white' : 'text-[#888]')}>{info.name}</p>
//             <span className="text-xs text-[#888]">{pct}%</span>
//           </div>
//           <p className="text-xs text-[#666] mb-2">{info.desc}</p>
//           <div className="h-1.5 bg-[#242424] rounded-full overflow-hidden">
//             <div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#FF6584] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
//           </div>
//           {/* Progress detail */}
//           {!progress.earned && (
//             <p className="text-[10px] text-[#555] mt-1">
//               {progress.type === 'rising_star'  && `${progress.followers ?? 0}/100 followers${progress.daysRemaining ? ` · ${progress.daysRemaining} days left` : ''}`}
//               {progress.type === 'top_creator'  && `${(progress.likes ?? 0).toLocaleString()}/10,000 likes`}
//               {progress.type === 'voice_artist' && `${progress.audioPosts ?? 0}/10 audio posts`}
//               {progress.type === 'author'       && `${progress.completedSeries ?? 0}/1 completed series`}
//             </p>
//           )}
//         </div>
//       </div>
//     </Card>
//   )
// }




















// import { useState } from 'react'
// import { Link } from 'react-router-dom'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { 
//   Bell, Check, CheckCheck, Trash2, Settings, Bookmark, Trophy, Lock,
//   Heart, MessageCircle, UserPlus, Star, Sparkles, Clock, 
//   ChevronRight, Gift, Award, TrendingUp, Flame, Crown,
//   X, Circle, User, Share2, Music, BookOpen, Mic2,
//   Megaphone, Users, Radio, Headphones, Zap, BadgeCheck
// } from 'lucide-react'
// import { notificationsApi, badgesApi, engagementApi } from '../../api'
// import { useNotifStore } from '../../store/index'
// import { useSocket } from '../../hooks/useSocket'
// import { Avatar, Button, Toggle, PageSpinner, EmptyState, Card } from '../../components/ui'
// import { cn, timeAgo, getErrorMessage } from '../../utils'
// import type { Notification, BadgeProgress } from '../../types'
// import toast from 'react-hot-toast'

// // ─────────────────────────────────────────────
// //  NOTIFICATIONS PAGE
// // ─────────────────────────────────────────────

// export function NotificationsPage() {
//   const [showPrefs, setShowPrefs] = useState(false)
//   const { markAllRead: storeMarkAll } = useNotifStore()
//   const { markAllRead } = useSocket()
//   const queryClient = useQueryClient()

//   const { data, isLoading } = useQuery({
//     queryKey: ['notifications'],
//     queryFn : () => notificationsApi.list({ limit: 50 }).then(r => r.data.data),
//     refetchInterval: 30000,
//   })

//   const markAllMutation = useMutation({
//     mutationFn: () => notificationsApi.markAllRead(),
//     onSuccess : () => {
//       storeMarkAll()
//       markAllRead()
//       queryClient.invalidateQueries({ queryKey: ['notifications'] })
//       toast.success('All marked as read')
//     },
//   })

//   const deleteMutation = useMutation({
//     mutationFn: (id: string) => notificationsApi.delete(id),
//     onSuccess  : () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
//   })

//   const notifications = data?.notifications ?? []
//   const unread        = data?.unreadCount ?? 0

//   return (
//     <div className="max-w-3xl mx-auto p-20">
//       {/* Header - Spotify Style */}
//       <div className="flex items-center justify-between mb-8">
//         <div className="flex items-center gap-4">
//           <div className="w-14 h-14 bg-gradient-to-br from-[#1ED760]/20 to-[#1ED760]/5 rounded-2xl flex items-center justify-center">
//             <Bell className="w-7 h-7 text-[#1ED760]" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
//             {unread > 0 && (
//               <p className="text-sm text-[#b3b3b3] flex items-center gap-2">
//                 <span className="w-2 h-2 bg-[#1ED760] rounded-full inline-block" />
//                 {unread} unread
//               </p>
//             )}
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           {unread > 0 && (
//             <button 
//               onClick={() => markAllMutation.mutate()}
//               disabled={markAllMutation.isPending}
//               className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#b3b3b3] hover:text-white hover:bg-[#282828] transition-all"
//             >
//               <CheckCheck className="w-4 h-4" />
//               Read all
//             </button>
//           )}
//           <button 
//             onClick={() => setShowPrefs(!showPrefs)}
//             className={cn(
//               "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#b3b3b3] hover:text-white hover:bg-[#282828] transition-all",
//               showPrefs && "bg-[#282828] text-white"
//             )}
//           >
//             <Settings className="w-4 h-4" />
//             Prefs
//           </button>
//         </div>
//       </div>

//       {/* Preferences panel - Spotify Style */}
//       {showPrefs && (
//         <div className="mb-6 animate-slideDown">
//           <NotifPrefsPanel onClose={() => setShowPrefs(false)} />
//         </div>
//       )}

//       {/* Notifications List - Spotify Style */}
//       {isLoading ? (
//         <div className="flex flex-col gap-3">
//           {Array.from({ length: 5 }).map((_, i) => (
//             <div key={i} className="h-20 bg-[#181818] rounded-lg animate-pulse" />
//           ))}
//         </div>
//       ) : !notifications.length ? (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="w-28 h-28 bg-[#181818] rounded-full flex items-center justify-center mb-6">
//             <Bell className="w-14 h-14 text-[#535353]" />
//           </div>
//           <h3 className="text-2xl font-bold text-white mb-2">All caught up!</h3>
//           <p className="text-[#b3b3b3] text-sm text-center max-w-sm">
//             We'll notify you when someone interacts with your posts or follows you
//           </p>
//           <Link to="/explore">
//             <button className="mt-6 px-8 py-3 bg-[#1ED760] hover:bg-[#1fdf64] text-black font-bold rounded-full transition-all">
//               Explore Content
//             </button>
//           </Link>
//         </div>
//       ) : (
//         <div className="flex flex-col gap-1">
//           {notifications.map((n, index) => (
//             <NotifItem
//               key={n._id}
//               notif={n}
//               onDelete={() => deleteMutation.mutate(n._id)}
//               index={index}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Notification Item - Spotify Style ─────────────────────────

// const NOTIF_ICONS: Record<string, { icon: any; color: string }> = {
//   new_follower      : { icon: UserPlus, color: 'text-[#1ED760]' },
//   post_liked        : { icon: Heart, color: 'text-[#ff6b6b]' },
//   post_commented    : { icon: MessageCircle, color: 'text-[#4ecdc4]' },
//   comment_replied   : { icon: MessageCircle, color: 'text-[#a29bfe]' },
//   badge_awarded     : { icon: Award, color: 'text-[#ffd93d]' },
//   new_chapter       : { icon: BookOpen, color: 'text-[#6c5ce7]' },
//   series_completed  : { icon: Trophy, color: 'text-[#fd79a8]' },
//   post_saved        : { icon: Bookmark, color: 'text-[#fdcb6e]' },
//   post_featured     : { icon: Star, color: 'text-[#fdcb6e]' },
//   account_warning   : { icon: Bell, color: 'text-[#ff6b6b]' },
//   admin_announcement: { icon: Megaphone, color: 'text-[#74b9ff]' },
//   mention           : { icon: User, color: 'text-[#a29bfe]' },
//   scheduled_published: { icon: Check, color: 'text-[#1ED760]' },
// }

// function NotifItem({ notif, onDelete, index }: { notif: Notification; onDelete: () => void; index: number }) {
//   const [read, setRead] = useState(notif.isRead)
//   const [isDeleting, setIsDeleting] = useState(false)
//   const { markRead } = useSocket()
//   const iconData = NOTIF_ICONS[notif.type] || { icon: Bell, color: 'text-[#b3b3b3]' }
//   const Icon = iconData.icon

//   const handleClick = () => {
//     if (!read) { 
//       setRead(true); 
//       markRead(notif._id) 
//     }
//   }

//   const handleDelete = (e: React.MouseEvent) => {
//     e.stopPropagation()
//     setIsDeleting(true)
//     setTimeout(() => {
//       onDelete()
//     }, 300)
//   }

//   const deepLink = notif.meta?.deepLink

//   const content = (
//     <div 
//       className={cn(
//         'group flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer',
//         !read 
//           ? 'bg-[#282828] hover:bg-[#333333]' 
//           : 'hover:bg-[#282828]',
//         isDeleting && 'opacity-0 scale-95'
//       )}
//       onClick={handleClick}
//       style={{ animationDelay: `${index * 50}ms` }}
//     >
//       {/* Icon */}
//       <div className="shrink-0">
//         {notif.actor ? (
//           <div className="relative">
//             <Avatar user={notif.actor} size="md" />
//             <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#121212] rounded-full flex items-center justify-center border-2 border-[#121212]">
//               <Icon className={cn("w-3 h-3", iconData.color)} />
//             </div>
//           </div>
//         ) : (
//           <div className="w-10 h-10 bg-[#282828] rounded-full flex items-center justify-center">
//             <Icon className={cn("w-5 h-5", iconData.color)} />
//           </div>
//         )}
//       </div>

//       {/* Content */}
//       <div className="flex-1 min-w-0">
//         <p className={cn(
//           "text-sm leading-relaxed",
//           !read ? 'text-white font-medium' : 'text-[#b3b3b3]'
//         )}>
//           {notif.body}
//         </p>
//         <div className="flex items-center gap-3 mt-1">
//           <span className="text-xs text-[#535353] flex items-center gap-1">
//             <Clock className="w-3 h-3" />
//             {timeAgo(notif.createdAt)}
//           </span>
//           {!read && (
//             <span className="text-[10px] text-[#1ED760] font-medium bg-[#1ED760]/10 px-2 py-0.5 rounded-full">
//               New
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Unread indicator */}
//       {!read && (
//         <div className="w-2 h-2 bg-[#1ED760] rounded-full shrink-0" />
//       )}

//       {/* Delete button - appears on hover */}
//       <button
//         onClick={handleDelete}
//         className="shrink-0 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-[#333333] text-[#535353] hover:text-[#ff6b6b] transition-all"
//         title="Delete notification"
//       >
//         <Trash2 className="w-4 h-4" />
//       </button>
//     </div>
//   )

//   if (deepLink) return <Link to={deepLink}>{content}</Link>
//   return content
// }

// // ── Notification Preferences Panel ───────────

// function NotifPrefsPanel({ onClose }: { onClose: () => void }) {
//   const queryClient = useQueryClient()

//   const { data } = useQuery({
//     queryKey: ['notif-prefs'],
//     queryFn : () => notificationsApi.getPrefs().then(r => r.data.data.prefs as Record<string, boolean>),
//   })

//   const updateMutation = useMutation({
//     mutationFn: (prefs: Record<string, boolean>) => notificationsApi.updatePrefs(prefs),
//     onSuccess  : () => {
//       queryClient.invalidateQueries({ queryKey: ['notif-prefs'] })
//       toast.success('Preferences updated')
//     },
//   })

//   const prefs = data || {}

//   const prefItems = [
//     { key: 'newFollower', label: 'New followers', icon: UserPlus },
//     { key: 'newComment', label: 'Comments on posts', icon: MessageCircle },
//     { key: 'newLike', label: 'Post likes', icon: Heart },
//     { key: 'newChapter', label: 'New chapters', icon: BookOpen },
//     { key: 'adminAnnouncement', label: 'Announcements', icon: Megaphone },
//     { key: 'push', label: 'Push notifications', icon: Bell },
//     { key: 'whatsapp', label: 'WhatsApp notifications', icon: MessageCircle },
//   ]

//   return (
//     <div className="bg-[#181818] rounded-lg p-6 border border-[#282828]">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <Settings className="w-5 h-5 text-[#b3b3b3]" />
//           <h3 className="font-semibold text-white">Notification Preferences</h3>
//         </div>
//         <button 
//           onClick={onClose} 
//           className="p-1.5 rounded-full hover:bg-[#282828] text-[#b3b3b3] hover:text-white transition-colors"
//         >
//           <X className="w-4 h-4" />
//         </button>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//         {prefItems.map(item => {
//           const Icon = item.icon
//           return (
//             <div key={item.key} className="flex items-center justify-between p-3 hover:bg-[#282828] rounded-lg transition-colors">
//               <div className="flex items-center gap-3">
//                 <Icon className="w-4 h-4 text-[#b3b3b3]" />
//                 <span className="text-sm text-white">{item.label}</span>
//               </div>
//               <Toggle
//                 checked={!!prefs[item.key]}
//                 onChange={(v) => updateMutation.mutate({ [item.key]: v })}
//                 loading={updateMutation.isPending}
//               />
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// //  SAVED PAGE - Spotify Style
// // ─────────────────────────────────────────────

// export function SavedPage() {
//   const [activeCollection, setActiveCollection] = useState('Saved')

//   const { data, isLoading } = useQuery({
//     queryKey: ['saved', activeCollection],
//     queryFn : () => engagementApi.getSaved({ collection: activeCollection, limit: 50 }).then(r => r.data.data),
//   })

//   const collections = data?.collections ?? ['Saved']
//   const items       = data?.items ?? []

//   return (
//     <div className="max-w-4xl mx-auto px-4">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-8">
//         <div className="w-14 h-14 bg-gradient-to-br from-[#1ED760]/20 to-[#1ED760]/5 rounded-2xl flex items-center justify-center">
//           <Bookmark className="w-7 h-7 text-[#1ED760]" />
//         </div>
//         <div>
//           <h1 className="text-2xl font-bold text-white tracking-tight">Saved</h1>
//           <p className="text-sm text-[#b3b3b3]">{items.length} items saved</p>
//         </div>
//       </div>

//       {/* Collections - Spotify Style */}
//       {collections.length > 1 && (
//         <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
//           {collections.map(col => (
//             <button
//               key={col}
//               onClick={() => setActiveCollection(col)}
//               className={cn(
//                 'shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
//                 activeCollection === col
//                   ? 'bg-white text-black'
//                   : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#333333] hover:text-white'
//               )}
//             >
//               {col}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Content - Spotify Style Grid */}
//       {isLoading ? (
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           {Array.from({ length: 8 }).map((_, i) => (
//             <div key={i} className="aspect-square bg-[#181818] rounded-lg animate-pulse" />
//           ))}
//         </div>
//       ) : !items.length ? (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="w-28 h-28 bg-[#181818] rounded-full flex items-center justify-center mb-6">
//             <Bookmark className="w-14 h-14 text-[#535353]" />
//           </div>
//           <h3 className="text-2xl font-bold text-white mb-2">Nothing saved yet</h3>
//           <p className="text-[#b3b3b3] text-sm text-center max-w-sm">
//             Tap the bookmark icon on any post you love to save it here
//           </p>
//           <Link to="/explore">
//             <button className="mt-6 px-8 py-3 bg-[#1ED760] hover:bg-[#1fdf64] text-black font-bold rounded-full transition-all">
//               Explore Content
//             </button>
//           </Link>
//         </div>
//       ) : (
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           {items.map((item: any, index: number) => (
//             <Link 
//               key={item._id} 
//               to={`/post/${item._id}`} 
//               className="group relative aspect-square rounded-lg overflow-hidden bg-[#181818] hover:bg-[#282828] transition-all duration-300"
//               style={{ animationDelay: `${index * 50}ms` }}
//             >
//               {item.renderedImage?.thumbnail ? (
//                 <img 
//                   src={item.renderedImage.thumbnail} 
//                   alt="" 
//                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1ED760]/10 to-transparent">
//                   <BookOpen className="w-12 h-12 text-[#535353]" />
//                 </div>
//               )}
//               {/* Overlay on hover - Spotify Style */}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//               <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
//                 <p className="text-white text-sm font-medium truncate">{item.title || 'Untitled'}</p>
//               </div>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// //  BADGES PAGE - Spotify Style
// // ─────────────────────────────────────────────

// export function BadgesPage() {
//   const { data, isLoading } = useQuery({
//     queryKey: ['badges', 'progress'],
//     queryFn : () => badgesApi.myProgress().then(r => r.data.data),
//   })

//   if (isLoading) return (
//     <div className="flex flex-col gap-4 max-w-2xl mx-auto px-4">
//       {Array.from({ length: 4 }).map((_, i) => (
//         <div key={i} className="h-24 bg-[#181818] rounded-lg animate-pulse" />
//       ))}
//     </div>
//   )

//   const earned   = data?.earned   ?? []
//   const progress = data?.progress ?? []

//   const totalEarned = earned.length
//   const totalBadges = progress.length + earned.length

//   return (
//     <div className="max-w-2xl mx-auto px-4">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-8">
//         <div className="w-14 h-14 bg-gradient-to-br from-[#1ED760]/20 to-[#1ED760]/5 rounded-2xl flex items-center justify-center">
//           <Trophy className="w-7 h-7 text-[#1ED760]" />
//         </div>
//         <div>
//           <h1 className="text-2xl font-bold text-white tracking-tight">Badges</h1>
//           <p className="text-sm text-[#b3b3b3]">
//             {totalEarned} of {totalBadges} badges earned
//           </p>
//         </div>
//       </div>

//       {/* Stats - Spotify Style */}
//       <div className="grid grid-cols-3 gap-3 mb-8">
//         {[
//           { label: 'Earned', value: totalEarned, icon: Award, color: 'text-[#1ED760]' },
//           { label: 'In Progress', value: progress.length, icon: TrendingUp, color: 'text-[#4ecdc4]' },
//           { label: 'Total', value: totalBadges, icon: Trophy, color: 'text-[#ffd93d]' },
//         ].map((stat, i) => {
//           const Icon = stat.icon
//           return (
//             <div key={i} className="bg-[#181818] border border-[#282828] rounded-lg p-4 text-center hover:border-[#333333] transition-all">
//               <Icon className={cn("w-6 h-6 mx-auto mb-2", stat.color)} />
//               <p className="text-2xl font-bold text-white">{stat.value}</p>
//               <p className="text-xs text-[#b3b3b3]">{stat.label}</p>
//             </div>
//           )
//         })}
//       </div>

//       {/* Earned Badges */}
//       {earned.length > 0 && (
//         <div className="mb-8">
//           <h2 className="text-sm font-semibold text-[#b3b3b3] uppercase tracking-wider mb-4 flex items-center gap-2">
//             <Sparkles className="w-4 h-4 text-[#1ED760]" />
//             Earned Badges
//             <span className="text-xs font-normal text-[#535353]">({earned.length})</span>
//           </h2>
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//             {(earned as { type: string; awardedAt: string }[]).map((b, index) => (
//               <BadgeCardEarned 
//                 key={b.type} 
//                 badgeType={b.type} 
//                 awardedAt={b.awardedAt}
//                 index={index}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Progress Badges */}
//       {progress.length > 0 && (
//         <div>
//           <h2 className="text-sm font-semibold text-[#b3b3b3] uppercase tracking-wider mb-4 flex items-center gap-2">
//             <TrendingUp className="w-4 h-4 text-[#4ecdc4]" />
//             In Progress
//             <span className="text-xs font-normal text-[#535353]">({progress.length})</span>
//           </h2>
//           <div className="flex flex-col gap-3">
//             {progress.map((p: BadgeProgress, index: number) => (
//               <BadgeProgressCard 
//                 key={p.type} 
//                 progress={p}
//                 index={index}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {!earned.length && !progress.length && (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="w-28 h-28 bg-[#181818] rounded-full flex items-center justify-center mb-6">
//             <Trophy className="w-14 h-14 text-[#535353]" />
//           </div>
//           <h3 className="text-2xl font-bold text-white mb-2">No badges yet</h3>
//           <p className="text-[#b3b3b3] text-sm text-center max-w-sm">
//             Start creating and engaging to earn badges and unlock achievements
//           </p>
//           <Link to="/create">
//             <button className="mt-6 px-8 py-3 bg-[#1ED760] hover:bg-[#1fdf64] text-black font-bold rounded-full transition-all">
//               Create Your First Post
//             </button>
//           </Link>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Badge Card Earned ─────────────────────────

// const BADGE_INFO: Record<string, { icon: any; name: string; desc: string; color: string }> = {
//   verified    : { icon: BadgeCheck, name: 'Verified', desc: 'Verified creator account', color: 'text-[#1ED760]' },
//   rising_star : { icon: Star, name: 'Rising Star', desc: '100 followers in first 30 days', color: 'text-[#ffd93d]' },
//   top_creator : { icon: Crown, name: 'Top Creator', desc: '10,000 total likes on your posts', color: 'text-[#ff6b6b]' },
//   voice_artist: { icon: Mic2, name: 'Voice Artist', desc: 'Published 10 audio posts', color: 'text-[#a29bfe]' },
//   author      : { icon: BookOpen, name: 'Author', desc: 'Completed a full series', color: 'text-[#4ecdc4]' },
//   admin_pick  : { icon: Star, name: 'Admin Pick', desc: 'Handpicked by Sayari team', color: 'text-[#fd79a8]' },
// }

// function BadgeCardEarned({ badgeType, awardedAt, index }: { badgeType: string; awardedAt: string; index: number }) {
//   const info = BADGE_INFO[badgeType] || { icon: Award, name: badgeType, desc: '', color: 'text-[#b3b3b3]' }
//   const Icon = info.icon
  
//   return (
//     <div className={cn(
//       "bg-[#181818] border border-[#282828] rounded-lg p-4 text-center hover:border-[#333333] hover:bg-[#202020] transition-all group",
//       "hover:scale-[1.02]"
//     )}
//     style={{ animationDelay: `${index * 50}ms` }}>
//       <div className="relative inline-block">
//         <div className="w-14 h-14 bg-[#282828] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
//           <Icon className={cn("w-7 h-7", info.color)} />
//         </div>
//         <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#1ED760] rounded-full flex items-center justify-center">
//           <Check className="w-3 h-3 text-black" />
//         </div>
//       </div>
//       <p className="text-sm font-semibold text-white">{info.name}</p>
//       <p className="text-xs text-[#b3b3b3] mt-1">{info.desc}</p>
//       <p className="text-[10px] text-[#535353] mt-2">Earned {timeAgo(awardedAt)}</p>
//     </div>
//   )
// }

// // ── Badge Progress Card ──────────────────────

// function BadgeProgressCard({ progress, index }: { progress: BadgeProgress; index: number }) {
//   const info = BADGE_INFO[progress.type] || { icon: Award, name: progress.type, desc: '', color: 'text-[#b3b3b3]' }
//   const Icon = info.icon
//   const pct  = progress.pct ?? (progress.earned ? 100 : 0)

//   const getProgressText = () => {
//     if (progress.type === 'rising_star') 
//       return `${progress.followers ?? 0}/100 followers${progress.daysRemaining ? ` · ${progress.daysRemaining} days left` : ''}`
//     if (progress.type === 'top_creator') 
//       return `${(progress.likes ?? 0).toLocaleString()}/10,000 likes`
//     if (progress.type === 'voice_artist') 
//       return `${progress.audioPosts ?? 0}/10 audio posts`
//     if (progress.type === 'author') 
//       return `${progress.completedSeries ?? 0}/1 completed series`
//     return ''
//   }

//   return (
//     <div className={cn(
//       "bg-[#181818] border border-[#282828] rounded-lg p-4 hover:border-[#333333] transition-all group",
//       progress.earned && "border-[#1ED760]/30 bg-[#1ED760]/5"
//     )}
//     style={{ animationDelay: `${index * 50}ms` }}>
//       <div className="flex items-center gap-4">
//         <div className={cn(
//           "w-12 h-12 rounded-full flex items-center justify-center transition-all",
//           progress.earned 
//             ? "bg-[#1ED760]/10 border border-[#1ED760]/30" 
//             : "bg-[#282828] border border-[#333333]"
//         )}>
//           <Icon className={cn("w-6 h-6", progress.earned ? info.color : "text-[#535353]")} />
//         </div>
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center justify-between mb-1">
//             <p className={cn(
//               "text-sm font-semibold",
//               progress.earned ? 'text-white' : 'text-[#b3b3b3]'
//             )}>
//               {info.name}
//             </p>
//             <span className="text-xs font-medium text-[#b3b3b3]">{pct}%</span>
//           </div>
//           <p className="text-xs text-[#b3b3b3] mb-2">{info.desc}</p>
//           <div className="h-1 bg-[#282828] rounded-full overflow-hidden">
//             <div 
//               className="h-full bg-[#1ED760] rounded-full transition-all duration-1000"
//               style={{ width: `${pct}%` }}
//             />
//           </div>
//           {!progress.earned && getProgressText() && (
//             <p className="text-[10px] text-[#535353] mt-1.5">
//               {getProgressText()}
//             </p>
//           )}
//         </div>
//         {progress.earned && (
//           <div className="shrink-0">
//             <Check className="w-5 h-5 text-[#1ED760]" />
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }














import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Bell, Check, CheckCheck, Trash2, Settings, Bookmark, Trophy, Lock,
  Heart, MessageCircle, UserPlus, Star, Sparkles, Clock, 
  ChevronRight, Gift, Award, TrendingUp, Flame, Crown,
  X, Circle, User, Share2, Music, BookOpen, Mic2,
  Megaphone, Users, Radio, Headphones, Zap, BadgeCheck
} from 'lucide-react'
import { notificationsApi, badgesApi, engagementApi } from '../../api'
import { useNotifStore } from '../../store/index'
import { useSocket } from '../../hooks/useSocket'
import { Avatar, Button, Toggle, PageSpinner, EmptyState, Card } from '../../components/ui'
import { cn, timeAgo, getErrorMessage } from '../../utils'
import type { Notification, BadgeProgress } from '../../types'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────
//  NOTIFICATIONS PAGE
// ─────────────────────────────────────────────

export function NotificationsPage() {
  const [showPrefs, setShowPrefs] = useState(false)
  const { markAllRead: storeMarkAll } = useNotifStore()
  const { markAllRead } = useSocket()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn : () => notificationsApi.list({ limit: 50 }).then(r => r.data.data),
    refetchInterval: 30000,
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess : () => {
      storeMarkAll()
      markAllRead()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All marked as read ✨')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess  : () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications = data?.notifications ?? []
  const unread        = data?.unreadCount ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 animate-slide-up">
      {/* Header - ALFAZ Midnight Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-border/50">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-surface2 rounded-full border border-border/60 flex items-center justify-center shadow-inner relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent rounded-full" />
            <Bell className="w-7 h-7 text-primary relative z-10" />
            {unread > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full border-2 border-bg animate-pulse" />
            )}
          </div>
          <div>
            <h1 className="text-3xl  font-black text-text tracking-tight">Activity</h1>
            {unread > 0 ? (
              <p className="text-sm font-medium text-primary mt-1 tracking-wide">
                You have {unread} unseen scrolls
              </p>
            ) : (
              <p className="text-sm font-medium text-muted mt-1 tracking-wide">
                You are all caught up
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {unread > 0 && (
            <button 
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-muted hover:text-text border border-border/50 hover:border-primary hover:bg-surface transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              Mark Read
            </button>
          )}
          <button 
            onClick={() => setShowPrefs(!showPrefs)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
              showPrefs 
                ? "bg-primary text-bg shadow-md" 
                : "text-muted hover:text-text border border-border/50 hover:border-primary hover:bg-surface"
            )}
          >
            <Settings className="w-4 h-4" />
            Prefs
          </button>
        </div>
      </div>

      {/* Preferences panel */}
      {showPrefs && (
        <div className="mb-8 animate-slide-up">
          <NotifPrefsPanel onClose={() => setShowPrefs(false)} />
        </div>
      )}

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse border border-border/30" />
          ))}
        </div>
      ) : !notifications.length ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <div className="w-32 h-32 bg-surface2 rounded-full flex items-center justify-center mb-6 border border-border/50 shadow-inner">
            <Sparkles className="w-12 h-12 text-muted/50" />
          </div>
          <h3 className="text-2xl  font-bold text-text mb-2">The night is quiet</h3>
          <p className="text-muted text-sm max-w-sm leading-relaxed">
            We will softly alert you when the community interacts with your verses.
          </p>
          <Link to="/explore">
            <Button className="mt-8 bg-primary text-bg hover:bg-primary-dark font-bold px-8 py-4 rounded-full shadow-lg hover:gold-glow">
              Explore ALFAZ
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n, index) => (
            <NotifItem
              key={n._id}
              notif={n}
              onDelete={() => deleteMutation.mutate(n._id)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Notification Item ─────────────────────────

// Updated icons to match the luxurious theme palette
const NOTIF_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  new_follower      : { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10' },
  post_liked        : { icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
  post_commented    : { icon: MessageCircle, color: 'text-accent', bg: 'bg-accent/10' },
  comment_replied   : { icon: MessageCircle, color: 'text-accent', bg: 'bg-accent/10' },
  badge_awarded     : { icon: Award, color: 'text-primary-dark', bg: 'bg-primary-dark/10' },
  new_chapter       : { icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
  series_completed  : { icon: Trophy, color: 'text-primary-dark', bg: 'bg-primary-dark/10' },
  post_saved        : { icon: Bookmark, color: 'text-primary', bg: 'bg-primary/10' },
  post_featured     : { icon: Star, color: 'text-primary', bg: 'bg-primary/10' },
  account_warning   : { icon: Bell, color: 'text-red-500', bg: 'bg-red-500/10' },
  admin_announcement: { icon: Megaphone, color: 'text-accent', bg: 'bg-accent/10' },
  mention           : { icon: User, color: 'text-primary', bg: 'bg-primary/10' },
  scheduled_published: { icon: Check, color: 'text-primary', bg: 'bg-primary/10' },
}

function NotifItem({ notif, onDelete, index }: { notif: Notification; onDelete: () => void; index: number }) {
  const [read, setRead] = useState(notif.isRead)
  const [isDeleting, setIsDeleting] = useState(false)
  const { markRead } = useSocket()
  
  const iconData = NOTIF_ICONS[notif.type] || { icon: Bell, color: 'text-muted', bg: 'bg-surface2' }
  const Icon = iconData.icon

  const handleClick = () => {
    if (!read) { 
      setRead(true); 
      markRead(notif._id) 
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    setTimeout(() => {
      onDelete()
    }, 300)
  }

  const deepLink = notif.meta?.deepLink

  const content = (
    <div 
      className={cn(
        'group relative flex items-start sm:items-center gap-4 p-4 rounded-2xl transition-all duration-300 border cursor-pointer overflow-hidden',
        !read 
          ? 'bg-surface border-border shadow-sm' 
          : 'bg-transparent border-transparent hover:bg-surface/50 hover:border-border/50',
        isDeleting && 'opacity-0 scale-95'
      )}
      onClick={handleClick}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Read indicator edge */}
      {!read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />}

      {/* Avatar/Icon */}
      <div className="shrink-0 relative">
        {notif.actor ? (
          <div className="relative">
            <div className="ring-2 ring-bg rounded-full bg-surface2">
              <Avatar user={notif.actor} size="md" />
            </div>
            <div className={cn("absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-bg", iconData.bg)}>
              <Icon className={cn("w-3 h-3", iconData.color)} />
            </div>
          </div>
        ) : (
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border-2 border-bg", iconData.bg)}>
            <Icon className={cn("w-5 h-5", iconData.color)} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1">
        <p className={cn(
          "text-sm leading-snug font-medium",
          !read ? 'text-text' : 'text-muted'
        )}>
          {notif.body}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted/60 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {timeAgo(notif.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-2">
        {!read && (
          <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded-full uppercase tracking-widest border border-primary/20">
            New
          </span>
        )}
        <button
          onClick={handleDelete}
          className="p-2 rounded-full opacity-0 sm:group-hover:opacity-100 bg-surface2 hover:bg-red-500/10 text-muted hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  if (deepLink) return <Link to={deepLink} className="block">{content}</Link>
  return content
}

// ── Notification Preferences Panel ───────────

function NotifPrefsPanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notif-prefs'],
    queryFn : () => notificationsApi.getPrefs().then(r => r.data.data.prefs as Record<string, boolean>),
  })

  const updateMutation = useMutation({
    mutationFn: (prefs: Record<string, boolean>) => notificationsApi.updatePrefs(prefs),
    onSuccess  : () => {
      queryClient.invalidateQueries({ queryKey: ['notif-prefs'] })
      toast.success('Scroll preferences updated')
    },
  })

  const prefs = data || {}

  const prefItems = [
    { key: 'newFollower', label: 'New followers', icon: UserPlus },
    { key: 'newComment', label: 'Comments on posts', icon: MessageCircle },
    { key: 'newLike', label: 'Post likes', icon: Heart },
    { key: 'newChapter', label: 'New chapters', icon: BookOpen },
    { key: 'adminAnnouncement', label: 'Announcements', icon: Megaphone },
    { key: 'push', label: 'Push notifications', icon: Bell },
    { key: 'whatsapp', label: 'WhatsApp notifications', icon: MessageCircle },
  ]

  return (
    <div className="bg-surface2/50 backdrop-blur-xl rounded-2xl p-6 border border-border shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface rounded-full border border-border/50">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <h3 className=" text-lg font-bold text-text">Scroll Settings</h3>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-full hover:bg-surface text-muted hover:text-text transition-colors border border-transparent hover:border-border/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {prefItems.map(item => {
          const Icon = item.icon
          return (
            <div key={item.key} className="flex items-center justify-between p-4 bg-surface hover:bg-surface/80 border border-border/40 rounded-xl transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted" />
                <span className="text-sm font-medium text-text">{item.label}</span>
              </div>
              <Toggle
                checked={!!prefs[item.key]}
                onChange={(v) => updateMutation.mutate({ [item.key]: v })}
                loading={updateMutation.isPending}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  SAVED PAGE
// ─────────────────────────────────────────────

export function SavedPage() {
  const [activeCollection, setActiveCollection] = useState('Saved')

  const { data, isLoading } = useQuery({
    queryKey: ['saved', activeCollection],
    queryFn : () => engagementApi.getSaved({ collection: activeCollection, limit: 50 }).then(r => r.data.data),
  })

  const collections = data?.collections ?? ['Saved']
  const items       = data?.items ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-border/50">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-surface2 rounded-full border border-border/60 flex items-center justify-center shadow-inner relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent rounded-full" />
            <Bookmark className="w-7 h-7 text-primary relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl  font-black text-text tracking-tight">Your Collection</h1>
            <p className="text-sm font-medium text-muted mt-1 tracking-wide">
              {items.length} beautifully preserved thoughts
            </p>
          </div>
        </div>
      </div>

      {/* Collections Tabs */}
      {collections.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {collections.map(col => (
            <button
              key={col}
              onClick={() => setActiveCollection(col)}
              className={cn(
                'shrink-0 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border',
                activeCollection === col
                  ? 'bg-primary text-bg border-primary shadow-md'
                  : 'bg-surface text-muted border-border/50 hover:border-primary hover:text-text'
              )}
            >
              {col}
            </button>
          ))}
        </div>
      )}

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-surface rounded-2xl animate-pulse border border-border/30" />
          ))}
        </div>
      ) : !items.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-32 h-32 bg-surface2 rounded-full flex items-center justify-center mb-6 border border-border/50 shadow-inner">
            <Bookmark className="w-12 h-12 text-muted/50" />
          </div>
          <h3 className="text-2xl  font-bold text-text mb-2">The vault is empty</h3>
          <p className="text-muted text-sm max-w-sm leading-relaxed">
            Tap the bookmark icon on any masterpiece you wish to keep in your personal collection.
          </p>
          <Link to="/explore">
            <Button className="mt-8 bg-primary text-bg hover:bg-primary-dark font-bold px-8 py-4 rounded-full shadow-lg hover:gold-glow">
              Discover Poetry
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item: any, index: number) => (
            <Link 
              key={item._id} 
              to={`/post/${item._id}`} 
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface border border-border/50 shadow-lg hover:border-primary/50 hover:gold-glow transition-all duration-500"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {item.renderedImage?.thumbnail ? (
                <img 
                  src={item.renderedImage.thumbnail} 
                  alt="" 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface2 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 to-transparent" />
                  <BookOpen className="w-10 h-10 text-muted/30 relative z-10" />
                </div>
              )}
              {/* Refined Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-1">
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest truncate">{item.genre || 'Poetry'}</p>
                <p className="text-text  text-lg font-bold leading-tight line-clamp-2 drop-shadow-md">
                  {item.title || 'Untitled Verse'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  BADGES PAGE
// ─────────────────────────────────────────────

export function BadgesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['badges', 'progress'],
    queryFn : () => badgesApi.myProgress().then(r => r.data.data),
  })

  if (isLoading) return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto px-4 py-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 bg-surface rounded-2xl animate-pulse border border-border/30" />
      ))}
    </div>
  )

  const earned   = data?.earned   ?? []
  const progress = data?.progress ?? []

  const totalEarned = earned.length
  const totalBadges = progress.length + earned.length

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-border/50">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-surface2 rounded-full border border-border/60 flex items-center justify-center shadow-inner relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent rounded-full" />
            <Trophy className="w-7 h-7 text-primary relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl  font-black text-text tracking-tight">Achievements</h1>
            <p className="text-sm font-medium text-muted mt-1 tracking-wide">
              {totalEarned} of {totalBadges} accolades earned
            </p>
          </div>
        </div>
      </div>

      {/* Stats - ALFAZ Style */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          { label: 'Earned', value: totalEarned, icon: Award, color: 'text-primary' },
          { label: 'In Progress', value: progress.length, icon: TrendingUp, color: 'text-accent' },
          { label: 'Total', value: totalBadges, icon: Trophy, color: 'text-primary-dark' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-surface/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 text-center hover:bg-surface hover:border-primary/30 transition-all shadow-sm">
              <div className="w-10 h-10 mx-auto rounded-full bg-surface2 border border-border/50 flex items-center justify-center mb-3">
                <Icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <p className="text-3xl  font-black text-text">{stat.value}</p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-6 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-primary" />
            Unlocked Masterpieces
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-surface border border-border/50">{earned.length}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(earned as { type: string; awardedAt: string }[]).map((b, index) => (
              <BadgeCardEarned 
                key={b.type} 
                badgeType={b.type} 
                awardedAt={b.awardedAt}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Progress Badges */}
      {progress.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-6 flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-accent" />
            Paths in Progress
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-surface border border-border/50">{progress.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progress.map((p: BadgeProgress, index: number) => (
              <BadgeProgressCard 
                key={p.type} 
                progress={p}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {!earned.length && !progress.length && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-32 h-32 bg-surface2 rounded-full flex items-center justify-center mb-6 border border-border/50 shadow-inner">
            <Crown className="w-12 h-12 text-muted/50" />
          </div>
          <h3 className="text-2xl  font-bold text-text mb-2">No accolades yet</h3>
          <p className="text-muted text-sm max-w-sm leading-relaxed">
            Begin sharing your words to build your legacy and unlock creator badges.
          </p>
          <Link to="/create">
            <Button className="mt-8 bg-primary text-bg hover:bg-primary-dark font-bold px-8 py-4 rounded-full shadow-lg hover:gold-glow">
              Compose Your First Piece
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Badge Card Earned ─────────────────────────

const BADGE_INFO: Record<string, { icon: any; name: string; desc: string; color: string; bg: string }> = {
  verified    : { icon: BadgeCheck, name: 'Verified', desc: 'Verified creator', color: 'text-primary', bg: 'bg-primary/10' },
  rising_star : { icon: Star, name: 'Rising Star', desc: '100 followers in 30 days', color: 'text-primary-dark', bg: 'bg-primary-dark/10' },
  top_creator : { icon: Crown, name: 'Top Creator', desc: '10K total likes', color: 'text-accent', bg: 'bg-accent/10' },
  voice_artist: { icon: Mic2, name: 'Voice Artist', desc: '10 audio recitations', color: 'text-primary', bg: 'bg-primary/10' },
  author      : { icon: BookOpen, name: 'Author', desc: 'Completed a series', color: 'text-primary-dark', bg: 'bg-primary-dark/10' },
  admin_pick  : { icon: Sparkles, name: 'Admin Pick', desc: 'Curator selection', color: 'text-accent', bg: 'bg-accent/10' },
}

function BadgeCardEarned({ badgeType, awardedAt, index }: { badgeType: string; awardedAt: string; index: number }) {
  const info = BADGE_INFO[badgeType] || { icon: Award, name: badgeType, desc: '', color: 'text-primary', bg: 'bg-primary/10' }
  const Icon = info.icon
  
  return (
    <div className={cn(
      "bg-surface border border-border/50 rounded-2xl p-6 text-center hover:border-primary/40 hover:bg-surface2 transition-all duration-300 group shadow-sm hover:shadow-lg relative overflow-hidden",
      "hover:-translate-y-1"
    )}
    style={{ animationDelay: `${index * 50}ms` }}>
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative inline-block mb-4">
        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-border/50 group-hover:scale-110 transition-transform duration-500 relative z-10", info.bg)}>
          <Icon className={cn("w-7 h-7", info.color)} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-bg z-20 shadow-md">
          <Check className="w-3 h-3 text-bg" />
        </div>
      </div>
      <p className="text-base  font-bold text-text group-hover:text-primary transition-colors">{info.name}</p>
      <p className="text-xs text-muted mt-1.5 leading-snug">{info.desc}</p>
      <div className="mt-4 pt-4 border-t border-border/30">
        <p className="text-[10px] font-bold tracking-widest uppercase text-muted/60">Achieved {timeAgo(awardedAt)}</p>
      </div>
    </div>
  )
}

// ── Badge Progress Card ──────────────────────

function BadgeProgressCard({ progress, index }: { progress: BadgeProgress; index: number }) {
  const info = BADGE_INFO[progress.type] || { icon: Award, name: progress.type, desc: '', color: 'text-primary', bg: 'bg-primary/10' }
  const Icon = info.icon
  const pct  = progress.pct ?? (progress.earned ? 100 : 0)

  const getProgressText = () => {
    if (progress.type === 'rising_star') 
      return `${progress.followers ?? 0}/100 followers${progress.daysRemaining ? ` · ${progress.daysRemaining} days left` : ''}`
    if (progress.type === 'top_creator') 
      return `${(progress.likes ?? 0).toLocaleString()}/10,000 likes`
    if (progress.type === 'voice_artist') 
      return `${progress.audioPosts ?? 0}/10 recitations`
    if (progress.type === 'author') 
      return `${progress.completedSeries ?? 0}/1 series`
    return ''
  }

  return (
    <div className={cn(
      "bg-surface border rounded-2xl p-5 hover:bg-surface2 transition-all duration-300 group shadow-sm",
      progress.earned ? "border-primary/30 bg-primary/5" : "border-border/50 hover:border-primary/40"
    )}
    style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-center gap-5">
        <div className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center transition-all shrink-0 border",
          progress.earned 
            ? cn(info.bg, "border-primary/30") 
            : "bg-surface2 border-border/60 group-hover:border-primary/20"
        )}>
          <Icon className={cn("w-6 h-6", progress.earned ? info.color : "text-muted")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className={cn(
              "text-base e font-bold",
              progress.earned ? 'text-primary' : 'text-text group-hover:text-primary transition-colors'
            )}>
              {info.name}
            </p>
            <span className="text-[11px] font-bold text-muted bg-surface2 px-2 py-0.5 rounded-full border border-border/50">{pct}%</span>
          </div>
          <p className="text-xs text-muted mb-3 font-medium">{info.desc}</p>
          
          {/* Progress Bar Container */}
          <div className="h-1.5 bg-surface2 border border-border/30 rounded-full overflow-hidden shadow-inner">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                progress.earned ? "bg-primary" : "bg-gradient-to-r from-accent to-primary"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          
          {!progress.earned && getProgressText() && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted/80 mt-2">
              {getProgressText()}
            </p>
          )}
        </div>
        {progress.earned && (
          <div className="shrink-0 pl-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Check className="w-4 h-4 text-primary" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}