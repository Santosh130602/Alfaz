// import { useState, useEffect, useRef } from 'react'
// import { useSearchParams, Link } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { Search, X, Hash } from 'lucide-react'
// import { searchApi } from '../../api'
// import { Avatar, Spinner, Tabs, EmptyState } from '../../components/ui'
// import { PostCard } from '../../components/post/PostCard'
// import { cn, formatCount } from '../../utils'
// import type { Post, Channel, Series } from '../../types'

// export function SearchPage() {
//   const [searchParams, setSearchParams] = useSearchParams()
//   const [input, setInput]   = useState(searchParams.get('q') || '')
//   const [query, setQuery]   = useState(searchParams.get('q') || '')
//   const [tab, setTab]       = useState('posts')
//   const [showAuto, setShowAuto] = useState(false)
//   const inputRef            = useRef<HTMLInputElement>(null)
//   const tagParam            = searchParams.get('tag')

//   // Handle tag search
//   if (tagParam) return <TagSearchPage tag={tagParam} />

//   // Autocomplete
//   const { data: autoData } = useQuery({
//     queryKey: ['autocomplete', input],
//     queryFn : () => searchApi.autocomplete(input).then(r => r.data.data),
//     enabled : input.length >= 2 && showAuto,
//     staleTime: 30000,
//   })

//   const handleSearch = (q: string) => {
//     setQuery(q)
//     setInput(q)
//     setShowAuto(false)
//     setSearchParams({ q })
//   }

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') handleSearch(input)
//     if (e.key === 'Escape') setShowAuto(false)
//   }

//   const tabs = [
//     { id: 'posts',    label: 'Posts'    },
//     { id: 'channels', label: 'Channels' },
//     { id: 'series',   label: 'Series'   },
//   ]

//   return (
//     <div>
//       {/* Search input */}
//       <div className="relative mb-6">
//         <div className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl px-4 focus-within:border-[#6C63FF] transition-colors">
//           <Search className="w-5 h-5 text-[#555] shrink-0" />
//           <input
//             ref={inputRef}
//             value={input}
//             onChange={e => { setInput(e.target.value); setShowAuto(true) }}
//             onKeyDown={handleKeyDown}
//             onFocus={() => setShowAuto(true)}
//             placeholder="Search sayari, creators, series..."
//             className="flex-1 h-12 bg-transparent text-white placeholder-[#555] outline-none"
//           />
//           {input && (
//             <button onClick={() => { setInput(''); setQuery(''); setSearchParams({}) }} className="text-[#888] hover:text-white">
//               <X className="w-4 h-4" />
//             </button>
//           )}
//         </div>

//         {/* Autocomplete dropdown */}
//         {showAuto && autoData?.suggestions && autoData.suggestions.length > 0 && (
//           <div className="absolute top-full mt-2 left-0 right-0 bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl shadow-xl z-20 overflow-hidden">
//             {autoData.suggestions.map(s => (
//               <button
//                 key={s.id}
//                 onClick={() => handleSearch(s.handle || s.username || '')}
//                 className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#242424] transition-colors text-left"
//               >
//                 <Avatar
//                   src={s.type === 'channel' ? (s.logo as { thumbnail?: string })?.thumbnail : (s.avatar as { thumbnail?: string })?.thumbnail}
//                   name={s.name || s.displayName}
//                   size="sm"
//                 />
//                 <div>
//                   <p className="text-sm text-white font-medium">{s.name || s.displayName}</p>
//                   <p className="text-xs text-[#888]">@{s.handle || s.username} · {s.type}</p>
//                 </div>
//                 {s.isVerified && <span className="ml-auto text-xs">✅</span>}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Trending tags when no query */}
//       {!query && <TrendingTagsRow />}

//       {/* Results */}
//       {query && (
//         <>
//           <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6" />
//           {tab === 'posts'    && <PostResults    query={query} />}
//           {tab === 'channels' && <ChannelResults query={query} />}
//           {tab === 'series'   && <SeriesResults  query={query} />}
//         </>
//       )}
//     </div>
//   )
// }

// // ── Post Results ──────────────────────────────

// function PostResults({ query }: { query: string }) {
//   const [type, setType]         = useState('')
//   const [language, setLanguage] = useState('')
//   const [sort, setSort]         = useState('relevance')

//   const { data, isLoading } = useQuery({
//     queryKey: ['search', 'posts', query, type, language, sort],
//     queryFn : () => searchApi.posts(query, { type: type || undefined, language: language || undefined, sort, limit: 20 }).then(r => r.data.data),
//     enabled : query.length >= 2,
//   })

//   return (
//     <div>
//       {/* Filters */}
//       <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
//         {[{ v: '', l: 'All' }, { v: 'sayari', l: 'Sayari' }, { v: 'kavita', l: 'Kavita' }, { v: 'audio', l: 'Audio' }, { v: 'story_chapter', l: 'Story' }].map(f => (
//           <button key={f.v} onClick={() => setType(f.v)}
//             className={cn('shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
//               type === f.v ? 'bg-[#6C63FF] text-white' : 'bg-[#1A1A1A] text-[#888] border border-[#2E2E2E] hover:text-white'
//             )}>{f.l}</button>
//         ))}
//       </div>

//       <div className="flex gap-2 mb-4">
//         {[{ v: 'relevance', l: 'Relevant' }, { v: 'newest', l: 'Newest' }, { v: 'popular', l: 'Popular' }].map(s => (
//           <button key={s.v} onClick={() => setSort(s.v)}
//             className={cn('px-3 py-1 rounded-full text-xs font-medium transition-colors',
//               sort === s.v ? 'bg-[#FF6584]/20 text-[#FF6584] border border-[#FF6584]/30' : 'bg-[#1A1A1A] text-[#888] border border-[#2E2E2E] hover:text-white'
//             )}>{s.l}</button>
//         ))}
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//       ) : !data?.posts.length ? (
//         <EmptyState icon={<Search className="w-10 h-10 text-[#555]" />} title={`No posts found for "${query}"`} description="Try different keywords or check spelling" />
//       ) : (
//         <div className="flex flex-col gap-4">
//           {data.posts.map(post => <PostCard key={post._id} post={post} />)}
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Channel Results ───────────────────────────

