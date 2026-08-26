// import { useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { Flag, CheckCircle, XCircle, ExternalLink, Eye } from 'lucide-react'
// import { reportsApi } from '../../api'
// import { Button, Select, Modal, Input, Card, EmptyState, Spinner, Avatar } from '../../components/ui'
// import { cn, timeAgo, getErrorMessage } from '../../utils'
// import type { Report } from '../../types'
// import toast from 'react-hot-toast'

// export function ReportsPage() {
//   const [status, setStatus]       = useState('pending')
//   const [targetType, setTargetType] = useState('')
//   const [page, setPage]           = useState(1)
//   const [reviewing, setReviewing] = useState<Report | null>(null)
//   const queryClient               = useQueryClient()

//   const { data, isLoading } = useQuery({
//     queryKey: ['admin', 'reports', status, targetType, page],
//     queryFn : () => reportsApi.list({
//       status    : status     || undefined,
//       targetType: targetType || undefined,
//       page, limit: 20,
//     }).then(r => r.data.data),
//   })

//   const reviewMutation = useMutation({
//     mutationFn: ({ id, action, note }: { id: string; action: 'dismiss' | 'action_taken'; note?: string }) =>
//       reportsApi.review(id, action, note),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
//       setReviewing(null)
//       toast.success('Report reviewed')
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   const statusColors: Record<string, string> = {
//     pending     : 'bg-yellow-500/20 text-yellow-400',
//     reviewed    : 'bg-blue-500/20 text-blue-400',
//     action_taken: 'bg-green-500/20 text-green-400',
//     dismissed   : 'bg-[#242424] text-[#888]',
//   }

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-xl font-bold text-white flex items-center gap-2">
//           <Flag className="w-5 h-5 text-[#FF6584]" /> Reports Queue
//         </h1>
//         {data && (
//           <span className="text-sm text-[#888]">
//             {(data.pagination as { total: number }).total} reports
//           </span>
//         )}
//       </div>

//       {/* Filters */}
//       <div className="flex gap-3 mb-6">
//         <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
//           options={[
//             { value: 'pending',      label: '⏳ Pending'      },
//             { value: 'reviewed',     label: '👁 Reviewed'     },
//             { value: 'action_taken', label: '✅ Action Taken' },
//             { value: 'dismissed',    label: '❌ Dismissed'    },
//             { value: '',             label: 'All Status'       },
//           ]} className="w-44" />
//         <Select value={targetType} onChange={e => { setTargetType(e.target.value); setPage(1) }}
//           options={[
//             { value: '',        label: 'All Types' },
//             { value: 'post',    label: '📝 Post'   },
//             { value: 'comment', label: '💬 Comment'},
//             { value: 'user',    label: '👤 User'   },
//             { value: 'series',  label: '📚 Series' },
//           ]} className="w-36" />
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//       ) : !data?.reports.length ? (
//         <EmptyState icon="🎉" title="No reports found" description="All clear!" />
//       ) : (
//         <div className="flex flex-col gap-3">
//           {data.reports.map(report => (
//             <Card key={report._id} className="p-4 hover:border-[#3E3E3E] transition-colors">
//               <div className="flex items-start justify-between gap-4">
//                 <div className="flex items-start gap-3 flex-1 min-w-0">
//                   <Avatar user={report.reporter} size="sm" />
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <span className="text-sm font-medium text-white">{report.reporter.displayName}</span>
//                       <span className="text-xs text-[#888]">reported a</span>
//                       <span className="text-xs bg-[#242424] text-[#ccc] px-2 py-0.5 rounded-full capitalize">{report.targetType}</span>
//                       <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', statusColors[report.status])}>
//                         {report.status.replace('_', ' ')}
//                       </span>
//                     </div>
//                     <p className="text-sm text-[#888] mt-1">
//                       <span className="font-medium text-[#ccc]">Reason:</span> {report.reason}
//                     </p>
//                     {report.description && (
//                       <p className="text-xs text-[#555] mt-1 line-clamp-2">{report.description}</p>
//                     )}
//                     <div className="flex items-center gap-3 mt-2">
//                       <span className="text-xs text-[#555]">{timeAgo(report.createdAt)}</span>
//                       {report.reviewedBy && (
//                         <span className="text-xs text-[#555]">
//                           Reviewed by {report.reviewedBy.displayName} {report.reviewedAt ? timeAgo(report.reviewedAt) : ''}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 {report.status === 'pending' && (
//                   <div className="flex gap-2 shrink-0">
//                     <Button size="sm" variant="outline" icon={<Eye className="w-4 h-4" />}
//                       onClick={() => setReviewing(report)}>
//                       Review
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}

