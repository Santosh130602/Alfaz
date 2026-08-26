// import { useState } from 'react'
// import { useQuery } from '@tanstack/react-query'
// import { ScrollText, Shield } from 'lucide-react'
// import { dashboardApi } from '../../api'
// import { Select, Card, EmptyState, Spinner, Avatar, Button } from '../../components/ui'
// import { timeAgo, cn } from '../../utils'

// const ACTION_COLORS: Record<string, string> = {
//   ban_user          : 'text-red-400',    unban_user        : 'text-green-400',
//   delete_user       : 'text-red-500',    assign_badge      : 'text-yellow-400',
//   delete_post       : 'text-red-400',    feature_post      : 'text-[#6C63FF]',
//   unfeature_post    : 'text-[#888]',     review_report     : 'text-blue-400',
//   create_announcement: 'text-green-400', update_config     : 'text-yellow-400',
//   upload_template   : 'text-[#6C63FF]',  delete_template   : 'text-red-400',
//   upload_asset      : 'text-[#6C63FF]',  delete_asset      : 'text-red-400',
//   edit_user_profile : 'text-blue-400',   flush_cache       : 'text-yellow-400',
// }

// const ACTION_ICONS: Record<string, string> = {
//   ban_user: '🚫', unban_user: '✅', delete_user: '🗑️', assign_badge: '🏅',
//   delete_post: '🗑️', feature_post: '⭐', review_report: '🔍',
//   create_announcement: '📢', update_config: '⚙️',
//   upload_template: '🖼️', upload_asset: '🎨', flush_cache: '🔄',
// }

// export function AuditLogPage() {
//   const [actionType, setActionType] = useState('')
//   const [targetType, setTargetType] = useState('')
//   const [page, setPage]            = useState(1)

//   const { data, isLoading } = useQuery({
//     queryKey: ['admin', 'audit', actionType, targetType, page],
//     queryFn : () => dashboardApi.auditLog({
//       actionType: actionType || undefined,
//       targetType: targetType || undefined,
//       page, limit: 30,
//     }).then(r => r.data.data),
//   })

//   return (
//     <div>
//       <h1 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
//         <ScrollText className="w-5 h-5 text-[#6C63FF]" /> Audit Log
//       </h1>

//       {/* Filters */}
//       <div className="flex gap-3 mb-6">
//         <Select value={actionType} onChange={e => { setActionType(e.target.value); setPage(1) }}
//           options={[
//             { value: '', label: 'All Actions' },
//             { value: 'ban_user', label: 'Ban User' }, { value: 'unban_user', label: 'Unban User' },
//             { value: 'delete_user', label: 'Delete User' }, { value: 'assign_badge', label: 'Assign Badge' },
//             { value: 'delete_post', label: 'Delete Post' }, { value: 'feature_post', label: 'Feature Post' },
//             { value: 'review_report', label: 'Review Report' },
//             { value: 'create_announcement', label: 'Announcement' },
//             { value: 'update_config', label: 'Config Update' },
//           ]} className="w-48" />
//         <Select value={targetType} onChange={e => { setTargetType(e.target.value); setPage(1) }}
//           options={[
//             { value: '', label: 'All Targets' },
//             { value: 'user', label: 'User' }, { value: 'post', label: 'Post' },
//             { value: 'report', label: 'Report' }, { value: 'config', label: 'Config' },
//             { value: 'template', label: 'Template' }, { value: 'asset', label: 'Asset' },
//           ]} className="w-36" />
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//       ) : !data?.actions.length ? (
//         <EmptyState icon="📋" title="No audit entries found" />
//       ) : (
//         <Card className="divide-y divide-[#1E1E1E]">
//           {data.actions.map(action => (
//             <div key={action._id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#0F0F0F] transition-colors">
//               {/* Icon */}
//               <div className="w-9 h-9 bg-[#242424] rounded-full flex items-center justify-center text-base shrink-0">
//                 {ACTION_ICONS[action.actionType] || '🛡️'}
//               </div>

//               {/* Content */}
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2 flex-wrap">
//                   <span className={cn('text-sm font-medium capitalize', ACTION_COLORS[action.actionType] || 'text-white')}>
//                     {action.actionType.replace(/_/g, ' ')}
//                   </span>
//                   <span className="text-[#888] text-sm">on</span>
//                   <span className="text-xs bg-[#242424] text-[#ccc] px-2 py-0.5 rounded-full capitalize">
//                     {action.targetType}
//                   </span>
//                 </div>
//                 {action.reason && (
//                   <p className="text-xs text-[#555] mt-1 line-clamp-2">{action.reason}</p>
//                 )}
//                 <div className="flex items-center gap-3 mt-2">
//                   <div className="flex items-center gap-1.5">
//                     <Avatar user={action.admin} size="xs" />
//                     <span className="text-xs text-[#888]">{action.admin.displayName}</span>
//                     <span className="text-[10px] text-[#555] capitalize">({action.admin.role})</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Time */}
//               <span className="text-xs text-[#555] shrink-0">{timeAgo(action.createdAt)}</span>
//             </div>
//           ))}
//         </Card>
//       )}

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







