// import { useState } from 'react'
// import { useParams, Link, useNavigate } from 'react-router-dom'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import {
//   Search, Filter, MoreVertical, Ban, CheckCircle, Trash2,
//   Award, ArrowLeft, Shield, Mail, Calendar, FileText, Flag
// } from 'lucide-react'
// import { usersApi } from '../../api'
// import { Avatar, Button, Input, Select, Modal, Card, PageSpinner, EmptyState, BadgePill, Spinner } from '../../components/ui'
// import { cn, formatCount, timeAgo, getErrorMessage } from '../../utils'
// import type { AdminUser, BadgeType } from '../../types'
// import toast from 'react-hot-toast'

// // ─────────────────────────────────────────────
// //  USERS LIST PAGE
// // ─────────────────────────────────────────────

// export function UsersListPage() {
//   const [search, setSearch]     = useState('')
//   const [role, setRole]         = useState('')
//   const [status, setStatus]     = useState('')
//   const [sort, setSort]         = useState('newest')
//   const [page, setPage]         = useState(1)

//   const { data, isLoading } = useQuery({
//     queryKey: ['admin', 'users', search, role, status, sort, page],
//     queryFn : () => usersApi.list({
//       search: search || undefined, role: role || undefined,
//       status: status || undefined, sort: sort as never, page, limit: 20,
//     }).then(r => r.data.data),
//   })

//   return (
//     <div>
//       <h1 className="text-xl font-bold text-white mb-6">User Management</h1>

//       {/* Filters */}
//       <div className="flex gap-3 mb-4 flex-wrap">
//         <div className="flex-1 min-w-[200px]">
//           <Input
//             placeholder="Search by username, email..."
//             icon={<Search className="w-4 h-4" />}
//             value={search}
//             onChange={e => { setSearch(e.target.value); setPage(1) }}
//           />
//         </div>
//         <Select
//           value={role}
//           onChange={e => { setRole(e.target.value); setPage(1) }}
//           options={[
//             { value: '', label: 'All Roles' }, { value: 'user', label: 'User' },
//             { value: 'creator', label: 'Creator' }, { value: 'moderator', label: 'Moderator' },
//             { value: 'admin', label: 'Admin' },
//           ]}
//           className="w-40"
//         />
//         <Select
//           value={status}
//           onChange={e => { setStatus(e.target.value); setPage(1) }}
//           options={[
//             { value: '', label: 'All Status' }, { value: 'active', label: 'Active' },
//             { value: 'suspended', label: 'Suspended' }, { value: 'banned', label: 'Banned' },
//           ]}
//           className="w-40"
//         />
//         <Select
//           value={sort}
//           onChange={e => setSort(e.target.value)}
//           options={[
//             { value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' },
//             { value: 'followers', label: 'Most Followers' }, { value: 'posts', label: 'Most Posts' },
//           ]}
//           className="w-44"
//         />
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//       ) : !data?.users.length ? (
//         <EmptyState icon="👤" title="No users found" />
//       ) : (
//         <Card className="overflow-hidden">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-[#2E2E2E] text-left">
//                 <th className="px-4 py-3 text-[#888] font-medium">User</th>
//                 <th className="px-4 py-3 text-[#888] font-medium">Role</th>
//                 <th className="px-4 py-3 text-[#888] font-medium">Status</th>
//                 <th className="px-4 py-3 text-[#888] font-medium">Followers</th>
//                 <th className="px-4 py-3 text-[#888] font-medium">Posts</th>
//                 <th className="px-4 py-3 text-[#888] font-medium">Joined</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.users.map(user => (
//                 <tr key={user._id} className="border-b border-[#1E1E1E] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
//                   onClick={() => window.location.href = `/users/${user._id}`}>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-3">
//                       <Avatar user={user} size="sm" />
//                       <div>
//                         <p className="text-white font-medium flex items-center gap-1">
//                           {user.displayName}{user.isVerified && <span className="text-xs">✅</span>}
//                         </p>
//                         <p className="text-[#888] text-xs">@{user.username}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3"><span className="text-[#ccc] capitalize">{user.role}</span></td>
//                   <td className="px-4 py-3">
//                     <StatusBadge status={user.accountStatus} />
//                   </td>
//                   <td className="px-4 py-3 text-[#888]">{formatCount(user.stats.followersCount)}</td>
//                   <td className="px-4 py-3 text-[#888]">{formatCount(user.stats.postsCount)}</td>
//                   <td className="px-4 py-3 text-[#888]">{timeAgo(user.createdAt)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </Card>
//       )}