// function ChannelResults({ query }: { query: string }) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['search', 'channels', query],
//     queryFn : () => searchApi.channels(query, { limit: 20 }).then(r => r.data.data),
//     enabled : query.length >= 2,
//   })

//   if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//   if (!data?.channels.length) return <EmptyState icon="📡" title={`No channels found for "${query}"`} description="Try searching by handle or channel name" />

//   return (
//     <div className="flex flex-col gap-3">
//       {data.channels.map(channel => <ChannelSearchCard key={channel._id} channel={channel} />)}
//     </div>
//   )
// }

// function ChannelSearchCard({ channel }: { channel: Channel }) {
//   return (
//     <Link to={`/@${channel.handle}`} className="flex items-center gap-4 p-4 bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl hover:border-[#6C63FF] transition-colors">
//       <Avatar src={channel.logo?.thumbnail} name={channel.name} size="lg" />
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2">
//           <p className="font-semibold text-white truncate">{channel.name}</p>
//           {channel.isVerified && <span className="text-sm">✅</span>}
//         </div>
//         <p className="text-sm text-[#888]">@{channel.handle}</p>
//         {channel.tagline && <p className="text-xs text-[#666] truncate mt-0.5">{channel.tagline}</p>}
//         <div className="flex items-center gap-3 mt-1">
//           <span className="text-xs text-[#555]">{formatCount(channel.stats.followersCount)} followers</span>
//           <span className="text-xs text-[#555]">{formatCount(channel.stats.postsCount)} posts</span>
//         </div>
//       </div>
//     </Link>
//   )
// }

// // ── Series Results ────────────────────────────

// function SeriesResults({ query }: { query: string }) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['search', 'series', query],
//     queryFn : () => searchApi.series(query, { limit: 20 }).then(r => r.data.data),
//     enabled : query.length >= 2,
//   })

//   if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//   if (!data?.series.length) return <EmptyState icon="📚" title={`No series found for "${query}"`} />

//   return (
//     <div className="flex flex-col gap-3">
//       {data.series.map(s => <SeriesSearchCard key={s._id} series={s} />)}
//     </div>
//   )
// }

// function SeriesSearchCard({ series }: { series: Series }) {
//   const statusColors: Record<string, string> = {
//     ongoing  : 'text-green-400', completed: 'text-[#6C63FF]',
//     on_hiatus: 'text-yellow-400', dropped  : 'text-red-400',
//   }
//   return (
//     <Link to={`/series/${series._id}`} className="flex items-center gap-4 p-4 bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl hover:border-[#6C63FF] transition-colors">
//       <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#242424] shrink-0">
//         {series.cover?.thumbnail
//           ? <img src={series.cover.thumbnail} alt={series.title} className="w-full h-full object-cover" />
//           : <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
//         }
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="font-semibold text-white truncate">{series.title}</p>
//         <p className="text-sm text-[#888]">by {series.author.displayName}</p>
//         <div className="flex items-center gap-2 mt-1 flex-wrap">
//           <span className={cn('text-xs font-medium capitalize', statusColors[series.completionStatus])}>
//             {series.completionStatus.replace('_', ' ')}
//           </span>
//           <span className="text-xs text-[#555]">·</span>
//           <span className="text-xs text-[#555]">{series.publishedChapters} chapters</span>
//           <span className="text-xs text-[#555]">·</span>
//           <span className="text-xs text-[#555]">{formatCount(series.stats.viewCount)} views</span>
//         </div>
//       </div>
//     </Link>
//   )
// }

// // ── Tag Search Page ───────────────────────────

// function TagSearchPage({ tag }: { tag: string }) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['search', 'tag', tag],
//     queryFn : () => searchApi.byTag(tag, { limit: 20 }).then(r => r.data.data),
//   })

//   return (
//     <div>
//       <div className="flex items-center gap-3 mb-6">
//         <div className="w-10 h-10 bg-[#6C63FF]/20 rounded-xl flex items-center justify-center">
//           <Hash className="w-5 h-5 text-[#6C63FF]" />
//         </div>
//         <div>
//           <h1 className="text-xl font-bold text-white">#{tag}</h1>
//           {data && <p className="text-sm text-[#888]">{formatCount(data.pagination as unknown as number)} posts</p>}
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//       ) : !data?.posts.length ? (
//         <EmptyState icon={<Hash className="w-8 h-8 text-[#555]" />} title={`No posts with #${tag}`} />
//       ) : (
//         <div className="flex flex-col gap-4">
//           {data.posts.map(post => <PostCard key={post._id} post={post} />)}
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Trending Tags Row ─────────────────────────

// function TrendingTagsRow() {
//   const { data } = useQuery({
//     queryKey: ['trendingTags'],
//     queryFn : () => searchApi.trendingTags(15).then(r => r.data.data.tags),
//     staleTime: 300000,
//   })

//   if (!data?.length) return null

//   return (
//     <div>
//       <h2 className="text-base font-semibold text-white mb-3">Trending Tags</h2>
//       <div className="flex flex-wrap gap-2">
//         {data.map(t => (
//           <Link key={t.tag} to={`/search?tag=${t.tag}`}
//             className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] border border-[#2E2E2E] rounded-full text-sm text-[#888] hover:text-[#6C63FF] hover:border-[#6C63FF] transition-colors">
//             <Hash className="w-3 h-3" />{t.tag}
//           </Link>
//         ))}
//       </div>
//     </div>
//   )
// }













































// import { useState, useEffect, useRef } from 'react'
// import { useSearchParams, Link } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { Search, X, Hash } from 'lucide-react'
// import { searchApi } from '../../api'
// import { Avatar, Spinner, Tabs, EmptyState } from '../../components/ui'
// import { PostCard } from '../../components/post/PostCard'
// import { cn, formatCount } from '../../utils'
// import type { Post, Channel, Series } from '../../types'



