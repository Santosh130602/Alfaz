// import { useState } from 'react'
// import { useParams, Link, useNavigate } from 'react-router-dom'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { Grid3X3, BookOpen, Music, UserPlus, UserMinus, ExternalLink } from 'lucide-react'
// import { creatorApi, engagementApi } from '../../api'
// import { useAuthStore } from '../../store/auth.store'
// import { Avatar, Button, BadgePill, PageSpinner, Tabs, EmptyState } from '../../components/ui'
// import { PostGrid } from '../../components/post/PostCard'
// import { formatCount, timeAgo, getErrorMessage } from '../../utils'
// import type { Channel, Post, Series } from '../../types'
// import toast from 'react-hot-toast'

// // ─────────────────────────────────────────────
// //  CHANNEL PAGE  /@handle
// // ─────────────────────────────────────────────

// export function ChannelPage() {
//   const { handle }  = useParams<{ handle: string }>()
//   const cleanHandle = handle?.replace('@', '') || ''
//   const { user, isAuthenticated } = useAuthStore()
//   const queryClient = useQueryClient()
//   const navigate    = useNavigate()
//   const [tab, setTab] = useState('posts')

//   const { data, isLoading } = useQuery({
//     queryKey: ['channel', cleanHandle],
//     queryFn : () => creatorApi.getChannelPage(cleanHandle).then(r => r.data.data),
//     enabled : !!cleanHandle,
//   })
//   console.log("Channel Data", data)

//   const [isFollowing, setIsFollowing] = useState(false)

//   // Sync follow state when data loads
//   const channel  = data?.channel
//   const following = data?.isFollowing



