// import { useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { Plus, Megaphone, Calendar, Users, Send } from 'lucide-react'
// import { announcementsApi } from '../../api'
// import { Button, Input, Textarea, Select, Modal, Card, EmptyState, Spinner } from '../../components/ui'
// import { cn, timeAgo, formatCount, getErrorMessage } from '../../utils'
// import type { Announcement } from '../../types'
// import toast from 'react-hot-toast'

// export function AnnouncementsPage() {
//   const [showCreate, setShowCreate] = useState(false)
//   const [page, setPage]            = useState(1)
//   const queryClient                 = useQueryClient()

//   const { data, isLoading } = useQuery({
//     queryKey: ['admin', 'announcements', page],
//     queryFn : () => announcementsApi.list({ page, limit: 20 }).then(r => r.data.data),
//   })

//   const typeColors: Record<string, string> = {
//     general    : 'bg-[#6C63FF]/20 text-[#6C63FF]',
//     feature    : 'bg-green-500/20 text-green-400',
//     maintenance: 'bg-yellow-500/20 text-yellow-400',
//     celebration: 'bg-pink-500/20 text-pink-400',
//   }

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-xl font-bold text-white flex items-center gap-2">
//           <Megaphone className="w-5 h-5 text-[#6C63FF]" /> Announcements
//         </h1>
//         <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
//           New Announcement
//         </Button>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//       ) : !data?.announcements.length ? (
//         <EmptyState
//           icon="📢"
//           title="No announcements yet"
//           description="Create your first platform announcement"
//           action={<Button onClick={() => setShowCreate(true)}>Create Announcement</Button>}
//         />
//       ) : (
//         <div className="flex flex-col gap-4">
//           {data.announcements.map(a => (
//             <Card key={a._id} className="p-5">
//               <div className="flex items-start justify-between gap-4">
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 flex-wrap mb-2">
//                     <h3 className="text-base font-semibold text-white">{a.title}</h3>
//                     <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', typeColors[a.type])}>
//                       {a.type}
//                     </span>
//                     {!a.isActive && (
//                       <span className="text-xs bg-[#242424] text-[#555] px-2 py-0.5 rounded-full">Draft</span>
//                     )}
//                   </div>
//                   <p className="text-sm text-[#888] leading-relaxed">{a.body}</p>
//                   <div className="flex items-center gap-4 mt-3">
//                     <div className="flex items-center gap-1 text-xs text-[#555]">
//                       <Users className="w-3.5 h-3.5" />
//                       <span className="capitalize">{a.targetAudience.replace('_', ' ')}</span>
//                     </div>
//                     <div className="flex items-center gap-1 text-xs text-[#555]">
//                       <Send className="w-3.5 h-3.5" />
//                       <span>{formatCount(a.sentCount)} sent</span>
//                     </div>
//                     {a.scheduledAt && !a.publishedAt && (
//                       <div className="flex items-center gap-1 text-xs text-yellow-400">
//                         <Calendar className="w-3.5 h-3.5" />
//                         <span>Scheduled {timeAgo(a.scheduledAt)}</span>
//                       </div>
//                     )}
//                     {a.publishedAt && (
//                       <span className="text-xs text-[#555]">Sent {timeAgo(a.publishedAt)}</span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 shrink-0">
//                   <span className="text-xs text-[#555]">by {a.createdBy.displayName}</span>
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}

//       {data && (data.pagination as { pages: number }).pages > 1 && (
//         <div className="flex justify-center gap-2 mt-6">
//           <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
//           <span className="px-3 py-1.5 text-sm text-[#888]">Page {page}</span>
//           <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
//         </div>
//       )}

//       {showCreate && <CreateAnnouncementModal onClose={() => setShowCreate(false)} />}
//     </div>
//   )
// }

// // ── Create Announcement Modal ─────────────────

// function CreateAnnouncementModal({ onClose }: { onClose: () => void }) {
//   const queryClient = useQueryClient()
//   const [title, setTitle]         = useState('')
//   const [body, setBody]           = useState('')
//   const [type, setType]           = useState<Announcement['type']>('general')
//   const [audience, setAudience]   = useState<Announcement['targetAudience']>('all')
//   const [scheduling, setScheduling] = useState(false)
//   const [scheduledAt, setScheduledAt] = useState('')