// export function SearchPage() {
//   const [searchParams, setSearchParams] = useSearchParams()
//   const [input, setInput]   = useState(searchParams.get('q') || '')
//   const [query, setQuery]   = useState(searchParams.get('q') || '')
//   const [tab, setTab]       = useState('posts')
//   const [showAuto, setShowAuto] = useState(false)
//   const inputRef            = useRef<HTMLInputElement>(null)
//   const tagParam            = searchParams.get('tag')

//   // Handle tag search
//   if (tagParam) return <TagSearchPage tag={tagParam} />

//   // Autocomplete
//   const { data: autoData } = useQuery({
//     queryKey: ['autocomplete', input],
//     queryFn : () => searchApi.autocomplete(input).then(r => r.data.data),
//     enabled : input.length >= 2 && showAuto,
//     staleTime: 30000,
//   })

//   const handleSearch = (q: string) => {
//     setQuery(q)
//     setInput(q)
//     setShowAuto(false)
//     setSearchParams({ q })
//   }

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') handleSearch(input)
//     if (e.key === 'Escape') setShowAuto(false)
//   }

//   const tabs = [
//     { id: 'posts',    label: 'Posts'    },
//     { id: 'channels', label: 'Channels' },
//     { id: 'series',   label: 'Series'   },
//   ]

//   return (
//     <div className="max-w-4xl mx-auto space-y-6 pb-16 select-none">
      
//       {/* ── Spotify Premium Search Bar Header ── */}
//       <div className="relative">
//         <div className="flex items-center gap-3 bg-surface hover:bg-surface2 focus-within:bg-surface2 border border-border/60 focus-within:border-primary rounded-full px-5 h-14 transition-all duration-300 shadow-lg">
//           <Search className="w-5 h-5 text-muted shrink-0" />
//           <input
//             ref={inputRef}
//             value={input}
//             onChange={e => { setInput(e.target.value); setShowAuto(true) }}
//             onKeyDown={handleKeyDown}
//             onFocus={() => setShowAuto(true)}
//             placeholder="What do you want to listen to or read?"
//             className="flex-1 bg-transparent text-text placeholder-muted text-sm md:text-base font-bold outline-none"
//           />
//           {input && (
//             <button 
//               onClick={() => { setInput(''); setQuery(''); setSearchParams({}) }} 
//               className="w-8 h-8 rounded-full bg-surface2 hover:bg-border flex items-center justify-center text-muted hover:text-text transition-colors"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           )}
//         </div>

//         {/* Autocomplete Dropdown (Spotify Card Style) */}
//         {showAuto && autoData?.suggestions && autoData.suggestions.length > 0 && (
//           <div className="absolute top-full mt-3 left-0 right-0 bg-surface border border-border/80 rounded-2xl shadow-2xl z-30 overflow-hidden backdrop-blur-xl">
//             {autoData.suggestions.map(s => (
//               <button
//                 key={s.id}
//                 onClick={() => handleSearch(s.handle || s.username || '')}
//                 className="flex items-center gap-4 w-full px-5 py-3.5 hover:bg-surface2 transition-all text-left group border-b border-border/30 last:border-none"
//               >
//                 <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border/50 shadow-sm">
//                   <Avatar
//                     src={s.type === 'channel' ? (s.logo as { thumbnail?: string })?.thumbnail : (s.avatar as { thumbnail?: string })?.thumbnail}
//                     name={s.name || s.displayName}
//                     size="md"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-bold text-text truncate group-hover:text-primary transition-colors">
//                     {s.name || s.displayName}
//                   </p>
//                   <p className="text-xs text-muted truncate capitalize mt-0.5">
//                     @{s.handle || s.username} • <span className="text-primary font-bold">{s.type}</span>
//                   </p>
//                 </div>
//                 {s.isVerified && (
//                   <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">Verified</span>
//                 )}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Trending tags when no query */}
//       {!query && (
//         <div className="pt-2">
//           <TrendingTagsRow />
//         </div>
//       )}

//       {/* Results View */}
//       {query && (
//         <div className="space-y-6">
//           <div className="border-b border-border/40 pb-2">
//             <Tabs tabs={tabs} active={tab} onChange={setTab} className="flex gap-2" />
//           </div>
//           <div className="pt-2">
//             {tab === 'posts'    && <PostResults    query={query} />}
//             {tab === 'channels' && <ChannelResults query={query} />}
//             {tab === 'series'   && <SeriesResults  query={query} />}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
// // ── Post Results ──────────────────────────────

// function PostResults({ query }: { query: string }) {
//   const [type, setType]         = useState('')
//   const [language, setLanguage] = useState('')
//   const [sort, setSort]         = useState('relevance')

//   const { data, isLoading } = useQuery({
//     queryKey: ['search', 'posts', query, type, language, sort],
//     queryFn : () => searchApi.posts(query, { type: type || undefined, language: language || undefined, sort, limit: 20 }).then(r => r.data.data),
//     enabled : query.length >= 2,
//   })

//   return (
//     <div>
//       {/* Filters */}
//       <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
//         {[{ v: '', l: 'All' }, { v: 'sayari', l: 'Sayari' }, { v: 'kavita', l: 'Kavita' }, { v: 'audio', l: 'Audio' }, { v: 'story_chapter', l: 'Story' }].map(f => (
//           <button key={f.v} onClick={() => setType(f.v)}
//             className={cn('shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
//               type === f.v ? 'bg-[#6C63FF] text-white' : 'bg-[#1A1A1A] text-[#888] border border-[#2E2E2E] hover:text-white'
//             )}>{f.l}</button>
//         ))}
//       </div>

//       <div className="flex gap-2 mb-4">
//         {[{ v: 'relevance', l: 'Relevant' }, { v: 'newest', l: 'Newest' }, { v: 'popular', l: 'Popular' }].map(s => (
//           <button key={s.v} onClick={() => setSort(s.v)}
//             className={cn('px-3 py-1 rounded-full text-xs font-medium transition-colors',
//               sort === s.v ? 'bg-[#FF6584]/20 text-[#FF6584] border border-[#FF6584]/30' : 'bg-[#1A1A1A] text-[#888] border border-[#2E2E2E] hover:text-white'
//             )}>{s.l}</button>
//         ))}
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//       ) : !data?.posts.length ? (
//         <EmptyState icon={<Search className="w-10 h-10 text-[#555]" />} title={`No posts found for "${query}"`} description="Try different keywords or check spelling" />
//       ) : (
//         <div className="flex flex-col gap-4">
//           {data.posts.map(post => <PostCard key={post._id} post={post} />)}
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Channel Results ───────────────────────────