//       {/* Pagination */}
//       {data && (data.pagination as { pages: number }).pages > 1 && (
//         <div className="flex justify-center gap-2 mt-6">
//           <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
//           <span className="px-3 py-1.5 text-sm text-[#888]">Page {page}</span>
//           <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
//         </div>
//       )}
//     </div>
//   )
// }

// function StatusBadge({ status }: { status: string }) {
//   const colors: Record<string, string> = {
//     active: 'bg-green-500/20 text-green-400', suspended: 'bg-yellow-500/20 text-yellow-400',
//     banned: 'bg-red-500/20 text-red-400', deactivated: 'bg-[#242424] text-[#888]',
//   }
//   return <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', colors[status])}>{status}</span>
// }

// // ─────────────────────────────────────────────
// //  USER DETAIL PAGE
// // ─────────────────────────────────────────────

// const BADGE_OPTIONS: { value: BadgeType; label: string }[] = [
//   { value: 'verified',     label: '✅ Verified'     },
//   { value: 'rising_star',  label: '🌟 Rising Star'  },
//   { value: 'top_creator',  label: '🏆 Top Creator'  },
//   { value: 'voice_artist', label: '🎙️ Voice Artist'  },
//   { value: 'author',       label: '📚 Author'       },
//   { value: 'admin_pick',   label: '⭐ Admin Pick'   },
// ]

// export function UserDetailPage() {
//   const { userId } = useParams<{ userId: string }>()
//   const navigate    = useNavigate()
//   const queryClient = useQueryClient()
//   const [showBanModal, setShowBanModal]     = useState(false)
//   const [showBadgeModal, setShowBadgeModal] = useState(false)
//   const [showDeleteModal, setShowDeleteModal] = useState(false)

//   const { data, isLoading } = useQuery({
//     queryKey: ['admin', 'user', userId],
//     queryFn : () => usersApi.detail(userId!).then(r => r.data.data),
//     enabled : !!userId,
//   })

//   const unbanMutation = useMutation({
//     mutationFn: () => usersApi.unban(userId!),
//     onSuccess : () => {
//       queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] })
//       toast.success('User unbanned')
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   if (isLoading) return <PageSpinner />
//   if (!data) return <div className="text-center py-20"><p className="text-[#888]">User not found</p></div>

//   const { user, postCount, reportCount, recentActions } = data

//   return (
//     <div>
//       <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#888] hover:text-white mb-6 transition-colors">
//         <ArrowLeft className="w-4 h-4" /> Back to Users
//       </button>

//       {/* Profile header */}
//       <Card className="p-6 mb-6">
//         <div className="flex items-start justify-between">
//           <div className="flex items-center gap-4">
//             <Avatar user={user} size="xl" />
//             <div>
//               <div className="flex items-center gap-2">
//                 <h1 className="text-xl font-bold text-white">{user.displayName}</h1>
//                 {user.isVerified && <span>✅</span>}
//               </div>
//               <p className="text-[#888]">@{user.username}</p>
//               <div className="flex items-center gap-2 mt-2">
//                 <StatusBadge status={user.accountStatus} />
//                 <span className="text-xs text-[#888] capitalize px-2 py-0.5 bg-[#242424] rounded-full">{user.role}</span>
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-2">
//             <Button size="sm" variant="outline" icon={<Award className="w-4 h-4" />} onClick={() => setShowBadgeModal(true)}>
//               Badge
//             </Button>
//             {user.accountStatus === 'banned' ? (
//               <Button size="sm" variant="outline" icon={<CheckCircle className="w-4 h-4" />} onClick={() => unbanMutation.mutate()} loading={unbanMutation.isPending}>
//                 Unban
//               </Button>
//             ) : (
//               <Button size="sm" variant="danger" icon={<Ban className="w-4 h-4" />} onClick={() => setShowBanModal(true)}>
//                 Ban
//               </Button>
//             )}
//             <Button size="sm" variant="ghost" icon={<Trash2 className="w-4 h-4" />} onClick={() => setShowDeleteModal(true)} className="text-red-400 hover:bg-red-400/10">
//               Delete
//             </Button>
//           </div>
//         </div>