//       {/* Pagination */}
//       {data && (data.pagination as { pages: number }).pages > 1 && (
//         <div className="flex justify-center gap-2 mt-6">
//           <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
//           <span className="px-3 py-1.5 text-sm text-[#888]">Page {page}</span>
//           <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Next</Button>
//         </div>
//       )}

//       {/* Review modal */}
//       {reviewing && (
//         <ReviewModal
//           report={reviewing}
//           onClose={() => setReviewing(null)}
//           onAction={(action, note) => reviewMutation.mutate({ id: reviewing._id, action, note })}
//           loading={reviewMutation.isPending}
//         />
//       )}
//     </div>
//   )
// }

// function ReviewModal({ report, onClose, onAction, loading }: {
//   report: Report
//   onClose: () => void
//   onAction: (action: 'dismiss' | 'action_taken', note?: string) => void
//   loading: boolean
// }) {
//   const [note, setNote] = useState('')
//   const userAppUrl = (import.meta as any).env?.VITE_USER_APP_URL || 'http://localhost:3000'

//   return (
//     <Modal open onClose={onClose} title="Review Report" size="md">
//       <div className="p-6 flex flex-col gap-4">
//         {/* Report details */}
//         <div className="bg-[#0F0F0F] rounded-2xl p-4 flex flex-col gap-2">
//           <div className="flex items-center gap-2">
//             <Avatar user={report.reporter} size="xs" />
//             <span className="text-sm text-white">{report.reporter.displayName}</span>
//             <span className="text-xs text-[#888]">@{report.reporter.username}</span>
//           </div>
//           <p className="text-sm text-[#ccc]">
//             <span className="text-[#888]">Reported</span> {report.targetType}
//           </p>
//           <p className="text-sm text-white">
//             <span className="text-[#888]">Reason:</span> {report.reason}
//           </p>
//           {report.description && (
//             <p className="text-sm text-[#888]">{report.description}</p>
//           )}
//           <a
//             href={`${userAppUrl}/${report.targetType === 'post' ? 'post' : report.targetType === 'user' ? 'users' : report.targetType}/${report.target}`}
//             target="_blank" rel="noopener noreferrer"
//             className="flex items-center gap-1 text-xs text-[#6C63FF] hover:underline mt-1"
//           >
//             <ExternalLink className="w-3 h-3" /> View reported {report.targetType}
//           </a>
//         </div>

//         <Input
//           label="Admin note (optional)"
//           placeholder="Add a note about this review..."
//           value={note}
//           onChange={e => setNote(e.target.value)}
//         />

//         <div className="flex gap-3 mt-2">
//           <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
//           <Button
//             variant="ghost"
//             className="flex-1 text-[#888] hover:text-white border border-[#2E2E2E]"
//             icon={<XCircle className="w-4 h-4" />}
//             loading={loading}
//             onClick={() => onAction('dismiss', note)}
//           >
//             Dismiss
//           </Button>
//           <Button
//             variant="danger"
//             className="flex-1"
//             icon={<CheckCircle className="w-4 h-4" />}
//             loading={loading}
//             onClick={() => onAction('action_taken', note)}
//           >
//             Take Action
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   )
// }
















import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Flag, CheckCircle, XCircle, ExternalLink, Eye, 
  Clock, ShieldCheck, FileText, MessageSquare, User, BookOpen, Filter 
} from 'lucide-react'
import { reportsApi } from '../../api'
import { Button, CustomSelect, Modal, Input, Card, EmptyState, Spinner, Avatar } from '../../components/ui'
import { cn, timeAgo, getErrorMessage } from '../../utils'
import type { Report, CustomSelectProps } from '../../types'
import toast from 'react-hot-toast'

