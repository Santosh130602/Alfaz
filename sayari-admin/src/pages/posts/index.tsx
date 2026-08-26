// import { useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { Search, Trash2, Star, StarOff, Eye, ExternalLink } from 'lucide-react'
// import { Link } from 'react-router-dom'
// import { postsApi } from '../../api'
// import { Input, Select, Button, Modal, Card, EmptyState, Spinner } from '../../components/ui'
// import { cn, formatCount, timeAgo, getErrorMessage, POST_TYPE_LABELS } from '../../utils'
// import type { Post } from '../../types'
// import toast from 'react-hot-toast'

// export function ContentManagementPage() {
//   const [search, setSearch]     = useState('')
//   const [type, setType]         = useState('')
//   const [status, setStatus]     = useState('')
//   const [visibility, setViz]    = useState('')
//   const [sort, setSort]         = useState('newest')
//   const [isReported, setIsReported] = useState(false)
//   const [page, setPage]         = useState(1)
//   const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)
//   const queryClient = useQueryClient()

//   const { data, isLoading } = useQuery({
//     queryKey: ['admin', 'posts', search, type, status, visibility, sort, isReported, page],
//     queryFn : () => postsApi.list({
//       search    : search     || undefined,
//       type      : type       || undefined,
//       status    : status     || undefined,
//       visibility: visibility || undefined,
//       sort      : sort as never,
//       isReported: isReported || undefined,
//       page,
//       limit: 20,
//     }).then(r => r.data.data),
//   })