//   const createMutation = useMutation({
//     mutationFn: () => announcementsApi.create({
//       title, body, type, targetAudience: audience,
//       scheduledAt: scheduling ? scheduledAt : undefined,
//     }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
//       toast.success(scheduling ? 'Announcement scheduled!' : 'Announcement sent!')
//       onClose()
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   return (
//     <Modal open onClose={onClose} title="New Announcement" size="md">
//       <div className="p-6 flex flex-col gap-4">
//         <Input label="Title" placeholder="Sayari mein kuch naya aaya hai..." value={title} onChange={e => setTitle(e.target.value)} />
//         <Textarea label="Message" placeholder="Poori baat yahan likhein..." rows={4} value={body} onChange={e => setBody(e.target.value)} />

//         <div className="grid grid-cols-2 gap-3">
//           <Select
//             label="Type"
//             value={type}
//             onChange={e => setType(e.target.value as Announcement['type'])}
//             options={[
//               { value: 'general',     label: '📢 General'     },
//               { value: 'feature',     label: '✨ New Feature' },
//               { value: 'maintenance', label: '🔧 Maintenance' },
//               { value: 'celebration', label: '🎉 Celebration' },
//             ]}
//           />
//           <Select
//             label="Audience"
//             value={audience}
//             onChange={e => setAudience(e.target.value as Announcement['targetAudience'])}
//             options={[
//               { value: 'all',       label: '🌐 All Users'   },
//               { value: 'creators',  label: '🎨 Creators'    },
//               { value: 'new_users', label: '👋 New Users'   },
//             ]}
//           />
//         </div>

//         {/* Preview */}
//         {(title || body) && (
//           <div className="bg-[#0F0F0F] rounded-2xl p-4 border border-[#2E2E2E]">
//             <p className="text-xs text-[#888] mb-2">Preview</p>
//             <p className="text-sm font-semibold text-white">{title || 'Title...'}</p>
//             <p className="text-sm text-[#888] mt-1">{body || 'Message...'}</p>
//           </div>
//         )}

//         <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
//           <input type="checkbox" checked={scheduling} onChange={e => setScheduling(e.target.checked)} className="accent-[#6C63FF]" />
//           Schedule for later
//         </label>

//         {scheduling && (
//           <input
//             type="datetime-local"
//             value={scheduledAt}
//             onChange={e => setScheduledAt(e.target.value)}
//             min={new Date().toISOString().slice(0, 16)}
//             className="w-full h-11 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl text-white px-4 outline-none focus:border-[#6C63FF]"
//           />
//         )}

//         <div className="flex gap-3 mt-2">
//           <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
//           <Button
//             className="flex-1"
//             icon={scheduling ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
//             disabled={!title.trim() || !body.trim() || (scheduling && !scheduledAt)}
//             loading={createMutation.isPending}
//             onClick={() => createMutation.mutate()}
//           >
//             {scheduling ? 'Schedule' : 'Send Now'}
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   )
// }




















































import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Megaphone, Calendar, Users, Send, Sparkles, Wrench, PartyPopper, Globe, Palette, UserPlus } from 'lucide-react'
import { announcementsApi } from '../../api'
import { Button, Input, Textarea, Select, Modal, Card, EmptyState, Spinner } from '../../components/ui'
import { cn, timeAgo, formatCount, getErrorMessage } from '../../utils'
import type { Announcement } from '../../types'
import toast from 'react-hot-toast'