// function ChannelResults({ query }: { query: string }) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['search', 'channels', query],
//     queryFn : () => searchApi.channels(query, { limit: 20 }).then(r => r.data.data),
//     enabled : query.length >= 2,
//   })

//   if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//   if (!data?.channels.length) return <EmptyState icon="📡" title={`No channels found for "${query}"`} description="Try searching by handle or channel name" />

//   return (
//     <div className="flex flex-col gap-3">
//       {data.channels.map(channel => <ChannelSearchCard key={channel._id} channel={channel} />)}
//     </div>
//   )
// }

// function ChannelSearchCard({ channel }: { channel: Channel }) {
//   return (
//     <Link to={`/@${channel.handle}`} className="flex items-center gap-4 p-4 bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl hover:border-[#6C63FF] transition-colors">
//       <Avatar src={channel.logo?.thumbnail} name={channel.name} size="lg" />
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2">
//           <p className="font-semibold text-white truncate">{channel.name}</p>
//           {channel.isVerified && <span className="text-sm">✅</span>}
//         </div>
//         <p className="text-sm text-[#888]">@{channel.handle}</p>
//         {channel.tagline && <p className="text-xs text-[#666] truncate mt-0.5">{channel.tagline}</p>}
//         <div className="flex items-center gap-3 mt-1">
//           <span className="text-xs text-[#555]">{formatCount(channel.stats.followersCount)} followers</span>
//           <span className="text-xs text-[#555]">{formatCount(channel.stats.postsCount)} posts</span>
//         </div>
//       </div>
//     </Link>
//   )
// }

// // ── Series Results ────────────────────────────

// function SeriesResults({ query }: { query: string }) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['search', 'series', query],
//     queryFn : () => searchApi.series(query, { limit: 20 }).then(r => r.data.data),
//     enabled : query.length >= 2,
//   })

//   if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//   if (!data?.series.length) return <EmptyState icon="📚" title={`No series found for "${query}"`} />

//   return (
//     <div className="flex flex-col gap-3">
//       {data.series.map(s => <SeriesSearchCard key={s._id} series={s} />)}
//     </div>
//   )
// }

// function SeriesSearchCard({ series }: { series: Series }) {
//   const statusColors: Record<string, string> = {
//     ongoing  : 'text-green-400', completed: 'text-[#6C63FF]',
//     on_hiatus: 'text-yellow-400', dropped  : 'text-red-400',
//   }
//   return (
//     <Link to={`/series/${series._id}`} className="flex items-center gap-4 p-4 bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl hover:border-[#6C63FF] transition-colors">
//       <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#242424] shrink-0">
//         {series.cover?.thumbnail
//           ? <img src={series.cover.thumbnail} alt={series.title} className="w-full h-full object-cover" />
//           : <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
//         }
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="font-semibold text-white truncate">{series.title}</p>
//         <p className="text-sm text-[#888]">by {series.author.displayName}</p>
//         <div className="flex items-center gap-2 mt-1 flex-wrap">
//           <span className={cn('text-xs font-medium capitalize', statusColors[series.completionStatus])}>
//             {series.completionStatus.replace('_', ' ')}
//           </span>
//           <span className="text-xs text-[#555]">·</span>
//           <span className="text-xs text-[#555]">{series.publishedChapters} chapters</span>
//           <span className="text-xs text-[#555]">·</span>
//           <span className="text-xs text-[#555]">{formatCount(series.stats.viewCount)} views</span>
//         </div>
//       </div>
//     </Link>
//   )
// }

// // ── Tag Search Page ───────────────────────────

// function TagSearchPage({ tag }: { tag: string }) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['search', 'tag', tag],
//     queryFn : () => searchApi.byTag(tag, { limit: 20 }).then(r => r.data.data),
//   })

//   return (
//     <div>
//       <div className="flex items-center gap-3 mb-6">
//         <div className="w-10 h-10 bg-[#6C63FF]/20 rounded-xl flex items-center justify-center">
//           <Hash className="w-5 h-5 text-[#6C63FF]" />
//         </div>
//         <div>
//           <h1 className="text-xl font-bold text-white">#{tag}</h1>
//           {data && <p className="text-sm text-[#888]">{formatCount(data.pagination as unknown as number)} posts</p>}
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
//       ) : !data?.posts.length ? (
//         <EmptyState icon={<Hash className="w-8 h-8 text-[#555]" />} title={`No posts with #${tag}`} />
//       ) : (
//         <div className="flex flex-col gap-4">
//           {data.posts.map(post => <PostCard key={post._id} post={post} />)}
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Trending Tags Row ─────────────────────────

// function TrendingTagsRow() {
//   const { data } = useQuery({
//     queryKey: ['trendingTags'],
//     queryFn : () => searchApi.trendingTags(15).then(r => r.data.data.tags),
//     staleTime: 300000,
//   })

//   if (!data?.length) return null

//   return (
//     <div>
//       <h2 className="text-base font-semibold text-white mb-3">Trending Tags</h2>
//       <div className="flex flex-wrap gap-2">
//         {data.map(t => (
//           <Link key={t.tag} to={`/search?tag=${t.tag}`}
//             className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] border border-[#2E2E2E] rounded-full text-sm text-[#888] hover:text-[#6C63FF] hover:border-[#6C63FF] transition-colors">
//             <Hash className="w-3 h-3" />{t.tag}
//           </Link>
//         ))}
//       </div>
//     </div>
//   )
// }









// import { useState, useRef } from 'react'
// import { useSearchParams, Link } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { Search, X, Hash, Play } from 'lucide-react'
// import { searchApi } from '../../api'
// import { Avatar, Spinner, Tabs, EmptyState } from '../../components/ui'
// import { PostCard } from '../../components/post/PostCard'
// import { cn, formatCount } from '../../utils'
// import type { Post, Channel, Series } from '../../types'