//   const followMutation = useMutation({
//     mutationFn: () => engagementApi.toggleFollow(channel?.owner?._id || '').then(r => r.data.data),
//     onSuccess : (res) => {
//       setIsFollowing(res.following)
//       queryClient.invalidateQueries({ queryKey: ['channel', cleanHandle] })
//       toast(res.following ? '✅ Following!' : 'Unfollowed')
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   const handleFollow = () => {
//     if (!isAuthenticated) { navigate('/login'); return }
//     followMutation.mutate()
//   }

//   if (isLoading) return <PageSpinner />
//   if (!channel)  return (
//     <div className="text-center py-20">
//       <p className="text-[#888]">Channel not found</p>
//       <Link to="/"><Button variant="ghost" className="mt-4">Go Home</Button></Link>
//     </div>
//   )

//   const isOwner = user?._id === (typeof channel.owner === 'object' ? channel.owner?._id : channel.owner)
//   const tabs = [
//     { id: 'posts',  label: 'Posts',  icon: <Grid3X3 className="w-4 h-4" /> },
//     { id: 'series', label: 'Series', icon: <BookOpen className="w-4 h-4" /> },
//     { id: 'audio',  label: 'Audio',  icon: <Music className="w-4 h-4" /> },
//   ]

//   return (
//     <div>
//       {/* Banner */}
//       {channel.theme?.bannerImage?.url ? (
//         <div className="h-32 -mx-4 -mt-6 mb-0 overflow-hidden">
//           <img src={channel.theme.bannerImage.url} alt="Banner" className="w-full h-full object-cover" />
//         </div>
//       ) : (
//         <div className="h-24 -mx-4 -mt-6 mb-0 bg-gradient-to-br from-[#6C63FF]/30 to-[#FF6584]/30" />
//       )}

//       {/* Profile section */}
//       <div className="relative px-0 pb-4">
//         {/* Avatar - overlaps banner */}
//         <div className="-mt-10 mb-3">
//           <div className="w-20 h-20 ring-4 ring-[#0F0F0F] rounded-full overflow-hidden">
//             <Avatar src={channel.logo?.url} name={channel.name} size="xl" />
//           </div>
//         </div>

//         <div className="flex items-start justify-between gap-3">
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 flex-wrap">
//               <h1 className="text-xl font-bold text-white">{channel.name}</h1>
//               {channel.isVerified && <span className="text-base">✅</span>}
//               {(typeof channel.owner === 'object' && channel.owner?.badges?.length > 0) &&
//                 channel.owner.badges.slice(0, 2).map(b => <BadgePill key={b.type} type={b.type} />)
//               }
//             </div>
//             <p className="text-[#888] text-sm">@{channel.handle}</p>
//             {channel.tagline && <p className="text-[#ccc] text-sm mt-1">{channel.tagline}</p>}
//           </div>

//           <div className="flex items-center gap-2 shrink-0">
//             {isOwner ? (
//               <Link to="/settings/channel">
//                 <Button variant="outline" size="sm">Edit Channel</Button>
//               </Link>
//             ) : (
//               <Button
//                 variant={following || isFollowing ? 'secondary' : 'primary'}
//                 size="sm"
//                 icon={following || isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
//                 onClick={handleFollow}
//                 loading={followMutation.isPending}
//               >
//                 {following || isFollowing ? 'Following' : 'Follow'}
//               </Button>
//             )}
//           </div>
//         </div>

//         {/* Stats row */}
//         <div className="flex items-center gap-6 mt-4">
//           {[
//             { n: channel.stats.followersCount, l: 'Followers' },
//             { n: channel.stats.postsCount,     l: 'Posts'     },
//             { n: channel.stats.seriesCount,     l: 'Series'   },
//           ].map(s => (
//             <div key={s.l} className="text-center">
//               <p className="text-base font-bold text-white">{formatCount(s.n)}</p>
//               <p className="text-xs text-[#888]">{s.l}</p>
//             </div>
//           ))}
//         </div>

//         {/* Description */}
//         {channel.description && (
//           <p className="text-[#888] text-sm mt-3 leading-relaxed">{channel.description}</p>
//         )}

//         {/* Social links */}
//         {typeof channel.owner === 'object' && channel.owner?.socialLinks && (
//           <div className="flex flex-wrap gap-3 mt-3">
//             {Object.entries(channel.owner.socialLinks).filter(([, v]) => v).map(([k, v]) => (
//               <a key={k} href={v as string} target="_blank" rel="noopener noreferrer"
//                 className="flex items-center gap-1 text-xs text-[#6C63FF] hover:underline capitalize">
//                 <ExternalLink className="w-3 h-3" />{k}
//               </a>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Featured post */}
//       {channel.featuredPost && (
//         <div className="mb-6">
//           <p className="text-xs text-[#888] font-medium mb-2 uppercase tracking-wider">Featured</p>
//           <Link to={`/post/${typeof channel.featuredPost === 'object' ? channel.featuredPost._id : channel.featuredPost}`}
//             className="block overflow-hidden rounded-2xl border border-[#6C63FF]/30 hover:border-[#6C63FF] transition-colors">
//             {typeof channel.featuredPost === 'object' && channel.featuredPost.renderedImage?.thumbnail && (
//               <img src={channel.featuredPost.renderedImage.thumbnail} alt="Featured" className="w-full h-48 object-cover" />
//             )}
//           </Link>
//         </div>
//       )}

//       {/* Tabs */}
//       <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />

//       {tab === 'posts'  && <ChannelPostsTab  handle={cleanHandle} isOwner={isOwner} />}
//       {tab === 'series' && <ChannelSeriesTab handle={cleanHandle} />}
//       {tab === 'audio'  && <ChannelAudioTab  handle={cleanHandle} />}
//     </div>
//   )
// }

// // ── Channel Posts Tab ─────────────────────────

// function ChannelPostsTab({ handle, isOwner }: { handle: string; isOwner: boolean }) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['channel', handle, 'posts'],
//     queryFn : () => creatorApi.getChannelPosts(handle, { limit: 30 }).then(r => r.data.data),
//   })

//   if (!isLoading && !data?.posts.length) {
//     return (
//       <EmptyState
//         icon="📝"
//         title="No posts yet"
//         description={isOwner ? 'Create your first post!' : 'Check back later'}
//         action={isOwner ? <Link to="/create"><Button>Create Post</Button></Link> : undefined}
//       />
//     )
//   }

//   return <PostGrid posts={data?.posts ?? []} loading={isLoading} />
// }

// // ── Channel Series Tab ────────────────────────

// function ChannelSeriesTab({ handle }: { handle: string }) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['channel', handle, 'series'],
//     queryFn : () => creatorApi.getChannelSeries(handle, { limit: 20 }).then(r => r.data.data),
//   })

//   if (isLoading) return <div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[2/3] bg-[#1A1A1A] rounded-xl animate-pulse" />)}</div>
//   if (!data?.series.length) return <EmptyState icon="📚" title="No series yet" />

//   return (
//     <div className="grid grid-cols-2 gap-3">
//       {data.series.map(s => <SeriesCard key={s._id} series={s} />)}
//     </div>
//   )
// }

// // ── Channel Audio Tab ─────────────────────────

// function ChannelAudioTab({ handle }: { handle: string }) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['channel', handle, 'audio'],
//     queryFn : () => creatorApi.getChannelPosts(handle, { type: 'audio', limit: 20 } as Parameters<typeof creatorApi.getChannelPosts>[1]).then(r => r.data.data),
//   })

//   if (isLoading) return <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-[#1A1A1A] rounded-xl animate-pulse" />)}</div>
//   if (!data?.posts.length) return <EmptyState icon="🎙️" title="No audio posts yet" />

//   return (
//     <div className="flex flex-col gap-3">
//       {data.posts.map(post => (
//         <Link key={post._id} to={`/post/${post._id}`}
//           className="flex items-center gap-4 p-4 bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl hover:border-[#6C63FF] transition-colors">
//           <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#242424] shrink-0">
//             {post.audio?.coverImage?.thumbnail
//               ? <img src={post.audio.coverImage.thumbnail} alt="" className="w-full h-full object-cover" />
//               : <div className="w-full h-full flex items-center justify-center text-xl">🎙️</div>
//             }
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="font-medium text-white truncate">{post.title || 'Audio Post'}</p>
//             <p className="text-xs text-[#888] mt-0.5">{timeAgo(post.publishedAt || post.createdAt)}</p>
//           </div>
//           {post.audio?.duration && (
//             <span className="text-xs text-[#888] shrink-0">
//               {Math.floor(post.audio.duration / 60)}:{String(Math.floor(post.audio.duration % 60)).padStart(2, '0')}
//             </span>
//           )}
//         </Link>
//       ))}
//     </div>
//   )
// }

// // ── Series Card ───────────────────────────────

// export function SeriesCard({ series }: { series: Series }) {
//   const statusColors: Record<string, string> = {
//     ongoing: 'bg-green-500/20 text-green-400', completed: 'bg-[#6C63FF]/20 text-[#6C63FF]',
//     on_hiatus: 'bg-yellow-500/20 text-yellow-400', dropped: 'bg-red-500/20 text-red-400',
//   }
//   return (
//     <Link to={`/series/${series._id}`} className="flex flex-col bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl overflow-hidden hover:border-[#6C63FF] transition-colors group">
//       <div className="aspect-[2/3] overflow-hidden bg-[#242424]">
//         {series.cover?.thumbnail
//           ? <img src={series.cover.thumbnail} alt={series.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
//           : <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
//         }
//       </div>
//       <div className="p-3">
//         <p className="text-sm font-semibold text-white truncate">{series.title}</p>
//         <p className="text-xs text-[#888] mt-0.5">{series.publishedChapters} chapters</p>
//         <span className={`mt-2 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[series.completionStatus]}`}>
//           {series.completionStatus.replace('_', ' ')}
//         </span>
//       </div>
//     </Link>
//   )
// }

// // ─────────────────────────────────────────────
// //  USER PROFILE PAGE  /users/:username
// // ─────────────────────────────────────────────

// export function UserProfilePage() {
//   const { username } = useParams<{ username: string }>()
//   const { user: me, isAuthenticated } = useAuthStore()
//   const navigate     = useNavigate()
//   const queryClient  = useQueryClient()
//   const [isFollowing, setIsFollowing] = useState(false)

//   const { data, isLoading } = useQuery({
//     queryKey: ['user', username],
//     queryFn : () => creatorApi.getUserProfile(username!).then(r => r.data.data),
//     enabled : !!username,
//   })

//   const followMutation = useMutation({
//     mutationFn: () => engagementApi.toggleFollow(data?.user._id || '').then(r => r.data.data),
//     onSuccess : (res) => {
//       setIsFollowing(res.following)
//       queryClient.invalidateQueries({ queryKey: ['user', username] })
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   if (isLoading) return <PageSpinner />
//   if (!data)     return <div className="text-center py-20"><p className="text-[#888]">User not found</p></div>

//   const { user, isFollowing: serverFollowing, isFollowedBy } = data
//   const isSelf     = me?._id === user._id
//   const following  = isFollowing || serverFollowing

//   // If user has a channel, redirect to channel page
//   if (user.channel) {
//     const channelHandle = typeof user.channel === 'object' ? (user.channel as Channel).handle : null
//     if (channelHandle) return <ChannelPage />
//   }

//   return (
//     <div>
//       <div className="flex flex-col items-center text-center py-8">
//         <Avatar user={user} size="xl" className="mb-4" />
//         <div className="flex items-center gap-2">
//           <h1 className="text-xl font-bold text-white">{user.displayName}</h1>
//           {user.isVerified && <span>✅</span>}
//         </div>
//         <p className="text-[#888]">@{user.username}</p>
//         {user.bio && <p className="text-[#ccc] text-sm mt-2 max-w-xs">{user.bio}</p>}
//         {isFollowedBy && <p className="text-xs text-[#888] mt-1">Follows you</p>}

//         <div className="flex gap-6 mt-4">
//           {[
//             { n: user.stats.followersCount, l: 'Followers' },
//             { n: user.stats.followingCount, l: 'Following' },
//             { n: user.stats.postsCount,     l: 'Posts'     },
//           ].map(s => (
//             <div key={s.l}>
//               <p className="font-bold text-white">{formatCount(s.n)}</p>
//               <p className="text-xs text-[#888]">{s.l}</p>
//             </div>
//           ))}
//         </div>

//         <div className="flex gap-2 mt-6">
//           {isSelf ? (
//             <Link to="/settings"><Button variant="outline">Edit Profile</Button></Link>
//           ) : (
//             <>
//               <Button
//                 variant={following ? 'secondary' : 'primary'}
//                 icon={following ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
//                 onClick={() => { if (!isAuthenticated) { navigate('/login'); return } followMutation.mutate() }}
//                 loading={followMutation.isPending}
//               >
//                 {following ? 'Following' : 'Follow'}
//               </Button>
//             </>
//           )}
//         </div>

//         {user.badges?.length > 0 && (
//           <div className="flex gap-2 mt-4 flex-wrap justify-center">
//             {user.badges.map(b => <BadgePill key={b.type} type={b.type} showLabel />)}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }



































import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Grid3X3, BookOpen, Music, UserPlus, UserMinus, ExternalLink, Play } from 'lucide-react'
import toast from 'react-hot-toast'