//         {/* Info grid */}
//         <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#2E2E2E]">
//           <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={user.email || 'N/A'} />
//           <InfoItem icon={<Calendar className="w-4 h-4" />} label="Joined" value={timeAgo(user.createdAt)} />
//           <InfoItem icon={<FileText className="w-4 h-4" />} label="Posts" value={String(postCount)} />
//           <InfoItem icon={<Flag className="w-4 h-4" />} label="Reports Filed" value={String(reportCount)} />
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-4 gap-4 mt-4">
//           {[
//             { l: 'Followers', v: user.stats.followersCount }, { l: 'Following', v: user.stats.followingCount },
//             { l: 'Total Likes', v: user.stats.totalLikes }, { l: 'Total Views', v: user.stats.totalViews },
//           ].map(s => (
//             <div key={s.l} className="bg-[#0F0F0F] rounded-xl p-3 text-center">
//               <p className="text-lg font-bold text-white">{formatCount(s.v)}</p>
//               <p className="text-xs text-[#888]">{s.l}</p>
//             </div>
//           ))}
//         </div>

//         {/* Badges */}
//         {user.badges?.length > 0 && (
//           <div className="flex gap-2 mt-4 flex-wrap">
//             {user.badges.map(b => <BadgePill key={b.type} type={b.type} showLabel />)}
//           </div>
//         )}

//         {user.banInfo?.reason && (
//           <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
//             <p className="text-sm text-red-400"><strong>Ban reason:</strong> {user.banInfo.reason}</p>
//             {user.banInfo.banExpiresAt && <p className="text-xs text-red-400/70 mt-1">Expires: {timeAgo(user.banInfo.banExpiresAt)}</p>}
//           </div>
//         )}
//       </Card>

//       {/* Recent admin actions */}
//       <Card className="p-5">
//         <h3 className="text-sm font-semibold text-white mb-4">Recent Admin Actions</h3>
//         {recentActions.length === 0 ? (
//           <p className="text-sm text-[#888]">No admin actions on this user</p>
//         ) : (
//           <div className="flex flex-col gap-2">
//             {recentActions.map(action => (
//               <div key={action._id} className="flex items-center gap-3 text-sm py-2 border-b border-[#1E1E1E] last:border-0">
//                 <Shield className="w-4 h-4 text-[#888] shrink-0" />
//                 <span className="text-white capitalize">{action.actionType.replace(/_/g, ' ')}</span>
//                 <span className="text-[#888]">by {action.admin.displayName}</span>
//                 <span className="text-[#555] ml-auto">{timeAgo(action.createdAt)}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </Card>

//       {/* Modals */}
//       {showBanModal && <BanModal userId={userId!} onClose={() => setShowBanModal(false)} />}
//       {showBadgeModal && <BadgeModal userId={userId!} onClose={() => setShowBadgeModal(false)} />}
//       {showDeleteModal && <DeleteUserModal userId={userId!} onClose={() => setShowDeleteModal(false)} />}
//     </div>
//   )
// }

// function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
//   return (
//     <div className="flex items-center gap-2">
//       <span className="text-[#555]">{icon}</span>
//       <div>
//         <p className="text-xs text-[#555]">{label}</p>
//         <p className="text-sm text-white truncate max-w-[140px]">{value}</p>
//       </div>
//     </div>
//   )
// }