// export function SearchPage() {
//   const [searchParams, setSearchParams] = useSearchParams()
//   const [input, setInput]   = useState(searchParams.get('q') || '')
//   const [query, setQuery]   = useState(searchParams.get('q') || '')
//   const [tab, setTab]       = useState('posts')
//   const [showAuto, setShowAuto] = useState(false)
//   const inputRef            = useRef<HTMLInputElement>(null)
//   const tagParam            = searchParams.get('tag')

//   if (tagParam) return <TagSearchPage tag={tagParam} />

//   const { data: autoData } = useQuery({
//     queryKey: ['autocomplete', input],
//     queryFn : () => searchApi.autocomplete(input).then(r => r.data.data),
//     enabled : input.length >= 2 && showAuto,
//     staleTime: 30000,
//   })

//   const handleSearch = (q: string) => {
//     setQuery(q)
//     setInput(q)
//     setShowAuto(false)
//     setSearchParams({ q })
//   }

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') handleSearch(input)
//     if (e.key === 'Escape') setShowAuto(false)
//   }

//   const tabs = [
//     { id: 'posts',    label: 'Posts'    },
//     { id: 'channels', label: 'Channels' },
//     { id: 'series',   label: 'Series'   },
//   ]

//   return (
//     <div className="max-w-[1400px] mx-auto space-y-8 pb-24 select-none">
      
//       {/* Spotify Top Search Header Bar */}
//       <div className="relative max-w-2xl mx-auto pt-4">
//         <div className="flex items-center gap-3 bg-[#242424] hover:bg-[#2a2a2a] focus-within:bg-[#2a2a2a] focus-within:ring-2 focus-within:ring-white border border-transparent rounded-full px-5 h-14 transition-all duration-300 shadow-2xl">
//           <Search className="w-5 h-5 text-white/60 shrink-0" />
//           <input
//             ref={inputRef}
//             value={input}
//             onChange={e => { setInput(e.target.value); setShowAuto(true) }}
//             onKeyDown={handleKeyDown}
//             onFocus={() => setShowAuto(true)}
//             placeholder="What do you want to listen to or read?"
//             className="flex-1 bg-transparent text-white placeholder-white/50 text-sm md:text-base font-bold outline-none"
//           />
//           {input && (
//             <button 
//               onClick={() => { setInput(''); setQuery(''); setSearchParams({}) }} 
//               className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           )}
//         </div>

//         {/* Spotify Autocomplete Dropdown Menu */}
//         {showAuto && autoData?.suggestions && autoData.suggestions.length > 0 && (
//           <div className="absolute top-full mt-3 left-0 right-0 bg-[#282828] border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden backdrop-blur-2xl">
//             {autoData.suggestions.map(s => (
//               <button
//                 key={s.id}
//                 onClick={() => handleSearch(s.handle || s.username || '')}
//                 className="flex items-center gap-4 w-full px-5 py-3.5 hover:bg-[#3e3e3e] transition-all text-left group border-b border-white/5 last:border-none"
//               >
//                 <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
//                   <Avatar
//                     src={s.type === 'channel' ? (s.logo as { thumbnail?: string })?.thumbnail : (s.avatar as { thumbnail?: string })?.thumbnail}
//                     name={s.name || s.displayName}
//                     size="md"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-bold text-white truncate group-hover:text-[#1ed760] transition-colors">
//                     {s.name || s.displayName}
//                   </p>
//                   <p className="text-xs text-white/60 truncate capitalize mt-0.5">
//                     @{s.handle || s.username} • <span className="text-[#1ed760] font-bold">{s.type}</span>
//                   </p>
//                 </div>
//                 {s.isVerified && (
//                   <span className="text-xs bg-[#1ed760]/20 text-[#1ed760] px-2.5 py-1 rounded-full font-extrabold">Verified</span>
//                 )}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Trending tags when no query */}
//       {!query && (
//         <div className="pt-6">
//           <TrendingTagsRow />
//         </div>
//       )}

//       {/* Results View */}
//       {query && (
//         <div className="space-y-8">
//           <div className="border-b border-white/10 pb-3 flex justify-center">
//             <Tabs tabs={tabs} active={tab} onChange={setTab} className="flex gap-3" />
//           </div>
//           <div className="pt-2">
//             {tab === 'posts'    && <PostResults    query={query} />}
//             {tab === 'channels' && <ChannelResults query={query} />}
//             {tab === 'series'   && <SeriesResults  query={query} />}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Post Results ──────────────────────────────

// function PostResults({ query }: { query: string }) {
//   const [type, setType]         = useState('')
//   const [language, setLanguage] = useState('')
//   const [sort, setSort]         = useState('relevance')

//   const { data, isLoading } = useQuery({
//     queryKey: ['search', 'posts', query, type, language, sort],
//     queryFn : () => searchApi.posts(query, { type: type || undefined, language: language || undefined, sort, limit: 20 }).then(r => r.data.data),
//     enabled : query.length >= 2,
//   })

//   return (
//     <div className="space-y-6">
//       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//         {[{ v: '', l: 'All' }, { v: 'sayari', l: 'Sayari' }, { v: 'kavita', l: 'Kavita' }, { v: 'audio', l: 'Audio' }, { v: 'story_chapter', l: 'Story' }].map(f => (
//           <button 
//             key={f.v} 
//             onClick={() => setType(f.v)}
//             className={cn(
//               'shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md',
//               type === f.v ? 'bg-white text-black font-black' : 'bg-[#2a2a2a] text-white/80 hover:text-white hover:bg-[#333]'
//             )}
//           >
//             {f.l}
//           </button>
//         ))}
//       </div>

//       <div className="flex gap-2">
//         {[{ v: 'relevance', l: 'Relevant' }, { v: 'newest', l: 'Newest' }, { v: 'popular', l: 'Popular' }].map(s => (
//           <button 
//             key={s.v} 
//             onClick={() => setSort(s.v)}
//             className={cn(
//               'px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm',
//               sort === s.v ? 'bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/40 font-black' : 'bg-[#2a2a2a] text-white/70 hover:text-white'
//             )}
//           >
//             {s.l}
//           </button>
//         ))}
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-16"><Spinner size="lg" /></div>
//       ) : !data?.posts.length ? (
//         <EmptyState icon={<Search className="w-10 h-10 text-white/40" />} title={`No posts found for "${query}"`} description="Try different keywords or check spelling" />
//       ) : (
//         <div className="flex flex-col gap-4 max-w-3xl mx-auto">
//           {data.posts.map(post => <PostCard key={post._id} post={post} />)}
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Channel Results ───────────────────────────