export function ReportsPage() {
  const [status, setStatus]       = useState('pending')
  const [targetType, setTargetType] = useState('')
  const [page, setPage]           = useState(1)
  const [reviewing, setReviewing] = useState<Report | null>(null)
  const queryClient               = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reports', status, targetType, page],
    queryFn : () => reportsApi.list({
      status    : status     || undefined,
      targetType: targetType || undefined,
      page, limit: 20,
    }).then(r => r.data.data),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: 'dismiss' | 'action_taken'; note?: string }) =>
      reportsApi.review(id, action, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
      setReviewing(null)
      toast.success('Report reviewed')
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  // Upgraded to neon tech colors with border glows
  const statusColors: Record<string, string> = {
    pending     : 'bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20',
    reviewed    : 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20',
    action_taken: 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20',
    dismissed   : 'bg-[#141414] text-[#71717A] border border-[#2A2A2A]',
  }

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 bg-[#141414] border border-[#1F1F1F] rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF3366]/50 to-transparent" />
              <Flag className="w-5 h-5 text-[#FF3366] drop-shadow-[0_0_8px_rgba(255,51,102,0.5)]" />
            </div>
            Reports Queue
          </h1>
          <p className="text-[#71717A] text-sm mt-2 ml-1">Review user-submitted reports and enforce community guidelines.</p>
        </div>
        {data && (
          <div className="bg-[#0A0A0A] border border-[#1F1F1F] px-4 py-2 rounded-lg flex flex-col items-end">
            <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest">Total Reports</span>
            <span className="text-lg font-display font-bold text-white leading-none mt-1">
              {(data.pagination as { total: number }).total}
            </span>
          </div>
        )}
      </div>

      {/* Filters - Bento Box Style */}
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-[20px] shadow-lg mb-6 flex gap-4 flex-wrap items-center relative z-20">
        <div className="flex items-center gap-2 px-2 border-r border-[#1F1F1F] mr-2">
          <Filter className="w-4 h-4 text-[#71717A]" />
          <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest">Filters</span>
        </div>
        <CustomSelect 
          value={status} 
          onChange={v => { setStatus(v); setPage(1) }}
          options={[
            { value: 'pending',      label: 'Pending',      icon: <Clock className="w-4 h-4 text-[#FBBF24]" /> },
            { value: 'reviewed',     label: 'Reviewed',     icon: <Eye className="w-4 h-4 text-[#3B82F6]" /> },
            { value: 'action_taken', label: 'Action Taken', icon: <CheckCircle className="w-4 h-4 text-[#00E676]" /> },
            { value: 'dismissed',    label: 'Dismissed',    icon: <XCircle className="w-4 h-4 text-[#71717A]" /> },
            { value: '',             label: 'All Status',   icon: <Filter className="w-4 h-4 text-white" /> },
          ]} 
          className="w-full md:w-48 bg-[#050505]" 
        />
        <CustomSelect 
          value={targetType} 
          onChange={v => { setTargetType(v); setPage(1) }}
          options={[
            { value: '',        label: 'All Types', icon: <Filter className="w-4 h-4 text-white" /> },
            { value: 'post',    label: 'Post',      icon: <FileText className="w-4 h-4 text-[#FF3366]" /> },
            { value: 'comment', label: 'Comment',   icon: <MessageSquare className="w-4 h-4 text-[#3B82F6]" /> },
            { value: 'user',    label: 'User',      icon: <User className="w-4 h-4 text-[#00E676]" /> },
            { value: 'series',  label: 'Series',    icon: <BookOpen className="w-4 h-4 text-[#FBBF24]" /> },
          ]} 
          className="w-full md:w-40 bg-[#050505]" 
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !data?.reports.length ? (
        <EmptyState 
          icon={<ShieldCheck className="w-8 h-8 text-[#00E676]" />} 
          title="Queue is empty" 
          description="There are no reports matching your current filters. Great job!" 
        />
      ) : (
        <div className="flex flex-col gap-4 relative z-10">
          {data.reports.map(report => (
            <Card key={report._id} className="p-6 bg-[#050505] border-[#1F1F1F] hover:border-[#2A2A2A] transition-all duration-300 group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="shrink-0 mt-1">
                    <Avatar user={report.reporter} size="sm" className="ring-2 ring-[#1F1F1F] group-hover:ring-[#2A2A2A] transition-all" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-display font-semibold text-white tracking-wide">{report.reporter.displayName}</span>
                      <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest">Reported A</span>
                      <span className="text-[10px] font-mono bg-[#141414] border border-[#2A2A2A] text-[#A1A1AA] px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {report.targetType}
                      </span>
                      <span className={cn('text-[10px] font-mono px-2.5 py-1 rounded-md uppercase tracking-wider', statusColors[report.status])}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="mt-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-4">
                      <p className="text-sm text-white font-sans">
                        <span className="font-mono text-[10px] text-[#FF3366] uppercase tracking-widest mr-2 border border-[#FF3366]/20 bg-[#FF3366]/10 px-1.5 py-0.5 rounded">Reason</span> 
                        {report.reason}
                      </p>
                      {report.description && (
                        <p className="text-sm text-[#A1A1AA] mt-2 border-l-2 border-[#2A2A2A] pl-3 font-sans line-clamp-3">
                          {report.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {timeAgo(report.createdAt)}
                      </span>
                      {report.reviewedBy && (
                        <div className="flex items-center gap-1.5 border-l border-[#1F1F1F] pl-4">
                          <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">Reviewed By</span>
                          <span className="text-xs font-medium text-[#A1A1AA]">{report.reviewedBy.displayName}</span>
                          {report.reviewedAt && (
                            <span className="text-[10px] font-mono text-[#71717A] ml-1">({timeAgo(report.reviewedAt)})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {report.status === 'pending' && (
                  <div className="flex shrink-0">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover:border-[#FF3366] hover:text-[#FF3366] hover:bg-[#FF3366]/10"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => setReviewing(report)}
                    >
                      Review Case
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && (data.pagination as { pages: number }).pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="px-4 py-2 bg-[#050505] border border-[#1F1F1F] rounded-lg text-xs font-mono text-[#A1A1AA]">
            Page {page} / {(data.pagination as { pages: number }).pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= (data.pagination as { pages: number }).pages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Review modal */}
      {reviewing && (
        <ReviewModal
          report={reviewing}
          onClose={() => setReviewing(null)}
          onAction={(action, note) => reviewMutation.mutate({ id: reviewing._id, action, note })}
          loading={reviewMutation.isPending}
        />
      )}
    </div>
  )
}

// ── Review Modal ────────────────────────────────────────

function ReviewModal({ report, onClose, onAction, loading }: {
  report: Report
  onClose: () => void
  onAction: (action: 'dismiss' | 'action_taken', note?: string) => void
  loading: boolean
}) {
  const [note, setNote] = useState('')
  const userAppUrl = (import.meta as any).env?.VITE_USER_APP_URL || 'http://localhost:3000'

  return (
    <Modal open onClose={onClose} title="Review Moderation Case" size="md">
      <div className="flex flex-col gap-6">
        {/* Report details box */}
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-[16px] p-5 flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FF3366]" />
          
          <div className="flex items-center gap-3 border-b border-[#1F1F1F] pb-3">
            <Avatar user={report.reporter} size="sm" />
            <div className="flex flex-col">
              <span className="text-sm font-display font-medium text-white">{report.reporter.displayName}</span>
              <span className="text-[10px] font-mono text-[#71717A]">@{report.reporter.username}</span>
            </div>
            <div className="ml-auto flex items-center gap-2 bg-[#0A0A0A] border border-[#2A2A2A] px-2 py-1 rounded text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">
              Target: <span className="text-white">{report.targetType}</span>
            </div>
          </div>
          
          <div className="pt-1">
            <p className="text-sm text-white font-sans flex items-start gap-2">
              <span className="text-[10px] font-mono text-[#FF3366] uppercase tracking-widest mt-0.5 border border-[#FF3366]/20 bg-[#FF3366]/10 px-1.5 py-0.5 rounded shrink-0">Reason</span> 
              {report.reason}
            </p>
            {report.description && (
              <p className="text-sm text-[#A1A1AA] mt-3 font-sans bg-[#0A0A0A] p-3 rounded-lg border border-[#1F1F1F]">
                {report.description}
              </p>
            )}
          </div>
          
          <a
            href={`${userAppUrl}/${report.targetType === 'post' ? 'post' : report.targetType === 'user' ? 'users' : report.targetType}/${report.target}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-xs font-mono font-medium text-[#E60000] bg-[#E60000]/10 border border-[#E60000]/20 hover:bg-[#E60000]/20 py-2.5 rounded-lg transition-colors mt-2 uppercase tracking-wider"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Inspect Reported {report.targetType}
          </a>
        </div>

        <Input
          label="Moderator Note (Optional)"
          placeholder="Document your decision for the audit log..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <div className="flex gap-3 pt-4 border-t border-[#1F1F1F]">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            variant="outline"
            className="flex-1 hover:border-[#71717A] hover:bg-[#141414] hover:text-white"
            icon={<XCircle className="w-4 h-4" />}
            loading={loading}
            onClick={() => onAction('dismiss', note)}
          >
            Dismiss
          </Button>
          <Button
            variant="danger"
            className="flex-1 bg-[#E60000] hover:bg-[#B30000] text-white shadow-[0_4px_14px_rgba(230,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(230,0,0,0.4)]"
            icon={<CheckCircle className="w-4 h-4" />}
            loading={loading}
            onClick={() => onAction('action_taken', note)}
          >
            Take Action
          </Button>
        </div>
      </div>
    </Modal>
  )
}