// import { useState } from 'react'
// import { useQuery } from '@tanstack/react-query'
// import { 
//   ScrollText, Shield, Ban, CheckCircle, Trash2, Award, 
//   Star, Search, Megaphone, Settings, Image as ImageIcon, 
//   Brush, RefreshCw, ShieldAlert 
// } from 'lucide-react'
// import { dashboardApi } from '../../api'
// import { Select, Card, EmptyState, Spinner, Avatar, Button } from '../../components/ui'
// import { timeAgo, cn } from '../../utils'

// // Upgraded to neon tech colors
// const ACTION_COLORS: Record<string, string> = {
//   ban_user          : 'text-[#E60000]',        unban_user        : 'text-[#00E676]',
//   delete_user       : 'text-[#E60000]',        assign_badge      : 'text-[#FBBF24]',
//   delete_post       : 'text-[#E60000]',        feature_post      : 'text-[#FF3366]',
//   unfeature_post    : 'text-[#71717A]',        review_report     : 'text-[#3B82F6]',
//   create_announcement: 'text-[#00E676]',       update_config     : 'text-[#FBBF24]',
//   upload_template   : 'text-[#A855F7]',        delete_template   : 'text-[#E60000]',
//   upload_asset      : 'text-[#A855F7]',        delete_asset      : 'text-[#E60000]',
//   edit_user_profile : 'text-[#3B82F6]',        flush_cache       : 'text-[#FBBF24]',
// }

// // Swapped emojis for Lucide React components
// const ACTION_ICONS: Record<string, React.ElementType> = {
//   ban_user: Ban, unban_user: CheckCircle, delete_user: Trash2, assign_badge: Award,
//   delete_post: Trash2, feature_post: Star, review_report: Search,
//   create_announcement: Megaphone, update_config: Settings,
//   upload_template: ImageIcon, upload_asset: Brush, flush_cache: RefreshCw,
// }

// export function AuditLogPage() {
//   const [actionType, setActionType] = useState('')
//   const [targetType, setTargetType] = useState('')
//   const [page, setPage]            = useState(1)

//   const { data, isLoading } = useQuery({
//     queryKey: ['admin', 'audit', actionType, targetType, page],
//     queryFn : () => dashboardApi.auditLog({
//       actionType: actionType || undefined,
//       targetType: targetType || undefined,
//       page, limit: 30,
//     }).then(r => r.data.data),
//   })

//   return (
//     <div className="animate-slide-up">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//         <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 tracking-tight">
//           <div className="w-10 h-10 bg-[#141414] border border-[#1F1F1F] rounded-xl flex items-center justify-center shadow-inner">
//             <ScrollText className="w-5 h-5 text-[#E60000] drop-shadow-[0_0_8px_rgba(230,0,0,0.5)]" />
//           </div>
//           Audit Log
//         </h1>

//         {/* Filters - Updated onChange to accept direct value string from our new Select component */}
//         <div className="flex gap-4 z-20">
//           <Select 
//             value={actionType} 
//             onChange={v => { setActionType(v); setPage(1) }}
//             options={[
//               { value: '', label: 'All Actions' },
//               { value: 'ban_user', label: 'Ban User' }, { value: 'unban_user', label: 'Unban User' },
//               { value: 'delete_user', label: 'Delete User' }, { value: 'assign_badge', label: 'Assign Badge' },
//               { value: 'delete_post', label: 'Delete Post' }, { value: 'feature_post', label: 'Feature Post' },
//               { value: 'review_report', label: 'Review Report' },
//               { value: 'create_announcement', label: 'Announcement' },
//               { value: 'update_config', label: 'Config Update' },
//             ]} 
//             className="w-48" 
//           />
//           <Select 
//             value={targetType} 
//             onChange={v => { setTargetType(v); setPage(1) }}
//             options={[
//               { value: '', label: 'All Targets' },
//               { value: 'user', label: 'User' }, { value: 'post', label: 'Post' },
//               { value: 'report', label: 'Report' }, { value: 'config', label: 'Config' },
//               { value: 'template', label: 'Template' }, { value: 'asset', label: 'Asset' },
//             ]} 
//             className="w-40" 
//           />
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-20"><Spinner size="lg" /></div>
//       ) : !data?.actions.length ? (
//         <EmptyState 
//           icon={<ShieldAlert className="w-8 h-8" />} 
//           title="No audit entries found" 
//           description="Try adjusting your filters or checking back later."
//         />
//       ) : (
//         <Card className="divide-y divide-[#1F1F1F] overflow-hidden">
//           {data.actions.map(action => {
//             const Icon = ACTION_ICONS[action.actionType] || Shield
//             const colorClass = ACTION_COLORS[action.actionType] || 'text-white'
            