import { creatorApi, engagementApi } from '../../api'
import { useAuthStore } from '../../store/auth.store'
import { Avatar, Button, BadgePill, PageSpinner, Tabs, EmptyState } from '../../components/ui'
import { PostGrid } from '../../components/post/PostCard'
import { formatCount, timeAgo, getErrorMessage, cn } from '../../utils'
import type { Channel, Post, Series } from '../../types'

// ─────────────────────────────────────────────
//  CHANNEL PAGE  /@handle
// ─────────────────────────────────────────────

export function ChannelPage() {
  const { handle }  = useParams<{ handle: string }>()
  const cleanHandle = handle?.replace('@', '') || ''
  const { user, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate    = useNavigate()
  const [tab, setTab] = useState('posts')

  const { data, isLoading } = useQuery({
    queryKey: ['channel', cleanHandle],
    queryFn : () => creatorApi.getChannelPage(cleanHandle).then(r => r.data.data),
    enabled : !!cleanHandle,
  })

  const [isFollowing, setIsFollowing] = useState(false)

  // Sync follow state when data loads
  const channel  = data?.channel
  const following = data?.isFollowing

  const followMutation = useMutation({
    mutationFn: () => engagementApi.toggleFollow(channel?.owner?._id || '').then(r => r.data.data),
    onSuccess : (res) => {
      setIsFollowing(res.following)
      queryClient.invalidateQueries({ queryKey: ['channel', cleanHandle] })
      toast(res.following ? '✅ Following!' : 'Unfollowed')
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  const handleFollow = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    followMutation.mutate()
  }

  if (isLoading) return <PageSpinner />
  if (!channel)  return (
    <div className="text-center py-24 animate-slide-up">
      <p className="text-muted font-serif text-2xl italic tracking-wide">Channel not found</p>
      <Link to="/"><Button variant="ghost" className="mt-6 text-primary hover:text-primary-dark">Return Home</Button></Link>
    </div>
  )

  const isOwner = user?._id === (typeof channel.owner === 'object' ? channel.owner?._id : channel.owner)
  const tabs = [
    { id: 'posts',  label: 'Posts',  icon: <Grid3X3 className="w-4 h-4" /> },
    { id: 'series', label: 'Series', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'audio',  label: 'Audio',  icon: <Music className="w-4 h-4" /> },
  ]

  return (
    <div className=" p-20 animate-slide-up">
      {/* Cinematic Banner - Full bleed using negative margins */}
      {channel.theme?.bannerImage?.url ? (
        <div className="h-56 md:h-72 -mx-4 md:-mx-8 -mt-6 md:-mt-8 mb-0 relative overflow-hidden">
          <img src={channel.theme.bannerImage.url} alt="Banner" className="w-full h-full object-cover opacity-70 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        </div>
      ) : (
        <div className="h-56 md:h-72 -mx-4 md:-mx-8 -mt-6 md:-mt-8 mb-0 relative overflow-hidden bg-[#934e4e]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-dark/20 via-surface to-bg" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
        </div>
      )}

      {/* Profile Section */}
      <div className="relative pb-8 -mt-20 md:-mt-24 z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          {/* Avatar */}
          <div className="w-28 h-28 md:w-36 md:h-36 ring-4 ring-bg rounded-full overflow-hidden shadow-2xl bg-surface2">
            <Avatar src={channel.logo?.url} name={channel.name} size="xl" className="w-full h-full object-cover" />
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            {isOwner ? (
              <Link to="/settings/channel">
                <Button variant="outline" className="border-border text-text hover:border-primary hover:text-primary transition-colors shadow-sm rounded-full px-6">
                  Edit Channel
                </Button>
              </Link>
            ) : (
              <Button
                variant={following || isFollowing ? 'secondary' : 'primary'}
                icon={following || isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                onClick={handleFollow}
                loading={followMutation.isPending}
                className={cn(
                  "rounded-full px-8 shadow-md transition-all font-bold",
                  following || isFollowing 
                    ? "bg-surface2 text-muted hover:text-text border border-border/50" 
                    : "bg-primary text-bg hover:bg-primary-dark hover:gold-glow hover:scale-105"
                )}
              >
                {following || isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-serif font-black text-text tracking-tight">{channel.name}</h1>
            {channel.isVerified && <span className="text-primary text-xl">✦</span>}
            {(typeof channel.owner === 'object' && channel.owner?.badges?.length > 0) &&
              channel.owner.badges.slice(0, 2).map(b => <BadgePill key={b.type} type={b.type} />)
            }
          </div>
          <p className="text-primary font-bold text-sm tracking-wide">@{channel.handle}</p>
          {channel.tagline && <p className="text-muted text-base mt-2 font-serif italic tracking-wide leading-relaxed">"{channel.tagline}"</p>}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-8 mt-8 p-5 bg-surface/40 backdrop-blur-md rounded-2xl border border-border/50 shadow-lg w-fit">
          {[
            { n: channel.stats.followersCount, l: 'Followers' },
            { n: channel.stats.postsCount,     l: 'Posts'     },
            { n: channel.stats.seriesCount,    l: 'Series'    },
          ].map(s => (
            <div key={s.l} className="flex flex-col">
              <p className="text-xl font-black text-text">{formatCount(s.n)}</p>
              <p className="text-xs text-muted font-bold uppercase tracking-widest mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Description & Links */}
        <div className="mt-8 max-w-4xl space-y-5">
          {channel.description && (
            <p className="text-muted/90 text-sm md:text-base leading-relaxed">{channel.description}</p>
          )}

          {typeof channel.owner === 'object' && channel.owner?.socialLinks && (
            <div className="flex flex-wrap gap-4">
              {Object.entries(channel.owner.socialLinks).filter(([, v]) => v).map(([k, v]) => (
                <a key={k} href={v as string} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-text hover:text-primary transition-colors capitalize bg-surface2 px-4 py-2 rounded-full border border-border/50 hover:border-primary/50 shadow-sm">
                  <ExternalLink className="w-3.5 h-3.5" />{k}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Post */}
      {channel.featuredPost && (
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-black text-text tracking-tight">Featured Selection</h2>
            <div className="h-px bg-border/60 flex-1" />
          </div>
          
          <Link to={`/post/${typeof channel.featuredPost === 'object' ? channel.featuredPost._id : channel.featuredPost}`}
            className="block overflow-hidden rounded-2xl border border-border/50 bg-surface shadow-lg hover:border-primary/50 hover:gold-glow transition-all duration-300 group relative">
            {typeof channel.featuredPost === 'object' && channel.featuredPost.renderedImage?.thumbnail && (
              <div className="relative aspect-[21/9] md:aspect-[3/1] bg-surface2">
                <img src={channel.featuredPost.renderedImage.thumbnail} alt="Featured" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary text-bg rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-1" />
                  </div>
                  <span className="text-white font-bold tracking-widest uppercase text-xs">Play Featured</span>
                </div>
              </div>
            )}
          </Link>
        </div>
      )}

      {/* Sticky Navigation Tabs (Full bleed) */}
      <div className="sticky top-0 z-40 bg-bg/90 backdrop-blur-xl py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-border/40 mb-8">
        <Tabs tabs={tabs} active={tab} onChange={setTab} className="w-full" />
      </div>

      <div className="min-h-[400px]">
        {tab === 'posts'  && <ChannelPostsTab  handle={cleanHandle} isOwner={isOwner} />}
        {tab === 'series' && <ChannelSeriesTab handle={cleanHandle} />}
        {tab === 'audio'  && <ChannelAudioTab  handle={cleanHandle} />}
      </div>
    </div>
  )
}

// ── Channel Posts Tab ─────────────────────────

function ChannelPostsTab({ handle, isOwner }: { handle: string; isOwner: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ['channel', handle, 'posts'],
    queryFn : () => creatorApi.getChannelPosts(handle, { limit: 30 }).then(r => r.data.data),
  })

  if (!isLoading && !data?.posts.length) {
    return (
      <EmptyState
        icon="✨"
        title="The canvas is empty"
        description={isOwner ? 'Begin writing your first masterpiece.' : 'This creator has not shared any words yet.'}
        action={isOwner ? <Link to="/create"><Button className="bg-primary text-bg font-bold hover:bg-primary-dark shadow-lg rounded-full px-8">Create Post</Button></Link> : undefined}
      />
    )
  }

  return <PostGrid posts={data?.posts ?? []} loading={isLoading} />
}

// ── Channel Series Tab ────────────────────────

function ChannelSeriesTab({ handle }: { handle: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['channel', handle, 'series'],
    queryFn : () => creatorApi.getChannelSeries(handle, { limit: 20 }).then(r => r.data.data),
  })

  if (isLoading) return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="aspect-[2/3] bg-surface rounded-2xl animate-pulse border border-border/50 shadow-lg" />)}</div>
  if (!data?.series.length) return <EmptyState icon="📜" title="No collections found" description="Series bind individual poems into a greater journey." />

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {data.series.map(s => <SeriesCard key={s._id} series={s} />)}
    </div>
  )
}

// ── Channel Audio Tab ─────────────────────────

function ChannelAudioTab({ handle }: { handle: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['channel', handle, 'audio'],
    queryFn : () => creatorApi.getChannelPosts(handle, { type: 'audio', limit: 20 } as Parameters<typeof creatorApi.getChannelPosts>[1]).then(r => r.data.data),
  })

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-surface rounded-2xl animate-pulse border border-border/50 shadow-lg" />)}</div>
  if (!data?.posts.length) return <EmptyState icon="🎙️" title="Silence" description="No audio recitations have been uploaded yet." />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {data.posts.map(post => (
        <Link key={post._id} to={`/post/${post._id}`}
          className="flex items-center gap-4 p-4 bg-surface hover:bg-surface2 border border-border/50 rounded-2xl shadow-lg hover:border-primary/50 hover:gold-glow transition-all duration-300 group">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface2 shrink-0 relative shadow-inner">
            {post.audio?.coverImage?.thumbnail
              ? (
                <>
                  <img src={post.audio.coverImage.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                    <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" fill="currentColor" />
                  </div>
                </>
              )
              : <div className="w-full h-full flex items-center justify-center text-3xl">🎙️</div>
            }
          </div>
          <div className="flex-1 min-w-0 py-1">
            <p className="font-bold text-text text-base truncate group-hover:text-primary transition-colors">{post.title || 'Audio Recitation'}</p>
            <p className="text-sm text-muted mt-1 truncate">{post.excerpt || 'Listen to this poetic piece...'}</p>
            <p className="text-xs text-muted/70 mt-2 font-medium uppercase tracking-wider">{timeAgo(post.publishedAt || post.createdAt)}</p>
          </div>
          {post.audio?.duration && (
            <div className="shrink-0 pl-2">
              <span className="text-xs font-black text-text bg-surface2 px-3 py-1.5 rounded-full border border-border/50 shadow-sm">
                {Math.floor(post.audio.duration / 60)}:{String(Math.floor(post.audio.duration % 60)).padStart(2, '0')}
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}

// ── Series Card ───────────────────────────────

export function SeriesCard({ series }: { series: Series }) {
  const statusColors: Record<string, string> = {
    ongoing: 'bg-primary/10 text-primary border-primary/20', 
    completed: 'bg-text/10 text-text border-text/20',
    on_hiatus: 'bg-surface2 text-muted border-border', 
    dropped: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <Link to={`/series/${series._id}`} className="flex flex-col bg-surface hover:bg-surface2 border border-border/50 rounded-2xl overflow-hidden shadow-lg hover:border-primary/50 hover:gold-glow transition-all duration-300 group cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface2">
        {series.cover?.thumbnail
          ? (
            <>
              <img src={series.cover.thumbnail} alt={series.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />
            </>
          )
          : <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
        }
        <div className="absolute top-3 right-3">
           <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest backdrop-blur-md", statusColors[series.completionStatus])}>
            {series.completionStatus.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-1">
        <h3 className="text-text font-bold text-sm truncate group-hover:text-primary transition-colors">{series.title}</h3>
        <p className="text-muted text-xs font-medium">{series.publishedChapters} chapters</p>
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────
//  USER PROFILE PAGE  /users/:username
// ─────────────────────────────────────────────

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: me, isAuthenticated } = useAuthStore()
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const [isFollowing, setIsFollowing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['user', username],
    queryFn : () => creatorApi.getUserProfile(username!).then(r => r.data.data),
    enabled : !!username,
  })

  const followMutation = useMutation({
    mutationFn: () => engagementApi.toggleFollow(data?.user._id || '').then(r => r.data.data),
    onSuccess : (res) => {
      setIsFollowing(res.following)
      queryClient.invalidateQueries({ queryKey: ['user', username] })
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  if (isLoading) return <PageSpinner />
  if (!data)     return (
    <div className="text-center py-24 animate-slide-up">
      <p className="text-muted font-serif text-2xl italic tracking-wide">User not found</p>
    </div>
  )

  const { user, isFollowing: serverFollowing, isFollowedBy } = data
  const isSelf     = me?._id === user._id
  const following  = isFollowing || serverFollowing

  // If user has a channel, redirect to channel page
  if (user.channel) {
    const channelHandle = typeof user.channel === 'object' ? (user.channel as Channel).handle : null
    if (channelHandle) return <ChannelPage />
  }

  return (
    <div className="animate-slide-up pb-24">
      {/* Decorative Top Accent - Full bleed */}
      <div className="h-40 md:h-56 -mx-4 md:-mx-8 -mt-6 md:-mt-8 bg-gradient-to-b from-surface2 to-bg border-b border-border/30 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
      </div>

      <div className="flex flex-col items-center text-center -mt-24 md:-mt-32 px-4 relative z-10">
        <div className="w-32 h-32 md:w-40 md:h-40 ring-[6px] ring-bg rounded-full overflow-hidden shadow-2xl bg-surface2 mb-6">
          <Avatar user={user} size="xl" className="w-full h-full object-cover" />
        </div>
        
        <div className="flex items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-serif font-black text-text tracking-tight">{user.displayName}</h1>
          {user.isVerified && <span className="text-primary text-xl">✦</span>}
        </div>
        <p className="text-primary font-bold text-base mt-1 tracking-wide">@{user.username}</p>
        
        {user.bio && <p className="text-muted text-base mt-4 max-w-md leading-relaxed font-serif italic">"{user.bio}"</p>}
        {isFollowedBy && <p className="text-[10px] uppercase tracking-widest font-black text-text mt-4 border border-border/50 bg-surface px-4 py-1.5 rounded-full shadow-sm">Follows you</p>}

        <div className="flex gap-4 md:gap-8 mt-8 p-6 bg-surface/50 backdrop-blur-md rounded-3xl border border-border/50 w-full max-w-md justify-center shadow-xl">
          {[
            { n: user.stats.followersCount, l: 'Followers' },
            { n: user.stats.followingCount, l: 'Following' },
            { n: user.stats.postsCount,     l: 'Posts'     },
          ].map(s => (
            <div key={s.l} className="flex flex-col items-center flex-1">
              <p className="font-black text-2xl text-text">{formatCount(s.n)}</p>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1.5">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8 w-full max-w-sm">
          {isSelf ? (
            <Link to="/settings" className="w-full">
              <Button variant="outline" className="w-full border-border/50 text-text hover:border-primary hover:text-primary transition-colors shadow-sm rounded-full py-6 font-bold">
                Edit Profile
              </Button>
            </Link>
          ) : (
            <Button
              className={cn(
                "w-full transition-all rounded-full py-6 font-bold shadow-md",
                following 
                  ? "bg-surface2 text-text border border-border/50 hover:bg-surface" 
                  : "bg-primary text-bg hover:bg-primary-dark hover:scale-[1.02] hover:gold-glow"
              )}
              icon={following ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              onClick={() => { if (!isAuthenticated) { navigate('/login'); return } followMutation.mutate() }}
              loading={followMutation.isPending}
            >
              {following ? 'Following' : 'Follow @' + user.username}
            </Button>
          )}
        </div>

        {user.badges?.length > 0 && (
          <div className="flex gap-3 mt-10 flex-wrap justify-center border-t border-border/40 pt-8 w-full max-w-lg">
            {user.badges.map(b => <BadgePill key={b.type} type={b.type} showLabel />)}
          </div>
        )}
      </div>
    </div>
  )
}