// // ── Ban Modal ──────────────────────────────────

// function BanModal({ userId, onClose }: { userId: string; onClose: () => void }) {
//   const [reason, setReason]   = useState('')
//   const [duration, setDuration] = useState('permanent')
//   const queryClient = useQueryClient()

//   const banMutation = useMutation({
//     mutationFn: () => {
//       let expiresAt: string | undefined
//       if (duration !== 'permanent') {
//         const days = parseInt(duration)
//         expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
//       }
//       return usersApi.ban(userId, reason, expiresAt)
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] })
//       toast.success('User banned')
//       onClose()
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   return (
//     <Modal open onClose={onClose} title="Ban User" size="sm">
//       <div className="p-6 flex flex-col gap-4">
//         <Select
//           label="Duration"
//           value={duration}
//           onChange={e => setDuration(e.target.value)}
//           options={[
//             { value: 'permanent', label: 'Permanent' }, { value: '1', label: '1 Day' },
//             { value: '7', label: '7 Days' }, { value: '30', label: '30 Days' },
//           ]}
//         />
//         <Input label="Reason (required)" placeholder="Why is this user being banned?" value={reason} onChange={e => setReason(e.target.value)} />
//         <div className="flex gap-3 mt-2">
//           <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
//           <Button variant="danger" className="flex-1" disabled={!reason.trim()} loading={banMutation.isPending} onClick={() => banMutation.mutate()}>
//             Ban User
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   )
// }

// // ── Badge Modal ────────────────────────────────

// function BadgeModal({ userId, onClose }: { userId: string; onClose: () => void }) {
//   const [badgeType, setBadgeType] = useState<BadgeType>('verified')
//   const queryClient = useQueryClient()

//   const assignMutation = useMutation({
//     mutationFn: () => usersApi.assignBadge(userId, badgeType),
//     onSuccess : () => {
//       queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] })
//       toast.success('Badge assigned')
//       onClose()
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   return (
//     <Modal open onClose={onClose} title="Assign Badge" size="sm">
//       <div className="p-6 flex flex-col gap-4">
//         <Select label="Badge" value={badgeType} onChange={e => setBadgeType(e.target.value as BadgeType)} options={BADGE_OPTIONS} />
//         <div className="flex gap-3 mt-2">
//           <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
//           <Button className="flex-1" loading={assignMutation.isPending} onClick={() => assignMutation.mutate()}>Assign</Button>
//         </div>
//       </div>
//     </Modal>
//   )
// }

// // ── Delete User Modal ──────────────────────────

// function DeleteUserModal({ userId, onClose }: { userId: string; onClose: () => void }) {
//   const [reason, setReason] = useState('')
//   const navigate = useNavigate()

//   const deleteMutation = useMutation({
//     mutationFn: () => usersApi.delete(userId, reason),
//     onSuccess : () => {
//       toast.success('User deleted')
//       navigate('/users')
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   return (
//     <Modal open onClose={onClose} title="Delete User" size="sm">
//       <div className="p-6 flex flex-col gap-4">
//         <p className="text-sm text-[#888]">This action soft-deletes the user account. This cannot be easily undone.</p>
//         <Input label="Reason (required)" placeholder="Why is this account being deleted?" value={reason} onChange={e => setReason(e.target.value)} />
//         <div className="flex gap-3 mt-2">
//           <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
//           <Button variant="danger" className="flex-1" disabled={!reason.trim()} loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>
//             Delete Account
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   )
// }









































import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Ban, CheckCircle, Trash2, Award, ArrowLeft, 
  Shield, Mail, Calendar, FileText, Flag, User, Users, Filter, BadgeCheck
} from 'lucide-react'
import { usersApi } from '../../api'
import { Avatar, Button, Input, CustomSelect, Modal, Card, PageSpinner, EmptyState, BadgePill, Spinner } from '../../components/ui'
import { cn, formatCount, timeAgo, getErrorMessage } from '../../utils'
import type { AdminUser, BadgeType } from '../../types'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────
//  USERS LIST PAGE
// ─────────────────────────────────────────────