export function AnnouncementsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [page, setPage]            = useState(1)
  const queryClient                 = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'announcements', page],
    queryFn : () => announcementsApi.list({ page, limit: 20 }).then(r => r.data.data),
  })

  // Upgraded to neon tech colors with border glows
  const typeColors: Record<string, string> = {
    general    : 'bg-[#E60000]/10 text-[#E60000] border border-[#E60000]/20',
    feature    : 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20',
    maintenance: 'bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20',
    celebration: 'bg-[#FF3366]/10 text-[#FF3366] border border-[#FF3366]/20',
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 bg-[#141414] border border-[#1F1F1F] rounded-xl flex items-center justify-center shadow-inner">
            <Megaphone className="w-5 h-5 text-[#E60000] drop-shadow-[0_0_8px_rgba(230,0,0,0.5)]" />
          </div>
          Announcements
        </h1>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
          New Announcement
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !data?.announcements.length ? (
        <EmptyState
          icon={<Megaphone className="w-8 h-8" />}
          title="No announcements yet"
          description="Create your first platform announcement to notify users."
          action={<Button onClick={() => setShowCreate(true)}>Create Announcement</Button>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {data.announcements.map(a => (
            <Card key={a._id} className="p-6 group hover:border-[#2A2A2A] transition-colors duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <h3 className="text-lg font-display font-semibold text-white tracking-wide">{a.title}</h3>
                    <span className={cn('text-[10px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider', typeColors[a.type])}>
                      {a.type}
                    </span>
                    {!a.isActive && (
                      <span className="text-[10px] font-mono bg-[#141414] border border-[#1F1F1F] text-[#71717A] px-2.5 py-1 rounded-full uppercase tracking-wider">Draft</span>
                    )}
                  </div>
                  <p className="text-sm text-[#A1A1AA] font-sans leading-relaxed">{a.body}</p>
                  
                  {/* Metadata Row */}
                  <div className="flex items-center gap-5 mt-4 border-t border-[#1F1F1F] pt-4">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#71717A]">
                      <Users className="w-3.5 h-3.5 text-[#E60000]" />
                      <span className="uppercase tracking-wider">{a.targetAudience.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#71717A]">
                      <Send className="w-3.5 h-3.5 text-[#00E676]" />
                      <span className="uppercase tracking-wider">{formatCount(a.sentCount)} sent</span>
                    </div>
                    {a.scheduledAt && !a.publishedAt && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#FBBF24] bg-[#FBBF24]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                        <Calendar className="w-3 h-3" />
                        <span>Scheduled {timeAgo(a.scheduledAt)}</span>
                      </div>
                    )}
                    {a.publishedAt && (
                      <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider">Sent {timeAgo(a.publishedAt)}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-1.5 rounded-lg">
                  <span className="text-[10px] font-mono text-[#71717A] uppercase">By</span>
                  <span className="text-xs font-medium text-white">{a.createdBy.displayName}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {data && (data.pagination as { pages: number }).pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="px-4 py-2 bg-[#141414] border border-[#1F1F1F] rounded-lg text-xs font-mono text-[#A1A1AA]">Page {page} / {(data.pagination as { pages: number }).pages}</span>
          <Button variant="outline" size="sm" disabled={page >= (data.pagination as { pages: number }).pages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {showCreate && <CreateAnnouncementModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

// ── Create Announcement Modal ─────────────────

function CreateAnnouncementModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [title, setTitle]         = useState('')
  const [body, setBody]           = useState('')
  const [type, setType]           = useState<Announcement['type']>('general')
  const [audience, setAudience]   = useState<Announcement['targetAudience']>('all')
  const [scheduling, setScheduling] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')

  const createMutation = useMutation({
    mutationFn: () => announcementsApi.create({
      title, body, type, targetAudience: audience,
      scheduledAt: scheduling ? scheduledAt : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      toast.success(scheduling ? 'Announcement scheduled!' : 'Announcement sent!')
      onClose()
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  return (
    <Modal open onClose={onClose} title="New Announcement" size="md">
      <div className="flex flex-col gap-5">
        <Input label="Title" placeholder="Sayari mein kuch naya aaya hai..." value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea label="Message" placeholder="Poori baat yahan likhein..." rows={4} value={body} onChange={e => setBody(e.target.value)} />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            value={type}
            onChange={e => setType(e.target.value as Announcement['type'])}
            options={[
              { value: 'general',     label: '📢 General'     },
              { value: 'feature',     label: '✨ New Feature' },
              { value: 'maintenance', label: '🔧 Maintenance' },
              { value: 'celebration', label: '🎉 Celebration' },
            ]}
          />
          <Select
            label="Audience"
            value={audience}
            onChange={e => setAudience(e.target.value as Announcement['targetAudience'])}
            options={[
              { value: 'all',       label: '🌐 All Users'   },
              { value: 'creators',  label: '🎨 Creators'    },
              { value: 'new_users', label: '👋 New Users'   },
            ]}
          />
        </div>



        

        {/* Cyberpunk Live Preview Box */}
        {(title || body) && (
          <div className="bg-[#050505] rounded-xl p-5 border border-[#1F1F1F] relative overflow-hidden mt-2 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E60000]/40 to-transparent" />
            <p className="text-[10px] font-mono text-[#E60000] mb-3 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E60000] animate-pulse" />
              Live Preview
            </p>
            <p className="text-base font-display font-semibold text-white tracking-wide">{title || 'Title...'}</p>
            <p className="text-sm text-[#A1A1AA] font-sans mt-1.5">{body || 'Message...'}</p>
          </div>
        )}

        {/* Scheduling Section */}
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-xl p-4 mt-2">
          <label className="flex items-center gap-3 text-sm font-medium text-white cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={scheduling} 
              onChange={e => setScheduling(e.target.checked)} 
              className="w-4 h-4 accent-[#E60000] bg-[#0A0A0A] border-[#2A2A2A] rounded cursor-pointer" 
            />
            Schedule for later
          </label>

          {scheduling && (
            <div className="mt-4 pt-4 border-t border-[#1F1F1F] animate-slide-up">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full h-12 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white px-4 outline-none focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] focus:shadow-[0_0_15px_rgba(230,0,0,0.1)] transition-all font-sans"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-[#1F1F1F]">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1"
            icon={scheduling ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            disabled={!title.trim() || !body.trim() || (scheduling && !scheduledAt)}
            loading={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {scheduling ? 'Schedule' : 'Send Now'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}













// import { useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { 
//   Plus, Megaphone, Calendar, Users, Send, 
//   Sparkles, Wrench, PartyPopper, Globe, Palette, UserPlus 
// } from 'lucide-react'
// import { announcementsApi } from '../../api'
// import { Button, Input, Textarea, Select, Modal, Card, EmptyState, Spinner } from '../../components/ui'
// import { cn, timeAgo, formatCount, getErrorMessage } from '../../utils'
// import type { Announcement } from '../../types'
// import toast from 'react-hot-toast'

// export function AnnouncementsPage() {
//   const [showCreate, setShowCreate] = useState(false)
//   const [page, setPage]            = useState(1)
//   const queryClient                 = useQueryClient()

//   const { data, isLoading } = useQuery({
//     queryKey: ['admin', 'announcements', page],
//     queryFn : () => announcementsApi.list({ page, limit: 20 }).then(r => r.data.data),
//   })

//   // Upgraded to neon tech colors with border glows
//   const typeColors: Record<string, string> = {
//     general    : 'bg-[#E60000]/10 text-[#E60000] border border-[#E60000]/20',
//     feature    : 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20',
//     maintenance: 'bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20',
//     celebration: 'bg-[#FF3366]/10 text-[#FF3366] border border-[#FF3366]/20',
//   }

//   return (
//     <div className="animate-slide-up">
//       <div className="flex items-center justify-between mb-8">
//         <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 tracking-tight">
//           <div className="w-10 h-10 bg-[#141414] border border-[#1F1F1F] rounded-xl flex items-center justify-center shadow-inner">
//             <Megaphone className="w-5 h-5 text-[#E60000] drop-shadow-[0_0_8px_rgba(230,0,0,0.5)]" />
//           </div>
//           Announcements
//         </h1>
//         <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
//           New Announcement
//         </Button>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-20"><Spinner size="lg" /></div>
//       ) : !data?.announcements.length ? (
//         <EmptyState
//           icon={<Megaphone className="w-8 h-8" />}
//           title="No announcements yet"
//           description="Create your first platform announcement to notify users."
//           action={<Button onClick={() => setShowCreate(true)}>Create Announcement</Button>}
//         />
//       ) : (
//         <div className="flex flex-col gap-4">
//           {data.announcements.map(a => (
//             <Card key={a._id} className="p-6 group hover:border-[#2A2A2A] transition-colors duration-300">
//               <div className="flex items-start justify-between gap-4">
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-3 flex-wrap mb-3">
//                     <h3 className="text-lg font-display font-semibold text-white tracking-wide">{a.title}</h3>
//                     <span className={cn('text-[10px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider', typeColors[a.type])}>
//                       {a.type}
//                     </span>
//                     {!a.isActive && (
//                       <span className="text-[10px] font-mono bg-[#141414] border border-[#1F1F1F] text-[#71717A] px-2.5 py-1 rounded-full uppercase tracking-wider">Draft</span>
//                     )}
//                   </div>
//                   <p className="text-sm text-[#A1A1AA] font-sans leading-relaxed">{a.body}</p>
                  
//                   {/* Metadata Row */}
//                   <div className="flex items-center gap-5 mt-4 border-t border-[#1F1F1F] pt-4">
//                     <div className="flex items-center gap-1.5 text-xs font-mono text-[#71717A]">
//                       <Users className="w-3.5 h-3.5 text-[#E60000]" />
//                       <span className="uppercase tracking-wider">{a.targetAudience.replace('_', ' ')}</span>
//                     </div>
//                     <div className="flex items-center gap-1.5 text-xs font-mono text-[#71717A]">
//                       <Send className="w-3.5 h-3.5 text-[#00E676]" />
//                       <span className="uppercase tracking-wider">{formatCount(a.sentCount)} sent</span>
//                     </div>
//                     {a.scheduledAt && !a.publishedAt && (
//                       <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#FBBF24] bg-[#FBBF24]/10 px-2 py-0.5 rounded uppercase tracking-wider">
//                         <Calendar className="w-3 h-3" />
//                         <span>Scheduled {timeAgo(a.scheduledAt)}</span>
//                       </div>
//                     )}
//                     {a.publishedAt && (
//                       <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider">Sent {timeAgo(a.publishedAt)}</span>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="flex items-center gap-2 shrink-0 bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-1.5 rounded-lg">
//                   <span className="text-[10px] font-mono text-[#71717A] uppercase">By</span>
//                   <span className="text-xs font-medium text-white">{a.createdBy.displayName}</span>
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}

//       {data && (data.pagination as { pages: number }).pages > 1 && (
//         <div className="flex justify-center items-center gap-4 mt-8">
//           <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
//           <span className="px-4 py-2 bg-[#141414] border border-[#1F1F1F] rounded-lg text-xs font-mono text-[#A1A1AA]">Page {page} / {(data.pagination as { pages: number }).pages}</span>
//           <Button variant="outline" size="sm" disabled={page >= (data.pagination as { pages: number }).pages} onClick={() => setPage(p => p + 1)}>Next</Button>
//         </div>
//       )}

//       {showCreate && <CreateAnnouncementModal onClose={() => setShowCreate(false)} />}
//     </div>
//   )
// }

// // ── Create Announcement Modal ─────────────────

// function CreateAnnouncementModal({ onClose }: { onClose: () => void }) {
//   const queryClient = useQueryClient()
//   const [title, setTitle]         = useState('')
//   const [body, setBody]           = useState('')
//   const [type, setType]           = useState<Announcement['type']>('general')
//   const [audience, setAudience]   = useState<Announcement['targetAudience']>('all')
//   const [scheduling, setScheduling] = useState(false)
//   const [scheduledAt, setScheduledAt] = useState('')

//   const createMutation = useMutation({
//     mutationFn: () => announcementsApi.create({
//       title, body, type, targetAudience: audience,
//       scheduledAt: scheduling ? scheduledAt : undefined,
//     }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
//       toast.success(scheduling ? 'Announcement scheduled!' : 'Announcement sent!')
//       onClose()
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   return (
//     <Modal open onClose={onClose} title="New Announcement" size="md">
//       <div className="flex flex-col gap-5">
//         <Input label="Title" placeholder="Sayari mein kuch naya aaya hai..." value={title} onChange={e => setTitle(e.target.value)} />
//         <Textarea label="Message" placeholder="Poori baat yahan likhein..." rows={4} value={body} onChange={e => setBody(e.target.value)} />

//         <div className="grid grid-cols-2 gap-4">
//           <Select
//             label="Type"
//             value={type}
//             onChange={v => setType(v as Announcement['type'])}
//             options={[
//               { value: 'general',     label: 'General',       icon: <Megaphone className="w-4 h-4 text-[#E60000]" /> },
//               { value: 'feature',     label: 'New Feature',   icon: <Sparkles className="w-4 h-4 text-[#00E676]" /> },
//               { value: 'maintenance', label: 'Maintenance',   icon: <Wrench className="w-4 h-4 text-[#FBBF24]" /> },
//               { value: 'celebration', label: 'Celebration',   icon: <PartyPopper className="w-4 h-4 text-[#FF3366]" /> },
//             ]}
//           />
//           <Select
//             label="Audience"
//             value={audience}
//             onChange={v => setAudience(v as Announcement['targetAudience'])}
//             options={[
//               { value: 'all',       label: 'All Users',     icon: <Globe className="w-4 h-4 text-[#3B82F6]" /> },
//               { value: 'creators',  label: 'Creators',      icon: <Palette className="w-4 h-4 text-[#A855F7]" /> },
//               { value: 'new_users', label: 'New Users',     icon: <UserPlus className="w-4 h-4 text-[#F97316]" /> },
//             ]}
//           />
//         </div>

//         {/* Cyberpunk Live Preview Box */}
//         {(title || body) && (
//           <div className="bg-[#050505] rounded-xl p-5 border border-[#1F1F1F] relative overflow-hidden mt-2 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
//             <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E60000]/40 to-transparent" />
//             <p className="text-[10px] font-mono text-[#E60000] mb-3 uppercase tracking-widest flex items-center gap-2">
//               <span className="w-1.5 h-1.5 rounded-full bg-[#E60000] animate-pulse" />
//               Live Preview
//             </p>
//             <p className="text-base font-display font-semibold text-white tracking-wide">{title || 'Title...'}</p>
//             <p className="text-sm text-[#A1A1AA] font-sans mt-1.5">{body || 'Message...'}</p>
//           </div>
//         )}

//         {/* Scheduling Section */}
//         <div className="bg-[#141414] border border-[#1F1F1F] rounded-xl p-4 mt-2">
//           <label className="flex items-center gap-3 text-sm font-medium text-white cursor-pointer select-none">
//             <input 
//               type="checkbox" 
//               checked={scheduling} 
//               onChange={e => setScheduling(e.target.checked)} 
//               className="w-4 h-4 accent-[#E60000] bg-[#0A0A0A] border-[#2A2A2A] rounded cursor-pointer" 
//             />
//             Schedule for later
//           </label>

//           {scheduling && (
//             <div className="mt-4 pt-4 border-t border-[#1F1F1F] animate-slide-up">
//               <input
//                 type="datetime-local"
//                 value={scheduledAt}
//                 onChange={e => setScheduledAt(e.target.value)}
//                 min={new Date().toISOString().slice(0, 16)}
//                 className="w-full h-12 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white px-4 outline-none focus:border-[#E60000] focus:ring-1 focus:ring-[#E60000] focus:shadow-[0_0_15px_rgba(230,0,0,0.1)] transition-all font-sans"
//               />
//             </div>
//           )}
//         </div>

//         {/* Actions */}
//         <div className="flex gap-3 mt-4 pt-4 border-t border-[#1F1F1F]">
//           <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
//           <Button
//             className="flex-1"
//             icon={scheduling ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
//             disabled={!title.trim() || !body.trim() || (scheduling && !scheduledAt)}
//             loading={createMutation.isPending}
//             onClick={() => createMutation.mutate()}
//           >
//             {scheduling ? 'Schedule' : 'Send Now'}
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   )
// }