// function ChannelResults({ query }: { query: string }) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['search', 'channels', query],
//     queryFn : () => searchApi.channels(query, { limit: 20 }).then(r => r.data.data),
//     enabled : query.length >= 2,
//   })

//   if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
//   if (!data?.channels.length) return <EmptyState icon="📡" title={`No channels found for "${query}"`} description="Try searching by handle or channel name" />

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//       {data.channels.map(channel => <ChannelSearchCard key={channel._id} channel={channel} />)}
//     </div>
//   )
// }

// function ChannelSearchCard({ channel }: { channel: Channel }) {
//   return (
//     <Link 
//       to={`/@${channel.handle}`} 
//       className="group bg-[#181818] hover:bg-[#282828] p-5 rounded-2xl transition-all duration-300 flex items-center gap-4 shadow-xl border border-white/5 hover:border-white/10"
//     >
//       <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white/10 shadow-md">
//         <Avatar src={channel.logo?.thumbnail} name={channel.name} size="lg" className="w-full h-full object-cover" />
//       </div>
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-2">
//           <p className="font-extrabold text-white truncate group-hover:text-[#1ed760] transition-colors">{channel.name}</p>
//           {channel.isVerified && <span className="text-[10px] bg-[#1ed760]/20 text-[#1ed760] px-2 py-0.5 rounded-full font-black">Verified</span>}
//         </div>
//         <p className="text-xs text-white/50 font-mono mt-0.5">@{channel.handle}</p>
//         <div className="flex items-center gap-3 mt-2">
//           <span className="text-[11px] font-bold text-white/60">{formatCount(channel.stats.followersCount)} followers</span>
//         </div>
//       </div>
//     </Link>
//   )
// }

// // ── Series Results ────────────────────────────

// function SeriesResults({ query }: { query: string }) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['search', 'series', query],
//     queryFn : () => searchApi.series(query, { limit: 20 }).then(r => r.data.data),
//     enabled : query.length >= 2,
//   })

//   if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
//   if (!data?.series.length) return <EmptyState icon="📚" title={`No series found for "${query}"`} />

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//       {data.series.map(s => <SeriesSearchCard key={s._id} series={s} />)}
//     </div>
//   )
// }

// function SeriesSearchCard({ series }: { series: Series }) {
//   const statusColors: Record<string, string> = {
//     ongoing  : 'text-emerald-400', completed: 'text-[#1ed760]',
//     on_hiatus: 'text-amber-400', dropped  : 'text-rose-400',
//   }
//   return (
//     <Link 
//       to={`/series/${series._id}`} 
//       className="group bg-[#181818] hover:bg-[#282828] p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 shadow-xl border border-white/5 hover:border-white/10"
//     >
//       <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#222] shrink-0 shadow-lg border border-white/10 relative">
//         {series.cover?.thumbnail
//           ? <img src={series.cover.thumbnail} alt={series.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
//           : <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
//         }
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="font-extrabold text-white truncate text-base group-hover:text-[#1ed760] transition-colors">{series.title}</p>
//         <p className="text-xs text-white/60 font-medium mt-0.5">by {series.author.displayName}</p>
//         <div className="flex items-center gap-2 mt-2 flex-wrap text-xs font-bold">
//           <span className={cn('capitalize font-extrabold', statusColors[series.completionStatus])}>
//             {series.completionStatus.replace('_', ' ')}
//           </span>
//           <span className="text-white/40">•</span>
//           <span className="text-white/60">{series.publishedChapters} ch</span>
//         </div>
//       </div>
//     </Link>
//   )
// }

// // ── Tag Search Page ───────────────────────────

// function TagSearchPage({ tag }: { tag: string }) {
//   const { data, isLoading } = useQuery({
//     queryKey: ['search', 'tag', tag],
//     queryFn : () => searchApi.byTag(tag, { limit: 20 }).then(r => r.data.data),
//   })

//   return (
//     <div className="space-y-6 max-w-4xl mx-auto pb-24 select-none">
//       <div className="flex items-center gap-5 bg-gradient-to-r from-[#282828] to-[#181818] border border-white/10 p-8 rounded-3xl shadow-2xl">
//         <div className="w-16 h-16 bg-[#1ed760]/20 rounded-2xl flex items-center justify-center border border-[#1ed760]/30 shrink-0 shadow-inner">
//           <Hash className="w-8 h-8 text-[#1ed760]" />
//         </div>
//         <div>
//           <h1 className="text-3xl font-black text-white tracking-tight">#{tag}</h1>
//           {data && <p className="text-xs font-bold text-white/60 mt-1 uppercase tracking-wider">{formatCount(data.pagination as unknown as number)} posts available</p>}
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center py-16"><Spinner size="lg" /></div>
//       ) : !data?.posts.length ? (
//         <EmptyState icon={<Hash className="w-8 h-8 text-white/40" />} title={`No posts with #${tag}`} />
//       ) : (
//         <div className="flex flex-col gap-4">
//           {data.posts.map(post => <PostCard key={post._id} post={post} />)}
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Trending Tags Row ─────────────────────────

// function TrendingTagsRow() {
//   const { data } = useQuery({
//     queryKey: ['trendingTags'],
//     queryFn : () => searchApi.trendingTags(15).then(r => r.data.data.tags),
//     staleTime: 300000,
//   })

//   if (!data?.length) return null