//   const featureMutation = useMutation({
//     mutationFn: ({ id, featured }: { id: string; featured: boolean }) => postsApi.feature(id, featured),
//     onSuccess : () => {
//       queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
//       toast.success('Updated')
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   const deleteMutation = useMutation({
//     mutationFn: ({ id, reason }: { id: string; reason: string }) => postsApi.delete(id, reason),
//     onSuccess : () => {
//       queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
//       setDeleteTarget(null)
//       toast.success('Post deleted')
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   return (
//     <div>
//       <h1 className="text-xl font-bold text-white mb-6">Content Management</h1>

//       {/* Filters */}
//       <div className="flex gap-3 mb-4 flex-wrap">
//         <div className="flex-1 min-w-[180px]">
//           <Input placeholder="Search posts..." icon={<Search className="w-4 h-4" />}
//             value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
//         </div>
//         <Select value={type} onChange={e => { setType(e.target.value); setPage(1) }}
//           options={[
//             { value: '', label: 'All Types' }, { value: 'sayari', label: 'Sayari' },
//             { value: 'kavita', label: 'Kavita' }, { value: 'audio', label: 'Audio' },
//             { value: 'story_chapter', label: 'Story' }, { value: 'ghazal', label: 'Ghazal' },
//           ]} className="w-36" />
//         <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
//           options={[
//             { value: '', label: 'All Status' }, { value: 'published', label: 'Published' },
//             { value: 'draft', label: 'Draft' }, { value: 'scheduled', label: 'Scheduled' },
//           ]} className="w-36" />
//         <Select value={visibility} onChange={e => { setViz(e.target.value); setPage(1) }}
//           options={[
//             { value: '', label: 'All Visibility' }, { value: 'public', label: 'Public' },
//             { value: 'private', label: 'Private' }, { value: 'followers_only', label: 'Followers' },
//           ]} className="w-40" />
//         <Select value={sort} onChange={e => setSort(e.target.value)}
//           options={[
//             { value: 'newest', label: 'Newest' }, { value: 'popular', label: 'Popular' },
//             { value: 'reported', label: 'Most Reported' },
//           ]} className="w-40" />
//         <label className="flex items-center gap-2 text-sm text-[#888] cursor-pointer whitespace-nowrap">
//           <input type="checkbox" checked={isReported} onChange={e => setIsReported(e.target.checked)} className="accent-[#6C63FF]" />
//           Reported only
//         </label>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//       ) : !data?.posts.length ? (
//         <EmptyState icon="📝" title="No posts found" />
//       ) : (
//         <Card className="overflow-hidden">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-[#2E2E2E] text-left">
//                 <th className="px-4 py-3 text-[#888] font-medium">Post</th>
//                 <th className="px-4 py-3 text-[#888] font-medium">Author</th>
//                 <th className="px-4 py-3 text-[#888] font-medium">Type</th>
//                 <th className="px-4 py-3 text-[#888] font-medium">Status</th>
//                 <th className="px-4 py-3 text-[#888] font-medium">Views</th>
//                 <th className="px-4 py-3 text-[#888] font-medium">Date</th>
//                 <th className="px-4 py-3 text-[#888] font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.posts.map(post => (
//                 <PostRow
//                   key={post._id}
//                   post={post}
//                   onDelete={() => setDeleteTarget(post)}
//                   onFeature={(featured) => featureMutation.mutate({ id: post._id, featured })}
//                 />
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

//       {/* Delete modal */}
//       {deleteTarget && (
//         <DeletePostModal
//           post={deleteTarget}
//           onClose={() => setDeleteTarget(null)}
//           onConfirm={(reason) => deleteMutation.mutate({ id: deleteTarget._id, reason })}
//           loading={deleteMutation.isPending}
//         />
//       )}
//     </div>
//   )
// }

// function PostRow({ post, onDelete, onFeature }: {
//   post: Post
//   onDelete: () => void
//   onFeature: (featured: boolean) => void
// }) {
//   const statusColors: Record<string, string> = {
//     published: 'text-green-400', draft: 'text-[#888]',
//     scheduled: 'text-yellow-400', archived: 'text-[#555]',
//   }

//   return (
//     <tr className="border-b border-[#1E1E1E] hover:bg-[#1A1A1A] transition-colors">
//       <td className="px-4 py-3">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#242424] shrink-0">
//             {post.renderedImage?.thumbnail
//               ? <img src={post.renderedImage.thumbnail} alt="" className="w-full h-full object-cover" />
//               : <div className="w-full h-full flex items-center justify-center text-base">
//                   {post.type === 'audio' ? '🎙️' : '📝'}
//                 </div>
//             }
//           </div>
//           <div className="max-w-[200px]">
//             <p className="text-white text-xs font-medium truncate">{post.title || 'Untitled'}</p>
//             <p className="text-[#555] text-[10px] truncate">{post._id}</p>
//           </div>
//         </div>
//       </td>
//       <td className="px-4 py-3">
//         <p className="text-[#ccc] text-xs">{typeof post.author === 'object' ? post.author.displayName : ''}</p>
//         <p className="text-[#555] text-[10px]">@{typeof post.author === 'object' ? post.author.username : ''}</p>
//       </td>
//       <td className="px-4 py-3">
//         <span className="text-xs text-[#888] bg-[#242424] px-2 py-0.5 rounded-full">
//           {POST_TYPE_LABELS[post.type] || post.type}
//         </span>
//       </td>
//       <td className="px-4 py-3">
//         <span className={cn('text-xs capitalize', statusColors[post.status])}>{post.status}</span>
//       </td>
//       <td className="px-4 py-3 text-[#888] text-xs">{formatCount(post.stats.viewCount)}</td>
//       <td className="px-4 py-3 text-[#555] text-xs">{timeAgo(post.publishedAt || post.createdAt)}</td>
//       <td className="px-4 py-3">
//         <div className="flex items-center gap-1">
//           <a href={`${(import.meta as any).env?.VITE_USER_APP_URL || 'http://localhost:3000'}/post/${post._id}`}
//             target="_blank" rel="noopener noreferrer"
//             className="p-1.5 text-[#888] hover:text-white transition-colors">
//             <ExternalLink className="w-3.5 h-3.5" />
//           </a>
//           <button
//             onClick={() => onFeature(!post.isFeatured)}
//             className={cn('p-1.5 transition-colors', post.isFeatured ? 'text-yellow-400 hover:text-yellow-600' : 'text-[#888] hover:text-yellow-400')}
//           >
//             {post.isFeatured ? <Star className="w-3.5 h-3.5" fill="currentColor" /> : <Star className="w-3.5 h-3.5" />}
//           </button>
//           <button onClick={onDelete} className="p-1.5 text-[#888] hover:text-red-400 transition-colors">
//             <Trash2 className="w-3.5 h-3.5" />
//           </button>
//         </div>
//       </td>
//     </tr>
//   )
// }

// function DeletePostModal({ post, onClose, onConfirm, loading }: {
//   post: Post; onClose: () => void; onConfirm: (reason: string) => void; loading: boolean
// }) {
//   const [reason, setReason] = useState('')
//   return (
//     <Modal open onClose={onClose} title="Delete Post" size="sm">
//       <div className="p-6 flex flex-col gap-4">
//         <p className="text-sm text-[#888]">
//           Deleting: <span className="text-white font-medium">"{post.title || 'Untitled'}"</span>
//         </p>
//         <Input label="Reason (required)" placeholder="Why is this post being deleted?"
//           value={reason} onChange={e => setReason(e.target.value)} />
//         <div className="flex gap-3 mt-2">
//           <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
//           <Button variant="danger" className="flex-1" disabled={!reason.trim()} loading={loading}
//             onClick={() => onConfirm(reason)}>
//             Delete Post
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   )
// }








import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2, Star, Eye, ExternalLink, FileText, Mic, FileSearch, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { postsApi } from '../../api'
import { Input, CustomSelect, Button, Modal, Card, EmptyState, Spinner } from '../../components/ui'
import { cn, formatCount, timeAgo, getErrorMessage, POST_TYPE_LABELS } from '../../utils'
import type { Post } from '../../types'
import toast from 'react-hot-toast'

export function ContentManagementPage() {
  const [search, setSearch]     = useState('')
  const [type, setType]         = useState('')
  const [status, setStatus]     = useState('')
  const [visibility, setViz]    = useState('')
  const [sort, setSort]         = useState('newest')
  const [isReported, setIsReported] = useState(false)
  const [page, setPage]         = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'posts', search, type, status, visibility, sort, isReported, page],
    queryFn : () => postsApi.list({
      search    : search     || undefined,
      type      : type       || undefined,
      status    : status     || undefined,
      visibility: visibility || undefined,
      sort      : sort as never,
      isReported: isReported || undefined,
      page,
      limit: 20,
    }).then(r => r.data.data),
  })

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => postsApi.feature(id, featured),
    onSuccess : () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      toast.success('Updated')
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => postsApi.delete(id, reason),
    onSuccess : () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      setDeleteTarget(null)
      toast.success('Post deleted')
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 bg-[#141414] border border-[#1F1F1F] rounded-xl flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5 text-[#E60000] drop-shadow-[0_0_8px_rgba(230,0,0,0.5)]" />
            </div>
            Content Management
          </h1>
          <p className="text-[#71717A] text-sm mt-2 ml-1">Moderate and manage user-generated posts across the platform.</p>
        </div>
      </div>

      {/* Filters - Bento Box Style */}
      <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-[20px] shadow-lg mb-6 flex gap-4 flex-wrap items-center relative z-20">
        <div className="flex items-center gap-2 px-2 border-r border-[#1F1F1F] mr-2">
          <Filter className="w-4 h-4 text-[#71717A]" />
          <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest">Filters</span>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <Input 
            placeholder="Search posts by title, ID..." 
            icon={<Search className="w-4 h-4 text-[#71717A]" />}
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1) }} 
            className="bg-[#050505]"
          />
        </div>
        
        <CustomSelect 
          value={type} 
          onChange={v => { setType(v); setPage(1) }}
          options={[
            { value: '', label: 'All Types' }, 
            { value: 'sayari', label: 'Sayari' },
            { value: 'kavita', label: 'Kavita' }, 
            { value: 'audio', label: 'Audio' },
            { value: 'story_chapter', label: 'Story' }, 
            { value: 'ghazal', label: 'Ghazal' },
          ]} 
          className="w-full md:w-36 bg-[#050505]" 
        />
        
        <CustomSelect 
          value={status} 
          onChange={v => { setStatus(v); setPage(1) }}
          options={[
            { value: '', label: 'All Status' }, 
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' }, 
            { value: 'scheduled', label: 'Scheduled' },
          ]} 
          className="w-full md:w-36 bg-[#050505]" 
        />
        
        <CustomSelect 
          value={visibility} 
          onChange={v => { setViz(v); setPage(1) }}
          options={[
            { value: '', label: 'All Visibility' }, 
            { value: 'public', label: 'Public' },
            { value: 'private', label: 'Private' }, 
            { value: 'followers_only', label: 'Followers' },
          ]} 
          className="w-full md:w-40 bg-[#050505]" 
        />
        
        <CustomSelect 
          value={sort} 
          onChange={v => setSort(v)}
          options={[
            { value: 'newest', label: 'Newest First' }, 
            { value: 'popular', label: 'Most Popular' },
            { value: 'reported', label: 'Most Reported' },
          ]} 
          className="w-full md:w-40 bg-[#050505]" 
        />
        
        <label className="flex items-center gap-2 text-sm font-sans text-[#A1A1AA] hover:text-white cursor-pointer whitespace-nowrap ml-2 transition-colors select-none">
          <input 
            type="checkbox" 
            checked={isReported} 
            onChange={e => setIsReported(e.target.checked)} 
            className="w-4 h-4 accent-[#E60000] bg-[#0A0A0A] border-[#2A2A2A] rounded cursor-pointer" 
          />
          <span className={cn("transition-colors", isReported && "text-[#E60000] font-medium")}>Reported Only</span>
        </label>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !data?.posts.length ? (
        <EmptyState 
          icon={<FileSearch className="w-8 h-8" />} 
          title="No posts found" 
          description="Try adjusting your search or filter parameters."
        />
      ) : (
        <Card className="overflow-hidden border-[#1F1F1F] shadow-lg relative z-10">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#050505] border-b border-[#1F1F1F]">
                  <th className="px-5 py-4 text-[10px] font-mono text-[#71717A] uppercase tracking-widest font-medium">Post Details</th>
                  <th className="px-5 py-4 text-[10px] font-mono text-[#71717A] uppercase tracking-widest font-medium">Author</th>
                  <th className="px-5 py-4 text-[10px] font-mono text-[#71717A] uppercase tracking-widest font-medium">Type</th>
                  <th className="px-5 py-4 text-[10px] font-mono text-[#71717A] uppercase tracking-widest font-medium">Status</th>
                  <th className="px-5 py-4 text-[10px] font-mono text-[#71717A] uppercase tracking-widest font-medium">Performance</th>
                  <th className="px-5 py-4 text-[10px] font-mono text-[#71717A] uppercase tracking-widest font-medium">Date</th>
                  <th className="px-5 py-4 text-[10px] font-mono text-[#71717A] uppercase tracking-widest font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {data.posts.map(post => (
                  <PostRow
                    key={post._id}
                    post={post}
                    onDelete={() => setDeleteTarget(post)}
                    onFeature={(featured) => featureMutation.mutate({ id: post._id, featured })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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

      {/* Delete modal */}
      {deleteTarget && (
        <DeletePostModal
          post={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={(reason) => deleteMutation.mutate({ id: deleteTarget._id, reason })}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

// ── Post Row Component ──────────────────────────

function PostRow({ post, onDelete, onFeature }: {
  post: Post
  onDelete: () => void
  onFeature: (featured: boolean) => void
}) {
  // Upgraded to neon tech colors
  const statusColors: Record<string, string> = {
    published: 'text-[#00E676] bg-[#00E676]/10 border-[#00E676]/20', 
    draft:     'text-[#A1A1AA] bg-[#1F1F1F] border-[#2A2A2A]',
    scheduled: 'text-[#FBBF24] bg-[#FBBF24]/10 border-[#FBBF24]/20', 
    archived:  'text-[#71717A] bg-[#0A0A0A] border-[#1F1F1F]',
  }

  return (
    <tr className="hover:bg-[#141414] transition-colors duration-200 group">
      <td className="px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#1F1F1F] shrink-0 group-hover:border-[#2A2A2A] transition-colors flex items-center justify-center">
            {post.renderedImage?.thumbnail ? (
              <img src={post.renderedImage.thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              // Replaced emojis with Lucide Icons
              post.type === 'audio' 
                ? <Mic className="w-5 h-5 text-[#71717A]" /> 
                : <FileText className="w-5 h-5 text-[#71717A]" />
            )}
          </div>
          <div className="max-w-[220px]">
            <p className="text-white text-sm font-display font-medium truncate">{post.title || 'Untitled Document'}</p>
            <p className="text-[#71717A] text-[10px] font-mono tracking-widest truncate mt-1">ID: {post._id}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-white text-sm font-medium truncate max-w-[150px]">{typeof post.author === 'object' ? post.author.displayName : 'Unknown'}</p>
        <p className="text-[#71717A] font-mono text-[10px] truncate max-w-[150px] mt-0.5">@{typeof post.author === 'object' ? post.author.username : 'unknown'}</p>
      </td>
      <td className="px-5 py-4">
        <span className="text-[10px] font-mono text-[#A1A1AA] bg-[#0A0A0A] border border-[#1F1F1F] px-2.5 py-1 rounded-md uppercase tracking-wider">
          {POST_TYPE_LABELS[post.type] || post.type}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className={cn('text-[10px] font-mono px-2.5 py-1 rounded-md uppercase tracking-wider border', statusColors[post.status] || statusColors.draft)}>
          {post.status}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#A1A1AA]">
          <Eye className="w-3.5 h-3.5 text-[#3B82F6]" />
          {formatCount(post.stats.viewCount)}
        </div>
      </td>
      <td className="px-5 py-4 text-[#71717A] text-[11px] font-mono uppercase tracking-wider">
        {timeAgo(post.publishedAt || post.createdAt)}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <a href={`${(import.meta as any).env?.VITE_USER_APP_URL || 'http://localhost:3000'}/post/${post._id}`}
            target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#71717A] hover:text-white hover:bg-[#1F1F1F] transition-all"
            title="View Live"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => onFeature(!post.isFeatured)}
            className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-all', 
              post.isFeatured 
                ? 'text-[#FBBF24] bg-[#FBBF24]/10 hover:bg-[#FBBF24]/20' 
                : 'text-[#71717A] hover:text-[#FBBF24] hover:bg-[#1F1F1F]'
            )}
            title={post.isFeatured ? "Unfeature" : "Feature"}
          >
            {post.isFeatured ? <Star className="w-4 h-4 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" fill="currentColor" /> : <Star className="w-4 h-4" />}
          </button>
          <button 
            onClick={onDelete} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#71717A] hover:text-[#E60000] hover:bg-[#E60000]/10 transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Delete Post Modal ──────────────────────────

function DeletePostModal({ post, onClose, onConfirm, loading }: {
  post: Post; onClose: () => void; onConfirm: (reason: string) => void; loading: boolean
}) {
  const [reason, setReason] = useState('')
  
  return (
    <Modal open onClose={onClose} title="Delete Content" size="sm">
      <div className="flex flex-col gap-6">
        <div className="bg-[#E60000]/10 border border-[#E60000]/20 rounded-xl p-4 flex gap-3">
          <Trash2 className="w-5 h-5 text-[#E60000] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-sans text-white">You are about to delete:</p>
            <p className="text-base font-display font-bold text-[#E60000] mt-1 break-words">"{post.title || 'Untitled Document'}"</p>
            <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest mt-2">This action is irreversible.</p>
          </div>
        </div>
        
        <Input 
          label="Deletion Reason (Required)" 
          placeholder="e.g. Violation of community guidelines..."
          value={reason} 
          onChange={e => setReason(e.target.value)} 
          autoFocus
        />
        
        <div className="flex gap-3 pt-4 border-t border-[#1F1F1F]">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button 
            variant="danger" 
            className="flex-1" 
            disabled={!reason.trim()} 
            loading={loading}
            onClick={() => onConfirm(reason)}
          >
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}