//             return (
//               <div key={action._id} className="flex items-start gap-4 px-6 py-5 hover:bg-[#141414] transition-colors duration-200 group">
//                 {/* Neon Icon Container */}
//                 <div className={cn(
//                   "w-10 h-10 rounded-xl border border-[#1F1F1F] flex items-center justify-center shrink-0 bg-[#0A0A0A] group-hover:border-[#2A2A2A] transition-colors",
//                 )}>
//                   <Icon className={cn("w-5 h-5", colorClass)} />
//                 </div>

//                 {/* Content */}
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2.5 flex-wrap">
//                     <span className={cn('text-xs font-mono font-bold uppercase tracking-wider', colorClass)}>
//                       {action.actionType.replace(/_/g, ' ')}
//                     </span>
//                     <span className="text-[#71717A] text-[10px] font-mono uppercase tracking-widest">on</span>
//                     <span className="text-[10px] font-mono bg-[#141414] border border-[#2A2A2A] text-[#A1A1AA] px-2.5 py-1 rounded-md uppercase tracking-wider">
//                       {action.targetType}
//                     </span>
//                   </div>
                  
//                   {action.reason && (
//                     <p className="text-sm text-[#A1A1AA] mt-2 font-sans line-clamp-2">{action.reason}</p>
//                   )}
                  
//                   <div className="flex items-center gap-3 mt-3">
//                     <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#1F1F1F] px-2 py-1 rounded-lg">
//                       <Avatar user={action.admin} size="xs" />
//                       <span className="text-xs font-medium text-white">{action.admin.displayName}</span>
//                       <span className="text-[10px] text-[#E60000] font-mono uppercase tracking-wider bg-[#E60000]/10 px-1.5 py-0.5 rounded">
//                         {action.admin.role}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Time */}
//                 <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider shrink-0 mt-1 group-hover:text-[#A1A1AA] transition-colors">
//                   {timeAgo(action.createdAt)}
//                 </span>
//               </div>
//             )
//           })}
//         </Card>
//       )}

//       {/* Pagination matches Announcements page styling */}
//       {data && (data.pagination as { pages: number }).pages > 1 && (
//         <div className="flex justify-center items-center gap-4 mt-8">
//           <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
//           <span className="px-4 py-2 bg-[#141414] border border-[#1F1F1F] rounded-lg text-xs font-mono text-[#A1A1AA]">
//             Page {page} / {(data.pagination as { pages: number }).pages}
//           </span>
//           <Button variant="outline" size="sm" disabled={page >= (data.pagination as { pages: number }).pages} onClick={() => setPage(p => p + 1)}>Next</Button>
//         </div>
//       )}
//     </div>
//   )
// }






import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  ScrollText, Shield, Ban, CheckCircle, Trash2, Award, 
  Star, Search, Megaphone, Settings, Image as ImageIcon, 
  Brush, RefreshCw, ShieldAlert 
} from 'lucide-react'
import { dashboardApi } from '../../api'
import { Select, CustomSelect, EmptyState, Spinner, Avatar, Button } from '../../components/ui'
import { timeAgo, cn } from '../../utils'

const ACTION_COLORS: Record<string, string> = {
  ban_user          : 'text-[#E60000]',        unban_user        : 'text-[#00E676]',
  delete_user       : 'text-[#E60000]',        assign_badge      : 'text-[#FBBF24]',
  delete_post       : 'text-[#E60000]',        feature_post      : 'text-[#FF3366]',
  unfeature_post    : 'text-[#71717A]',        review_report     : 'text-[#3B82F6]',
  create_announcement: 'text-[#00E676]',       update_config     : 'text-[#FBBF24]',
  upload_template   : 'text-[#A855F7]',        delete_template   : 'text-[#E60000]',
  upload_asset      : 'text-[#A855F7]',        delete_asset      : 'text-[#E60000]',
  edit_user_profile : 'text-[#3B82F6]',        flush_cache       : 'text-[#FBBF24]',
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  ban_user: Ban, unban_user: CheckCircle, delete_user: Trash2, assign_badge: Award,
  delete_post: Trash2, feature_post: Star, review_report: Search,
  create_announcement: Megaphone, update_config: Settings,
  upload_template: ImageIcon, upload_asset: Brush, flush_cache: RefreshCw,
}