//   return (
//     <div className="space-y-4 max-w-5xl mx-auto">
//       <h2 className="text-2xl font-black text-white tracking-tight">Trending Tags</h2>
//       <div className="flex flex-wrap gap-3">
//         {data.map(t => (
//           <Link 
//             key={t.tag} 
//             to={`/search?tag=${t.tag}`}
//             className="flex items-center gap-2 px-4 py-2.5 bg-[#2a2a2a] hover:bg-[#333] border border-white/10 rounded-full text-xs font-bold text-white/80 hover:text-white transition-all shadow-md hover:border-[#1ed760] group"
//           >
//             <Hash className="w-3.5 h-3.5 text-[#1ed760] group-hover:scale-110 transition-transform" />
//             <span>{t.tag}</span>
//           </Link>
//         ))}
//       </div>
//     </div>
//   )
// }






import { useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, X, Hash, Play, Disc3, BookOpen, Radio, Sparkles } from 'lucide-react'
import { searchApi } from '../../api'
import { Avatar, Spinner, EmptyState } from '../../components/ui'
import { PostCard } from '../../components/post/PostCard'
import { cn, formatCount } from '../../utils'
import type { Post, Channel, Series } from '../../types'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [input, setInput]   = useState(searchParams.get('q') || '')
  const [query, setQuery]   = useState(searchParams.get('q') || '')
  const [tab, setTab]       = useState('posts')
  const [showAuto, setShowAuto] = useState(false)
  const inputRef            = useRef<HTMLInputElement>(null)
  const tagParam            = searchParams.get('tag')

  if (tagParam) return <TagSearchPage tag={tagParam} />

  const { data: autoData } = useQuery({
    queryKey: ['autocomplete', input],
    queryFn : () => searchApi.autocomplete(input).then(r => r.data.data),
    enabled : input.length >= 2 && showAuto,
    staleTime: 30000,
  })

  const handleSearch = (q: string) => {
    setQuery(q)
    setInput(q)
    setShowAuto(false)
    setSearchParams({ q })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch(input)
    if (e.key === 'Escape') setShowAuto(false)
  }

  const tabs = [
    { id: 'posts',    label: 'Posts', icon: <Disc3 className="w-4 h-4" /> },
    { id: 'channels', label: 'Channels', icon: <Radio className="w-4 h-4" /> },
    { id: 'series',   label: 'Series', icon: <BookOpen className="w-4 h-4" /> },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-24 select-none">
      
      {/* Spotify Top Search Header Bar */}
      <div className="relative max-w-2xl mx-auto pt-4">
        <div className="flex items-center gap-3 bg-[#242424] hover:bg-[#2a2a2a] focus-within:bg-[#2a2a2a] focus-within:ring-2 focus-within:ring-white border border-transparent rounded-full px-5 h-14 transition-all duration-300 shadow-2xl">
          <Search className="w-5 h-5 text-white/60 shrink-0" />
          <input
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); setShowAuto(true) }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowAuto(true)}
            placeholder="What do you want to listen to or read?"
            className="flex-1 bg-transparent text-white placeholder-white/50 text-sm md:text-base font-bold outline-none"
          />
          {input && (
            <button 
              onClick={() => { setInput(''); setQuery(''); setSearchParams({}) }} 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Spotify Autocomplete Dropdown Menu */}
        {showAuto && autoData?.suggestions && autoData.suggestions.length > 0 && (
          <div className="absolute top-full mt-3 left-0 right-0 bg-[#282828] border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden backdrop-blur-2xl">
            {autoData.suggestions.map(s => (
              <button
                key={s.id}
                onClick={() => handleSearch(s.handle || s.username || '')}
                className="flex items-center gap-4 w-full px-5 py-3.5 hover:bg-[#3e3e3e] transition-all text-left group border-b border-white/5 last:border-none"
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
                  <Avatar
                    src={s.type === 'channel' ? (s.logo as { thumbnail?: string })?.thumbnail : (s.avatar as { thumbnail?: string })?.thumbnail}
                    name={s.name || s.displayName}
                    size="md"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-[#1ed760] transition-colors">
                    {s.name || s.displayName}
                  </p>
                  <p className="text-xs text-white/60 truncate capitalize mt-0.5">
                    @{s.handle || s.username} • <span className="text-[#1ed760] font-bold">{s.type}</span>
                  </p>
                </div>
                {s.isVerified && (
                  <span className="text-xs bg-[#1ed760]/20 text-[#1ed760] px-2.5 py-1 rounded-full font-extrabold">Verified</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trending tags when no query */}
      {!query && (
        <div className="pt-6">
          <TrendingTagsRow />
        </div>
      )}

      {/* Results View */}
      {query && (
        <div className="space-y-8">
          {/* Spotify Pill Tab Switcher */}
          <div className="flex justify-center border-b border-white/10 pb-4">
            <div className="flex bg-[#222] p-1.5 rounded-full border border-white/5 shadow-inner gap-2">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black transition-all duration-300",
                    tab === t.id
                      ? "bg-white text-black shadow-lg scale-105"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            {tab === 'posts'    && <PostResults    query={query} />}
            {tab === 'channels' && <ChannelResults query={query} />}
            {tab === 'series'   && <SeriesResults  query={query} />}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Post Results ──────────────────────────────

function PostResults({ query }: { query: string }) {
  const [type, setType]         = useState('')
  const [language, setLanguage] = useState('')
  const [sort, setSort]         = useState('relevance')

  const { data, isLoading } = useQuery({
    queryKey: ['search', 'posts', query, type, language, sort],
    queryFn : () => searchApi.posts(query, { type: type || undefined, language: language || undefined, sort, limit: 20 }).then(r => r.data.data),
    enabled : query.length >= 2,
  })

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[{ v: '', l: 'All' }, { v: 'sayari', l: 'Sayari' }, { v: 'kavita', l: 'Kavita' }, { v: 'audio', l: 'Audio' }, { v: 'story_chapter', l: 'Story' }].map(f => (
          <button 
            key={f.v} 
            onClick={() => setType(f.v)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md',
              type === f.v ? 'bg-white text-black font-black' : 'bg-[#2a2a2a] text-white/80 hover:text-white hover:bg-[#333]'
            )}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {[{ v: 'relevance', l: 'Relevant' }, { v: 'newest', l: 'Newest' }, { v: 'popular', l: 'Popular' }].map(s => (
          <button 
            key={s.v} 
            onClick={() => setSort(s.v)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm',
              sort === s.v ? 'bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/40 font-black' : 'bg-[#2a2a2a] text-white/70 hover:text-white'
            )}
          >
            {s.l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !data?.posts.length ? (
        <EmptyState icon={<Search className="w-10 h-10 text-white/40" />} title={`No posts found for "${query}"`} description="Try different keywords or check spelling" />
      ) : (
        <div className="flex flex-col gap-6">
          {data.posts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
      )}
    </div>
  )
}

// ── Channel Results ───────────────────────────

function ChannelResults({ query }: { query: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['search', 'channels', query],
    queryFn : () => searchApi.channels(query, { limit: 20 }).then(r => r.data.data),
    enabled : query.length >= 2,
  })

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!data?.channels.length) return <EmptyState icon="📡" title={`No channels found for "${query}"`} description="Try searching by handle or channel name" />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.channels.map(channel => <ChannelSearchCard key={channel._id} channel={channel} />)}
    </div>
  )
}

function ChannelSearchCard({ channel }: { channel: Channel }) {
  return (
    <Link 
      to={`/@${channel.handle}`} 
      className="group bg-[#181818] hover:bg-[#282828] p-5 rounded-2xl transition-all duration-300 flex items-center gap-4 shadow-2xl border border-white/5 hover:border-white/20 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#1ed760]/5 rounded-full blur-xl group-hover:bg-[#1ed760]/10 transition-all" />
      
      <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white/10 shadow-xl z-10">
        <Avatar src={channel.logo?.thumbnail} name={channel.name} size="lg" className="w-full h-full object-cover" />
      </div>
      
      <div className="flex-1 min-w-0 z-10">
        <div className="flex items-center gap-2">
          <p className="font-extrabold text-white truncate text-base group-hover:text-[#1ed760] transition-colors">{channel.name}</p>
          {channel.isVerified && <span className="text-[10px] bg-[#1ed760]/20 text-[#1ed760] px-2 py-0.5 rounded-full font-black">Verified</span>}
        </div>
        <p className="text-xs text-white/50 font-mono mt-0.5">@{channel.handle}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[11px] font-bold text-white/60">{formatCount(channel.stats.followersCount)} followers</span>
        </div>
      </div>
    </Link>
  )
}

// ── Series Results ────────────────────────────

function SeriesResults({ query }: { query: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['search', 'series', query],
    queryFn : () => searchApi.series(query, { limit: 20 }).then(r => r.data.data),
    enabled : query.length >= 2,
  })

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  if (!data?.series.length) return <EmptyState icon="📚" title={`No series found for "${query}"`} />

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.series.map(s => <SeriesSearchCard key={s._id} series={s} />)}
    </div>
  )
}

function SeriesSearchCard({ series }: { series: Series }) {
  const statusColors: Record<string, string> = {
    ongoing  : 'text-emerald-400', completed: 'text-[#1ed760]',
    on_hiatus: 'text-amber-400', dropped  : 'text-rose-400',
  }
  return (
    <Link 
      to={`/series/${series._id}`} 
      className="group bg-[#181818] hover:bg-[#282828] p-5 rounded-2xl transition-all duration-300 flex items-center gap-5 shadow-2xl border border-white/5 hover:border-white/20 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all" />
      
      <div className="w-20 h-28 rounded-xl overflow-hidden bg-[#222] shrink-0 shadow-xl border border-white/10 relative z-10">
        {series.cover?.thumbnail
          ? <img src={series.cover.thumbnail} alt={series.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
        }
      </div>

      <div className="flex-1 min-w-0 z-10">
        <p className="font-black text-white truncate text-lg group-hover:text-[#1ed760] transition-colors">{series.title}</p>
        <p className="text-xs text-white/60 font-medium mt-1">by <span className="text-white font-bold">{series.author.displayName}</span></p>
        <div className="flex items-center gap-2 mt-3 flex-wrap text-xs font-bold">
          <span className={cn('capitalize font-extrabold px-2.5 py-0.5 rounded-full bg-black/40', statusColors[series.completionStatus])}>
            {series.completionStatus.replace('_', ' ')}
          </span>
          <span className="text-white/40">•</span>
          <span className="text-white/60">{series.publishedChapters} chapters</span>
        </div>
      </div>
    </Link>
  )
}

// ── Tag Search Page ───────────────────────────

function TagSearchPage({ tag }: { tag: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['search', 'tag', tag],
    queryFn : () => searchApi.byTag(tag, { limit: 20 }).then(r => r.data.data),
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 select-none">
      <div className="flex items-center gap-5 bg-gradient-to-r from-[#282828] to-[#181818] border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="w-16 h-16 bg-[#1ed760]/20 rounded-2xl flex items-center justify-center border border-[#1ed760]/30 shrink-0 shadow-inner">
          <Hash className="w-8 h-8 text-[#1ed760]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">#{tag}</h1>
          {data && <p className="text-xs font-bold text-white/60 mt-1 uppercase tracking-wider">{formatCount(data.pagination as unknown as number)} posts available</p>}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !data?.posts.length ? (
        <EmptyState icon={<Hash className="w-8 h-8 text-white/40" />} title={`No posts with #${tag}`} />
      ) : (
        <div className="flex flex-col gap-6">
          {data.posts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
      )}
    </div>
  )
}

// ── Trending Tags Row ─────────────────────────

function TrendingTagsRow() {
  const { data } = useQuery({
    queryKey: ['trendingTags'],
    queryFn : () => searchApi.trendingTags(15).then(r => r.data.data.tags),
    staleTime: 300000,
  })

  if (!data?.length) return null

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-black text-white tracking-tight">Trending Tags</h2>
      <div className="flex flex-wrap gap-3">
        {data.map(t => (
          <Link 
            key={t.tag} 
            to={`/search?tag=${t.tag}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2a2a2a] hover:bg-[#333] border border-white/10 rounded-full text-xs font-bold text-white/80 hover:text-white transition-all shadow-md hover:border-[#1ed760] group"
          >
            <Hash className="w-3.5 h-3.5 text-[#1ed760] group-hover:scale-110 transition-transform" />
            <span>{t.tag}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}