export function UsersListPage() {
  const [search, setSearch]     = useState('')
  const [role, setRole]         = useState('')
  const [status, setStatus]     = useState('')
  const [sort, setSort]         = useState('newest')
  const [page, setPage]         = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', search, role, status, sort, page],
    queryFn : () => usersApi.list({
      search: search || undefined, role: role || undefined,
      status: status || undefined, sort: sort as never, page, limit: 20,
    }).then(r => r.data.data),
  })

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
           <div className="w-10 h-10 bg-[#141414] border border-[#1F1F1F] rounded-xl flex items-center justify-center shadow-inner">
             <Users className="w-5 h-5 text-[#3B82F6]" />
           </div>
           User Management
        </h1>
      </div>

      <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-[20px] shadow-lg mb-6 flex gap-4 flex-wrap items-center">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Search users..." icon={<Search className="w-4 h-4 text-[#71717A]" />} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="bg-[#050505]" />
        </div>
        <CustomSelect value={role} onChange={v => { setRole(v); setPage(1) }} options={[
          { value: '', label: 'All Roles' }, { value: 'user', label: 'User' },
          { value: 'creator', label: 'Creator' }, { value: 'moderator', label: 'Moderator' },
          { value: 'admin', label: 'Admin' },
        ]} className="w-40 bg-[#050505]" />
        <CustomSelect value={status} onChange={v => { setStatus(v); setPage(1) }} options={[
          { value: '', label: 'All Status' }, { value: 'active', label: 'Active' },
          { value: 'suspended', label: 'Suspended' }, { value: 'banned', label: 'Banned' },
        ]} className="w-40 bg-[#050505]" />
        <CustomSelect value={sort} onChange={setSort} options={[
          { value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' },
          { value: 'followers', label: 'Most Followers' }, { value: 'posts', label: 'Most Posts' },
        ]} className="w-44 bg-[#050505]" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !data?.users.length ? (
        <EmptyState icon={<User className="w-8 h-8" />} title="No users found" />
      ) : (
        <Card className="overflow-hidden border-[#1F1F1F]">
          <table className="w-full text-sm">
            <thead className="bg-[#050505]">
              <tr className="border-b border-[#1F1F1F] text-left">
                <th className="px-6 py-4 text-[10px] font-mono text-[#71717A] uppercase tracking-widest">User Profile</th>
                <th className="px-6 py-4 text-[10px] font-mono text-[#71717A] uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-mono text-[#71717A] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-mono text-[#71717A] uppercase tracking-widest">Stats</th>
                <th className="px-6 py-4 text-[10px] font-mono text-[#71717A] uppercase tracking-widest">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F1F]">
              {data.users.map(user => (
                <tr key={user._id} className="hover:bg-[#141414] transition-colors cursor-pointer group" onClick={() => window.location.href = `/users/${user._id}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar user={user} size="sm" />
                      <div>
                        <p className="text-white font-medium flex items-center gap-1.5">{user.displayName} {user.isVerified && <span className=" text-[#3B82F6] px-1 rounded"><BadgeCheck size={16}/></span>}</p>
                        <p className="text-[#71717A] text-[11px] font-mono">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-[#A1A1AA] capitalize font-mono text-xs">{user.role}</span></td>
                  <td className="px-6 py-4"><StatusBadge status={user.accountStatus} /></td>
                  <td className="px-6 py-4 text-[#A1A1AA] text-xs font-mono">{formatCount(user.stats.followersCount)} followers • {formatCount(user.stats.postsCount)} posts</td>
                  <td className="px-6 py-4 text-[#71717A] text-xs font-mono">{timeAgo(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      
      {data && (data.pagination as { pages: number }).pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="px-4 py-2 bg-[#050505] border border-[#1F1F1F] rounded-lg text-xs font-mono text-[#A1A1AA]">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20', 
    suspended: 'bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20',
    banned: 'bg-[#E60000]/10 text-[#E60000] border border-[#E60000]/20', 
    deactivated: 'bg-[#1F1F1F] text-[#71717A] border border-[#2A2A2A]',
  }
  return <span className={cn('text-[10px] font-mono px-2 py-1 rounded-md uppercase tracking-wider border', colors[status])}>{status}</span>
}

// ─────────────────────────────────────────────
//  USER DETAIL PAGE
// ─────────────────────────────────────────────

const BADGE_OPTIONS: { value: BadgeType; label: string, icon?: React.ReactNode }[] = [
  { value: 'verified', label: 'Verified', icon: <CheckCircle className="w-4 h-4 text-blue-400" /> },
  { value: 'rising_star', label: 'Rising Star', icon: <Award className="w-4 h-4 text-yellow-400" /> },
  { value: 'top_creator', label: 'Top Creator', icon: <Award className="w-4 h-4 text-purple-400" /> },
  { value: 'voice_artist', label: 'Voice Artist', icon: <Award className="w-4 h-4 text-green-400" /> },
  { value: 'author', label: 'Author', icon: <FileText className="w-4 h-4 text-orange-400" /> },
  { value: 'admin_pick', label: 'Admin Pick', icon: <Award className="w-4 h-4 text-red-400" /> },
]

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showBanModal, setShowBanModal] = useState(false)
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn : () => usersApi.detail(userId!).then(r => r.data.data),
    enabled : !!userId,
  })

  const unbanMutation = useMutation({
    mutationFn: () => usersApi.unban(userId!),
    onSuccess : () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] })
      toast.success('User unbanned')
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  if (isLoading) return <PageSpinner />
  if (!data) return <div className="text-center py-20 text-[#888]">User not found</div>

  const { user, postCount, reportCount, recentActions } = data

  return (
    <div className="animate-slide-up">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)} icon={<ArrowLeft className="w-4 h-4" />}>Back to Users</Button>

      <Card className="p-8 mb-6 border-[#1F1F1F]">
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="flex gap-6 items-center">
            <Avatar user={user} size="xl" className="ring-4 ring-[#141414]" />
            <div>
              <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">{user.displayName} {user.isVerified && <span className="text-sm"><BadgeCheck size={16} className='text-blue-400'/></span>}</h1>
              <p className="text-[#A1A1AA] font-mono text-sm">@{user.username}</p>
              <div className="flex items-center gap-3 mt-3">
                <StatusBadge status={user.accountStatus} />
                <span className="text-[10px] font-mono uppercase bg-[#1F1F1F] text-[#A1A1AA] px-2 py-1 rounded">{user.role}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowBadgeModal(true)}>Award Badge</Button>
            {user.accountStatus === 'banned' ? (
              <Button size="sm" variant="outline" onClick={() => unbanMutation.mutate()} loading={unbanMutation.isPending}>Unban User</Button>
            ) : (
              <Button size="sm" variant="danger" onClick={() => setShowBanModal(true)}>Ban User</Button>
            )}
            <Button size="sm" variant="ghost" className="text-red-400" onClick={() => setShowDeleteModal(true)}>Delete</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-[#1F1F1F]">
          <InfoItem label="Email Address" value={user.email || 'N/A'} icon={<Mail className="w-4 h-4" />} />
          <InfoItem label="Account Age" value={timeAgo(user.createdAt)} icon={<Calendar className="w-4 h-4" />} />
          <InfoItem label="Total Posts" value={String(postCount)} icon={<FileText className="w-4 h-4" />} />
          <InfoItem label="Reports Filed" value={String(reportCount)} icon={<Flag className="w-4 h-4" />} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-4">Account Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
                {[ {l: 'Followers', v: user.stats.followersCount}, {l: 'Following', v: user.stats.followingCount}, {l: 'Likes', v: user.stats.totalLikes}, {l: 'Views', v: user.stats.totalViews} ].map(s => (
                    <div key={s.l} className="bg-[#050505] border border-[#1F1F1F] rounded-xl p-4">
                        <p className="text-2xl font-display font-bold text-white">{formatCount(s.v)}</p>
                        <p className="text-[10px] font-mono text-[#71717A] uppercase">{s.l}</p>
                    </div>
                ))}
            </div>
        </Card>
        
        <Card className="p-6">
            <h3 className="text-sm font-bold text-white mb-4">Recent Admin Activity</h3>
            {recentActions.length === 0 ? <p className="text-sm text-[#555]">No recent activity.</p> : (
                <div className="flex flex-col gap-3">
                    {recentActions.map(a => (
                        <div key={a._id} className="flex items-center gap-3 text-xs bg-[#050505] p-3 rounded-lg border border-[#1F1F1F]">
                            <Shield className="w-4 h-4 text-[#71717A]" />
                            <span className="text-white capitalize font-medium">{a.actionType.replace(/_/g, ' ')}</span>
                            <span className="text-[#71717A] ml-auto font-mono">{timeAgo(a.createdAt)}</span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
      </div>

      {showBanModal && <BanModal userId={userId!} onClose={() => setShowBanModal(false)} />}
      {showBadgeModal && <BadgeModal userId={userId!} onClose={() => setShowBadgeModal(false)} />}
      {showDeleteModal && <DeleteUserModal userId={userId!} onClose={() => setShowDeleteModal(false)} />}
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#050505] border border-[#1F1F1F] flex items-center justify-center text-[#71717A]">{icon}</div>
      <div>
        <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest">{label}</p>
        <p className="text-sm text-white font-medium">{value}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  MODALS
// ─────────────────────────────────────────────

function BanModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('permanent')
  const queryClient = useQueryClient()
  const banMutation = useMutation({
    mutationFn: () => usersApi.ban(userId, reason, duration !== 'permanent' ? new Date(Date.now() + parseInt(duration) * 86400000).toISOString() : undefined),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] }); toast.success('User banned'); onClose() },
    onError: err => toast.error(getErrorMessage(err))
  })
  return (
    <Modal open onClose={onClose} title="Ban User" size="sm">
      <div className="flex flex-col gap-4 p-6">
        <CustomSelect value={duration} onChange={setDuration} options={[
          { value: 'permanent', label: 'Permanent' }, { value: '1', label: '1 Day' }, { value: '7', label: '7 Days' }
        ]} />
        <Input label="Reason" value={reason} onChange={e => setReason(e.target.value)} />
        <Button variant="danger" loading={banMutation.isPending} onClick={() => banMutation.mutate()}>Confirm Ban</Button>
      </div>
    </Modal>
  )
}

function BadgeModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [badgeType, setBadgeType] = useState<BadgeType>('verified')
  const queryClient = useQueryClient()
  const assignMutation = useMutation({
    mutationFn: () => usersApi.assignBadge(userId, badgeType),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] }); toast.success('Badge assigned'); onClose() },
    onError: err => toast.error(getErrorMessage(err))
  })
  return (
    <Modal open onClose={onClose} title="Assign Badge" size="sm">
      <div className="flex flex-col gap-4 p-6">
        <CustomSelect value={badgeType} onChange={v => setBadgeType(v as BadgeType)} options={BADGE_OPTIONS} />
        <Button loading={assignMutation.isPending} onClick={() => assignMutation.mutate()}>Assign Badge</Button>
      </div>
    </Modal>
  )
}

function DeleteUserModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const navigate = useNavigate()
  const deleteMutation = useMutation({
    mutationFn: () => usersApi.delete(userId, reason),
    onSuccess: () => { toast.success('User deleted'); navigate('/users') },
    onError: err => toast.error(getErrorMessage(err))
  })
  return (
    <Modal open onClose={onClose} title="Delete User" size="sm">
      <div className="flex flex-col gap-4 p-6">
        <Input label="Reason for deletion" value={reason} onChange={e => setReason(e.target.value)} />
        <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate()}>Delete Account</Button>
      </div>
    </Modal>
  )
}