export function AuditLogPage() {
  const [actionType, setActionType] = useState('')
  const [targetType, setTargetType] = useState('')
  const [page, setPage]            = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit', actionType, targetType, page],
    queryFn : () => dashboardApi.auditLog({
      actionType: actionType || undefined,
      targetType: targetType || undefined,
      page, limit: 30,
    }).then(r => r.data.data),
  })

  return (
    <div className="animate-slide-up">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 bg-[#0A0A0A] border border-[#1F1F1F] p-6 rounded-[24px] shadow-lg relative z-20">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 bg-[#141414] border border-[#1F1F1F] rounded-xl flex items-center justify-center shadow-inner">
              <ScrollText className="w-5 h-5 text-[#E60000] drop-shadow-[0_0_8px_rgba(230,0,0,0.5)]" />
            </div>
            Audit Log
          </h1>
          <p className="text-[#71717A] text-sm mt-2 ml-1">Monitor all administrative actions and security events.</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <CustomSelect 
            value={actionType} 
            onChange={v => { setActionType(v); setPage(1) }}
            options={[
              { value: '', label: 'All Actions' },
              { value: 'ban_user', label: 'Ban User' }, { value: 'unban_user', label: 'Unban User' },
              { value: 'delete_user', label: 'Delete User' }, { value: 'assign_badge', label: 'Assign Badge' },
              { value: 'delete_post', label: 'Delete Post' }, { value: 'feature_post', label: 'Feature Post' },
              { value: 'review_report', label: 'Review Report' },
              { value: 'create_announcement', label: 'Announcement' },
              { value: 'update_config', label: 'Config Update' },
            ]} 
            className="w-full md:w-48 bg-[#050505]" 
          />
          <CustomSelect 
            value={targetType} 
            onChange={v => { setTargetType(v); setPage(1) }}
            options={[
              { value: '', label: 'All Targets' },
              { value: 'user', label: 'User' }, { value: 'post', label: 'Post' },
              { value: 'report', label: 'Report' }, { value: 'config', label: 'Config' },
              { value: 'template', label: 'Template' }, { value: 'asset', label: 'Asset' },
            ]} 
            className="w-full md:w-40 bg-[#050505]" 
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !data?.actions.length ? (
        <EmptyState 
          icon={<ShieldAlert className="w-8 h-8" />} 
          title="No audit entries found" 
          description="Try adjusting your filters or checking back later."
        />
      ) : (
        <div className="flex flex-col gap-3 relative z-10">
          {data.actions.map(action => {
            const Icon = ACTION_ICONS[action.actionType] || Shield
            const colorClass = ACTION_COLORS[action.actionType] || 'text-white'
            
            return (
              <div 
                key={action._id} 
                className="group relative bg-[#050505] border border-[#1F1F1F] rounded-[20px] p-5 overflow-hidden transition-all duration-300 hover:border-[#2A2A2A] hover:bg-[#0A0A0A] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
              >
                {/* Cyberpunk left-edge glow on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#E60000] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex items-start gap-5 relative z-10">
                  {/* Glowing Icon Box */}
                  <div className="w-12 h-12 rounded-2xl border border-[#1F1F1F] flex items-center justify-center shrink-0 bg-[#0A0A0A] shadow-inner group-hover:border-[#E60000]/30 transition-colors duration-300">
                    <Icon className={cn("w-5 h-5", colorClass, "drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_12px_rgba(230,0,0,0.4)] transition-all")} />
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={cn('text-sm font-display font-bold uppercase tracking-wider', colorClass)}>
                        {action.actionType.replace(/_/g, ' ')}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F1F1F]" />
                      <span className="text-[11px] font-mono bg-[#141414] border border-[#2A2A2A] text-[#A1A1AA] px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {action.targetType}
                      </span>
                      <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider ml-auto bg-[#141414] px-2.5 py-1 rounded-md border border-[#1F1F1F]">
                        {timeAgo(action.createdAt)}
                      </span>
                    </div>
                    
                    {action.reason && (
                      <p className="text-sm text-[#A1A1AA] mt-2.5 font-sans line-clamp-2 border-l-2 border-[#1F1F1F] pl-3">
                        {action.reason}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#1F1F1F]/50">
                      <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest">Authorized By:</span>
                      <div className="flex items-center gap-2">
                        <Avatar user={action.admin} size="xs" />
                        <span className="text-xs font-medium text-white">{action.admin.displayName}</span>
                        <span className="text-[9px] text-[#E60000] font-mono uppercase tracking-widest bg-[#E60000]/10 border border-[#E60000]/20 px-1.5 py-0.5 rounded">
                          {action.admin.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {data && (data.pagination as { pages: number }).pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="px-4 py-2 bg-[#050505] border border-[#1F1F1F] rounded-lg text-xs font-mono text-[#A1A1AA]">
            Page {page} / {(data.pagination as { pages: number }).pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= (data.pagination as { pages: number }).pages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}