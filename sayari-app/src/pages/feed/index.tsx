// import { useState } from 'react'
// import { useInfiniteQuery } from '@tanstack/react-query'
// import { Link } from 'react-router-dom'
// import { TrendingUp, Compass, Sparkles, Music, BookOpen, Flame } from 'lucide-react'
// import { feedApi, searchApi } from '../../api'
// import { useAuthStore } from '../../store/auth.store'
// import { PostCard } from '../../components/post/PostCard'
// import { Avatar, Button, PageSpinner, EmptyState, Tabs } from '../../components/ui'
// import { cn, MOOD_LABELS } from '../../utils'
// import type { Post, AuthUser } from '../../types'

// // ── Infinite scroll hook ──────────────────────

// function useInfiniteFeed<T extends { posts: Post[]; pagination?: { pages?: number } }>(
//   queryKey: unknown[],
//   fetcher: (page: number) => Promise<T>
// ) {
//   return useInfiniteQuery({
//     queryKey,
//     queryFn       : ({ pageParam }) => fetcher(pageParam as number),
//     initialPageParam: 1,
//     getNextPageParam: (last, _, lastPageParam) => {
//       const pages = last.pagination?.pages
//       return pages && (lastPageParam as number) < pages ? (lastPageParam as number) + 1 : undefined
//     },
//   })
// }

// // ─────────────────────────────────────────────
// //  HOME PAGE
// // ─────────────────────────────────────────────

// export function HomePage() {
//   const { isAuthenticated } = useAuthStore()
//   const [tab, setTab] = useState('explore')

//   const tabs = [
//     { id: 'explore',  label: 'Explore',  icon: <Compass className="w-4 h-4" /> },
//     { id: 'trending', label: 'Trending', icon: <Flame className="w-4 h-4" /> },
//     ...(isAuthenticated ? [
//       { id: 'forYou',  label: 'For You',  icon: <Sparkles className="w-4 h-4" /> },
//       { id: 'new',     label: 'New',      icon: <BookOpen className="w-4 h-4" /> },
//     ] : []),
//   ]

//   return (
//     <div>
//       <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6 -mx-4 px-4 sticky top-14 bg-[#0F0F0F] z-30 pt-2" />

//       {tab === 'explore'  && <ExploreFeed />}
//       {tab === 'trending' && <TrendingFeed />}
//       {tab === 'forYou'   && isAuthenticated && <ForYouFeed />}
//       {tab === 'new'      && isAuthenticated && <NewReleasesFeed />}
//     </div>
//   )
// }

// // ── Explore Feed ──────────────────────────────

// function ExploreFeed() {
//   const [type, setType]       = useState('')
//   const [language, setLanguage] = useState('')

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
//     ['feed', 'explore', type, language],
//     (page) => feedApi.explore({ type: (type || undefined) as Post['type'] | undefined, language: (language || undefined) as Post['language'] | undefined, page, limit: 10 }).then(r => r.data.data)
//   )

//   const posts = data?.pages.flatMap(p => p.posts) ?? []

//   return (
//     <div>
//       {/* Filters */}
//       <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
//         {[
//           { v: '', l: '✨ All' },
//           { v: 'sayari', l: '📝 Sayari' },
//           { v: 'kavita', l: '🌸 Kavita' },
//           { v: 'ghazal', l: '🎭 Ghazal' },
//           { v: 'audio', l: '🎙️ Audio' },
//           { v: 'story_chapter', l: '📖 Story' },
//         ].map(f => (
//           <button
//             key={f.v}
//             onClick={() => setType(f.v)}
//             className={cn(
//               'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
//               type === f.v
//                 ? 'bg-[#6C63FF] text-white'
//                 : 'bg-[#1A1A1A] text-[#888] hover:text-white border border-[#2E2E2E]'
//             )}
//           >
//             {f.l}
//           </button>
//         ))}
//       </div>

//       {/* Language filter */}
//       <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
//         {[{ v: '', l: 'All' }, { v: 'hi', l: 'हिंदी' }, { v: 'ur', l: 'اردو' }, { v: 'en', l: 'English' }].map(f => (
//           <button
//             key={f.v}
//             onClick={() => setLanguage(f.v)}
//             className={cn(
//               'shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors',
//               language === f.v
//                 ? 'bg-[#FF6584]/20 text-[#FF6584] border border-[#FF6584]/30'
//                 : 'bg-[#1A1A1A] text-[#888] border border-[#2E2E2E] hover:text-white'
//             )}
//           >
//             {f.l}
//           </button>
//         ))}
//       </div>

//       <PostFeedList posts={posts} isLoading={isLoading} />
//       {hasNextPage && (
//         <div className="flex justify-center mt-6">
//           <Button variant="outline" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>
//             Load more
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Trending Feed ─────────────────────────────

// function TrendingFeed() {
//   const [period, setPeriod] = useState<'hourly' | 'daily' | 'weekly'>('daily')

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
//     ['feed', 'trending', period],
//     (page) => feedApi.trending({ period, page, limit: 10 }).then(r => r.data.data)
//   )

//   const posts = data?.pages.flatMap(p => p.posts) ?? []

//   return (
//     <div>
//       <div className="flex gap-2 mb-6">
//         {(['hourly', 'daily', 'weekly'] as const).map(p => (
//           <button
//             key={p}
//             onClick={() => setPeriod(p)}
//             className={cn(
//               'px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize',
//               period === p ? 'bg-[#6C63FF] text-white' : 'bg-[#1A1A1A] text-[#888] border border-[#2E2E2E] hover:text-white'
//             )}
//           >
//             {p}
//           </button>
//         ))}
//       </div>
//       <PostFeedList posts={posts} isLoading={isLoading} />
//       {hasNextPage && (
//         <div className="flex justify-center mt-6">
//           <Button variant="outline" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>Load more</Button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── For You Feed ──────────────────────────────

// function ForYouFeed() {
//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
//     ['feed', 'forYou'],
//     (page) => feedApi.forYou({ page, limit: 10 }).then(r => r.data.data)
//   )

//   const posts = data?.pages.flatMap(p => p.posts) ?? []

//   return (
//     <div>
//       {!isLoading && posts.length === 0 && (
//         <EmptyState
//           icon="✨"
//           title="Your feed is empty"
//           description="Follow some creators to see their posts here"
//           action={<Link to="/explore"><Button>Explore Creators</Button></Link>}
//         />
//       )}
//       <PostFeedList posts={posts} isLoading={isLoading} />
//       {hasNextPage && (
//         <div className="flex justify-center mt-6">
//           <Button variant="outline" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>Load more</Button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── New Releases Feed ─────────────────────────

// function NewReleasesFeed() {
//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
//     ['feed', 'new'],
//     (page) => feedApi.newReleases({ page, limit: 10 }).then(r => r.data.data)
//   )

//   const posts = data?.pages.flatMap(p => p.posts) ?? []

//   return (
//     <div>
//       {!isLoading && posts.length === 0 && (
//         <EmptyState
//           icon="📖"
//           title="No new releases"
//           description="Follow more creators to see their latest posts"
//           action={<Link to="/explore"><Button>Discover Creators</Button></Link>}
//         />
//       )}
//       <PostFeedList posts={posts} isLoading={isLoading} />
//       {hasNextPage && (
//         <div className="flex justify-center mt-6">
//           <Button variant="outline" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>Load more</Button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Explore Page (full page) ──────────────────

// export function ExplorePage() {
//   const { data: topCreators } = useInfiniteQuery({
//     queryKey: ['feed', 'topCreators'],
//     queryFn : () => feedApi.topCreators({ limit: 8 }).then(r => r.data.data.creators),
//     initialPageParam: 1,
//     getNextPageParam: () => undefined,
//   })

//   const creators = topCreators?.pages.flat() ?? []

//   return (
//     <div className="flex flex-col gap-8">
//       {/* Top Creators */}
//       {creators.length > 0 && (
//         <section>
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-bold text-white flex items-center gap-2">
//               <TrendingUp className="w-5 h-5 text-[#6C63FF]" /> Top Creators
//             </h2>
//             <Link to="/creators" className="text-sm text-[#6C63FF] hover:underline">See all</Link>
//           </div>
//           <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
//             {creators.map(creator => <CreatorPill key={creator._id} creator={creator} />)}
//           </div>
//         </section>
//       )}

//       {/* Trending Tags */}
//       <TrendingTagsSection />

//       {/* Mood Feeds */}
//       <section>
//         <h2 className="text-lg font-bold text-white mb-4">Browse by Mood</h2>
//         <div className="grid grid-cols-2 gap-3">
//           {Object.entries(MOOD_LABELS).map(([mood, label]) => (
//             <Link
//               key={mood}
//               to={`/mood/${mood}`}
//               className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-4 text-center hover:border-[#6C63FF] transition-colors"
//             >
//               <div className="text-2xl mb-1">{label.split(' ')[0]}</div>
//               <p className="text-sm text-white font-medium">{label.split(' ').slice(1).join(' ')}</p>
//             </Link>
//           ))}
//         </div>
//       </section>
//     </div>
//   )
// }

// // ── Mood Feed Page ────────────────────────────

// export function MoodFeedPage() {
//   const mood = window.location.pathname.split('/mood/')[1]

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
//     ['feed', 'mood', mood],
//     (page) => feedApi.moodFeed(mood, { page }).then(r => r.data.data)
//   )

//   const posts = data?.pages.flatMap(p => p.posts) ?? []
//   const label = MOOD_LABELS[mood] || mood

//   return (
//     <div>
//       <div className="flex items-center gap-3 mb-6">
//         <div className="text-4xl">{label.split(' ')[0]}</div>
//         <div>
//           <h1 className="text-2xl font-bold text-white">{label.split(' ').slice(1).join(' ')}</h1>
//           <p className="text-[#888] text-sm">{posts.length} posts</p>
//         </div>
//       </div>
//       <PostFeedList posts={posts} isLoading={isLoading} />
//       {hasNextPage && (
//         <div className="flex justify-center mt-6">
//           <Button variant="outline" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>Load more</Button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Shared: Post Feed List ────────────────────

// export function PostFeedList({ posts, isLoading }: { posts: Post[]; isLoading: boolean }) {
//   if (isLoading) return (
//     <div className="flex flex-col gap-4">
//       {Array.from({ length: 3 }).map((_, i) => (
//         <div key={i} className="bg-[#1A1A1A] rounded-2xl overflow-hidden animate-pulse">
//           <div className="flex items-center gap-3 p-4">
//             <div className="w-10 h-10 rounded-full bg-[#242424]" />
//             <div className="flex-1 space-y-2">
//               <div className="h-3 bg-[#242424] rounded w-1/3" />
//               <div className="h-3 bg-[#242424] rounded w-1/4" />
//             </div>
//           </div>
//           <div className="aspect-square bg-[#242424]" />
//           <div className="h-12 bg-[#1A1A1A]" />
//         </div>
//       ))}
//     </div>
//   )

//   if (!posts.length) return (
//     <EmptyState icon="📝" title="No posts here yet" description="Check back later or explore other sections" />
//   )

//   return (
//     <div className="flex flex-col gap-4">
//       {posts.map(post => <PostCard key={post._id} post={post} />)}
//     </div>
//   )
// }

// // ── Creator Pill ──────────────────────────────

// function CreatorPill({ creator }: { creator: AuthUser }) {
//   return (
//     <Link to={`/@${creator.username}`} className="flex flex-col items-center gap-2 p-3 bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl min-w-[90px] hover:border-[#6C63FF] transition-colors">
//       <Avatar user={creator} size="md" />
//       <div className="text-center">
//         <p className="text-xs font-semibold text-white truncate max-w-[80px]">{creator.displayName}</p>
//         <p className="text-[10px] text-[#888] truncate">@{creator.username}</p>
//       </div>
//       {creator.isVerified && <span className="text-xs">✅</span>}
//     </Link>
//   )
// }

// // ── Trending Tags Section ─────────────────────

// function TrendingTagsSection() {
//   const { data } = useInfiniteQuery({
//     queryKey: ['search', 'trendingTags'],
//     queryFn : () => searchApi.trendingTags(20).then(r => r.data.data.tags),
//     initialPageParam: 1,
//     getNextPageParam: () => undefined,
//   })

//   const tags = data?.pages.flat() ?? []
//   if (!tags.length) return null

//   return (
//     <section>
//       <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
//         <TrendingUp className="w-5 h-5 text-[#FF6584]" /> Trending Tags
//       </h2>
//       <div className="flex flex-wrap gap-2">
//         {tags.map(t => (
//           <Link
//             key={t.tag}
//             to={`/search?tag=${t.tag}`}
//             className="px-3 py-1.5 bg-[#1A1A1A] border border-[#2E2E2E] rounded-full text-sm text-[#888] hover:text-[#6C63FF] hover:border-[#6C63FF] transition-colors"
//           >
//             #{t.tag}
//           </Link>
//         ))}
//       </div>
//     </section>
//   )
// }













// import { useState, useRef, useEffect } from 'react'
// import { useInfiniteQuery } from '@tanstack/react-query'
// import { Link } from 'react-router-dom'
// import { 
//   TrendingUp, Compass, Sparkles, Music, BookOpen, Flame, 
//   ArrowRight, Clock, Eye, Heart as HeartIcon, MessageCircle,
//   Share2, MoreHorizontal, Play, Pause, Volume2
// } from 'lucide-react'
// import { feedApi, searchApi } from '../../api'
// import { useAuthStore } from '../../store/auth.store'
// import { PostCard } from '../../components/post/PostCard'
// import { Avatar, Button, PageSpinner, EmptyState, Tabs } from '../../components/ui'
// import { cn, MOOD_LABELS } from '../../utils'
// import type { Post, AuthUser } from '../../types'

// // ── Infinite scroll hook ──────────────────────

// function useInfiniteFeed<T extends { posts: Post[]; pagination?: { pages?: number } }>(
//   queryKey: unknown[],
//   fetcher: (page: number) => Promise<T>
// ) {
//   return useInfiniteQuery({
//     queryKey,
//     queryFn       : ({ pageParam }) => fetcher(pageParam as number),
//     initialPageParam: 1,
//     getNextPageParam: (last, _, lastPageParam) => {
//       const pages = last.pagination?.pages
//       return pages && (lastPageParam as number) < pages ? (lastPageParam as number) + 1 : undefined
//     },
//   })
// }

// // ─────────────────────────────────────────────
// //  HOME PAGE
// // ─────────────────────────────────────────────

// export function HomePage() {
//   const { isAuthenticated } = useAuthStore()
//   const [tab, setTab] = useState('explore')
//   const tabsRef = useRef<HTMLDivElement>(null)

//   const tabs = [
//     { id: 'explore',  label: 'Explore',  icon: <Compass className="w-4 h-4" /> },
//     { id: 'trending', label: 'Trending', icon: <Flame className="w-4 h-4" /> },
//     ...(isAuthenticated ? [
//       { id: 'forYou',  label: 'For You',  icon: <Sparkles className="w-4 h-4" /> },
//       { id: 'new',     label: 'New',      icon: <BookOpen className="w-4 h-4" /> },
//     ] : []),
//   ]

//   return (
//     <div className="relative">
//       {/* Enhanced Tab Bar */}
//       <div 
//         ref={tabsRef}
//         className="sticky top-0 z-30 bg-gradient-to-b from-bg via-bg/95 to-transparent pt-4 pb-2 -mx-4 px-4 backdrop-blur-sm"
//       >
//         <div className="flex gap-1 p-1 bg-surface/50 rounded-2xl border border-border/50">
//           {tabs.map((t) => (
//             <button
//               key={t.id}
//               onClick={() => setTab(t.id)}
//               className={cn(
//                 "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
//                 tab === t.id
//                   ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[0.98]"
//                   : "text-muted hover:text-text hover:bg-surface2/50"
//               )}
//             >
//               {t.icon}
//               <span className="hidden sm:inline">{t.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Content with animation */}
//       <div className="mt-4 animate-fadeIn">
//         {tab === 'explore'  && <ExploreFeed />}
//         {tab === 'trending' && <TrendingFeed />}
//         {tab === 'forYou'   && isAuthenticated && <ForYouFeed />}
//         {tab === 'new'      && isAuthenticated && <NewReleasesFeed />}
//       </div>
//     </div>
//   )
// }

// // ── Explore Feed ──────────────────────────────

// function ExploreFeed() {
//   const [type, setType] = useState('')
//   const [language, setLanguage] = useState('')

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
//     ['feed', 'explore', type, language],
//     (page) => feedApi.explore({ type: (type || undefined) as Post['type'] | undefined, language: (language || undefined) as Post['language'] | undefined, page, limit: 10 }).then(r => r.data.data)
//   )

//   const posts = data?.pages.flatMap(p => p.posts) ?? []

//   return (
//     <div>
//       {/* Enhanced Filters - Scrollable Pills */}
//       <div className="relative">
//         <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
//           {[
//             { v: '', l: '✨ All', icon: null },
//             { v: 'sayari', l: '📝 Sayari', icon: null },
//             { v: 'kavita', l: '🌸 Kavita', icon: null },
//             { v: 'ghazal', l: '🎭 Ghazal', icon: null },
//             { v: 'audio', l: '🎙️ Audio', icon: null },
//             { v: 'story_chapter', l: '📖 Story', icon: null },
//           ].map(f => (
//             <button
//               key={f.v}
//               onClick={() => setType(f.v)}
//               className={cn(
//                 'shrink-0 snap-start px-5 py-2 rounded-full text-sm font-medium transition-all duration-300',
//                 type === f.v
//                   ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30 scale-[0.97]'
//                   : 'bg-surface2/50 text-muted hover:text-text hover:bg-surface2 border border-border/50'
//               )}
//             >
//               {f.l}
//             </button>
//           ))}
//         </div>
//         {/* Gradient fade on edges */}
//         <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-bg to-transparent pointer-events-none" />
//       </div>

//       {/* Language filter - Enhanced */}
//       <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
//         {[{ v: '', l: '🌐 All' }, { v: 'hi', l: '🇮🇳 हिंदी' }, { v: 'ur', l: '🇵🇰 اردو' }, { v: 'en', l: '🇬🇧 English' }].map(f => (
//           <button
//             key={f.v}
//             onClick={() => setLanguage(f.v)}
//             className={cn(
//               'shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
//               language === f.v
//                 ? 'bg-accent/20 text-accent border border-accent/30 shadow-sm'
//                 : 'bg-surface2/30 text-muted border border-border/30 hover:text-text hover:border-border'
//             )}
//           >
//             {f.l}
//           </button>
//         ))}
//       </div>

//       <PostFeedList posts={posts} isLoading={isLoading} />
      
//       {hasNextPage && (
//         <div className="flex justify-center mt-8">
//           <Button 
//             variant="outline" 
//             onClick={() => fetchNextPage()} 
//             loading={isFetchingNextPage}
//             className="px-8 py-3 rounded-full border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
//           >
//             Load more posts
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Trending Feed ─────────────────────────────

// function TrendingFeed() {
//   const [period, setPeriod] = useState<'hourly' | 'daily' | 'weekly'>('daily')

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
//     ['feed', 'trending', period],
//     (page) => feedApi.trending({ period, page, limit: 10 }).then(r => r.data.data)
//   )

//   const posts = data?.pages.flatMap(p => p.posts) ?? []

//   return (
//     <div>
//       {/* Enhanced Period Selector */}
//       <div className="flex gap-2 mb-6 p-1 bg-surface/30 rounded-2xl border border-border/30 w-fit">
//         {(['hourly', 'daily', 'weekly'] as const).map(p => (
//           <button
//             key={p}
//             onClick={() => setPeriod(p)}
//             className={cn(
//               'px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-300',
//               period === p 
//                 ? 'bg-primary text-white shadow-lg shadow-primary/20' 
//                 : 'text-muted hover:text-text hover:bg-surface2/50'
//             )}
//           >
//             {p}
//           </button>
//         ))}
//       </div>
      
//       <PostFeedList posts={posts} isLoading={isLoading} />
      
//       {hasNextPage && (
//         <div className="flex justify-center mt-8">
//           <Button 
//             variant="outline" 
//             onClick={() => fetchNextPage()} 
//             loading={isFetchingNextPage}
//             className="px-8 py-3 rounded-full border-border/50 hover:border-primary/50"
//           >
//             Load more
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── For You Feed ──────────────────────────────

// function ForYouFeed() {
//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
//     ['feed', 'forYou'],
//     (page) => feedApi.forYou({ page, limit: 10 }).then(r => r.data.data)
//   )

//   const posts = data?.pages.flatMap(p => p.posts) ?? []

//   return (
//     <div>
//       {!isLoading && posts.length === 0 && (
//         <EmptyState
//           icon="✨"
//           title="Your feed is empty"
//           description="Follow some creators to see their posts here"
//           action={
//             <Link to="/explore">
//               <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
//                 Explore Creators
//               </Button>
//             </Link>
//           }
//         />
//       )}
//       <PostFeedList posts={posts} isLoading={isLoading} />
//       {hasNextPage && (
//         <div className="flex justify-center mt-8">
//           <Button 
//             variant="outline" 
//             onClick={() => fetchNextPage()} 
//             loading={isFetchingNextPage}
//             className="px-8 py-3 rounded-full"
//           >
//             Load more
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── New Releases Feed ─────────────────────────

// function NewReleasesFeed() {
//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
//     ['feed', 'new'],
//     (page) => feedApi.newReleases({ page, limit: 10 }).then(r => r.data.data)
//   )

//   const posts = data?.pages.flatMap(p => p.posts) ?? []

//   return (
//     <div>
//       {!isLoading && posts.length === 0 && (
//         <EmptyState
//           icon="📖"
//           title="No new releases"
//           description="Follow more creators to see their latest posts"
//           action={
//             <Link to="/explore">
//               <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
//                 Discover Creators
//               </Button>
//             </Link>
//           }
//         />
//       )}
//       <PostFeedList posts={posts} isLoading={isLoading} />
//       {hasNextPage && (
//         <div className="flex justify-center mt-8">
//           <Button 
//             variant="outline" 
//             onClick={() => fetchNextPage()} 
//             loading={isFetchingNextPage}
//             className="px-8 py-3 rounded-full"
//           >
//             Load more
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Explore Page (full page) ──────────────────

// export function ExplorePage() {
//   const { data: topCreators } = useInfiniteQuery({
//     queryKey: ['feed', 'topCreators'],
//     queryFn : () => feedApi.topCreators({ limit: 8 }).then(r => r.data.data.creators),
//     initialPageParam: 1,
//     getNextPageParam: () => undefined,
//   })

//   const creators = topCreators?.pages.flat() ?? []

//   return (
//     <div className="flex flex-col gap-10 pb-8">
//       {/* Top Creators - Enhanced */}
//       {creators.length > 0 && (
//         <section>
//           <div className="flex items-center justify-between mb-5">
//             <h2 className="text-xl font-bold text-text flex items-center gap-2">
//               <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
//                 <TrendingUp className="w-5 h-5 text-primary" />
//               </div>
//               Top Creators
//             </h2>
//             <Link 
//               to="/creators" 
//               className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors group"
//             >
//               See all 
//               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//             </Link>
//           </div>
//           <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
//             {creators.map(creator => <CreatorPill key={creator._id} creator={creator} />)}
//           </div>
//         </section>
//       )}

//       {/* Trending Tags */}
//       <TrendingTagsSection />

//       {/* Mood Feeds - Enhanced Grid */}
//       <section>
//         <h2 className="text-xl font-bold text-text mb-5 flex items-center gap-2">
//           <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
//             <Music className="w-5 h-5 text-accent" />
//           </div>
//           Browse by Mood
//         </h2>
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//           {Object.entries(MOOD_LABELS).map(([mood, label]) => {
//             const emoji = label.split(' ')[0]
//             const text = label.split(' ').slice(1).join(' ')
//             return (
//               <Link
//                 key={mood}
//                 to={`/mood/${mood}`}
//                 className="group relative bg-gradient-to-br from-surface2/50 to-surface2/20 border border-border/50 rounded-2xl p-5 text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                 <div className="relative">
//                   <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{emoji}</div>
//                   <p className="text-sm text-text font-medium group-hover:text-primary transition-colors">
//                     {text}
//                   </p>
//                 </div>
//               </Link>
//             )
//           })}
//         </div>
//       </section>
//     </div>
//   )
// }

// // ── Mood Feed Page ────────────────────────────

// export function MoodFeedPage() {
//   const mood = window.location.pathname.split('/mood/')[1]

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
//     ['feed', 'mood', mood],
//     (page) => feedApi.moodFeed(mood, { page }).then(r => r.data.data)
//   )

//   const posts = data?.pages.flatMap(p => p.posts) ?? []
//   const label = MOOD_LABELS[mood] || mood
//   const emoji = label.split(' ')[0]
//   const text = label.split(' ').slice(1).join(' ')

//   return (
//     <div>
//       {/* Mood Header - Enhanced */}
//       <div className="relative mb-8 p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/20 overflow-hidden">
//         <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
//         <div className="relative flex items-center gap-5">
//           <div className="text-5xl animate-float">{emoji}</div>
//           <div>
//             <h1 className="text-3xl font-bold text-text">{text}</h1>
//             <p className="text-muted text-sm mt-1">{posts.length} posts in this mood</p>
//           </div>
//         </div>
//       </div>
      
//       <PostFeedList posts={posts} isLoading={isLoading} />
      
//       {hasNextPage && (
//         <div className="flex justify-center mt-8">
//           <Button 
//             variant="outline" 
//             onClick={() => fetchNextPage()} 
//             loading={isFetchingNextPage}
//             className="px-8 py-3 rounded-full"
//           >
//             Load more
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Shared: Post Feed List ────────────────────

// export function PostFeedList({ posts, isLoading }: { posts: Post[]; isLoading: boolean }) {
//   if (isLoading) return (
//     <div className="flex flex-col gap-4">
//       {Array.from({ length: 3 }).map((_, i) => (
//         <div key={i} className="bg-surface2/30 rounded-2xl overflow-hidden animate-pulse border border-border/30">
//           <div className="flex items-center gap-3 p-4">
//             <div className="w-10 h-10 rounded-full bg-surface2/80" />
//             <div className="flex-1 space-y-2">
//               <div className="h-3 bg-surface2/80 rounded w-1/3" />
//               <div className="h-2 bg-surface2/80 rounded w-1/4" />
//             </div>
//           </div>
//           <div className="aspect-video bg-surface2/80" />
//           <div className="h-12 bg-surface/50" />
//         </div>
//       ))}
//     </div>
//   )

//   if (!posts.length) return (
//     <div className="flex flex-col items-center justify-center py-20">
//       <div className="text-6xl mb-4">📝</div>
//       <h3 className="text-xl font-semibold text-text mb-2">No posts here yet</h3>
//       <p className="text-muted text-sm">Check back later or explore other sections</p>
//     </div>
//   )

//   return (
//     <div className="flex flex-col gap-6">
//       {posts.map((post) => (
//         <div key={post._id} className="animate-slideUp">
//           <PostCard post={post} />
//         </div>
//       ))}
//     </div>
//   )
// }

// // ── Creator Pill ──────────────────────────────

// function CreatorPill({ creator }: { creator: AuthUser }) {
//   return (
//     <Link 
//       to={`/@${creator.username}`} 
//       className="flex flex-col items-center gap-3 p-4 bg-surface2/30 border border-border/50 rounded-2xl min-w-[110px] hover:border-primary/50 hover:bg-surface2/50 transition-all duration-300 group snap-start"
//     >
//       <div className="relative">
//         <Avatar user={creator} size="lg" className="ring-2 ring-transparent group-hover:ring-primary/30 transition-all" />
//         {creator.isVerified && (
//           <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-[10px] border-2 border-bg">
//             ✓
//           </div>
//         )}
//       </div>
//       <div className="text-center">
//         <p className="text-sm font-semibold text-text truncate max-w-[90px] group-hover:text-primary transition-colors">
//           {creator.displayName}
//         </p>
//         <p className="text-[10px] text-muted truncate">@{creator.username}</p>
//       </div>
//     </Link>
//   )
// }

// // ── Trending Tags Section ─────────────────────

// function TrendingTagsSection() {
//   const { data } = useInfiniteQuery({
//     queryKey: ['search', 'trendingTags'],
//     queryFn : () => searchApi.trendingTags(20).then(r => r.data.data.tags),
//     initialPageParam: 1,
//     getNextPageParam: () => undefined,
//   })

//   const tags = data?.pages.flat() ?? []
//   if (!tags.length) return null

//   return (
//     <section>
//       <h2 className="text-xl font-bold text-text mb-5 flex items-center gap-2">
//         <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
//           <Flame className="w-5 h-5 text-accent" />
//         </div>
//         Trending Tags
//       </h2>
//       <div className="flex flex-wrap gap-2.5">
//         {tags.map((t, index) => (
//           <Link
//             key={t.tag}
//             to={`/search?tag=${t.tag}`}
//             className="group relative px-4 py-2 bg-surface2/30 border border-border/50 rounded-full text-sm text-muted hover:text-primary hover:border-primary/50 transition-all duration-300 overflow-hidden"
//             style={{ animationDelay: `${index * 50}ms` }}
//           >
//             <span className="relative z-10">#{t.tag}</span>
//             <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//           </Link>
//         ))}
//       </div>
//     </section>
//   )
// }

































// import { useState, useRef, useEffect } from 'react'
// import { useInfiniteQuery } from '@tanstack/react-query'
// import { Link } from 'react-router-dom'
// import { 
//   TrendingUp, Compass, Sparkles, Music, BookOpen, Flame, 
//   ArrowRight, ChevronDown, Globe, X
// } from 'lucide-react'
// import { feedApi, searchApi } from '../../api'
// import { useAuthStore } from '../../store/auth.store'
// import { PostCard } from '../../components/post/PostCard'
// import { Avatar, Button, PageSpinner, EmptyState } from '../../components/ui'
// import { cn, MOOD_LABELS } from '../../utils'
// import type { Post, AuthUser } from '../../types'

// // ── Infinite scroll hook ──────────────────────

// function useInfiniteFeed<T extends { posts: Post[]; pagination?: { pages?: number } }>(
//   queryKey: unknown[],
//   fetcher: (page: number) => Promise<T>
// ) {
//   return useInfiniteQuery({
//     queryKey,
//     queryFn       : ({ pageParam }) => fetcher(pageParam as number),
//     initialPageParam: 1,
//     getNextPageParam: (last, _, lastPageParam) => {
//       const pages = last.pagination?.pages
//       return pages && (lastPageParam as number) < pages ? (lastPageParam as number) + 1 : undefined
//     },
//   })
// }

// // ─────────────────────────────────────────────
// //  HOME PAGE
// // ─────────────────────────────────────────────

// export function HomePage() {
//   const { isAuthenticated } = useAuthStore()
//   const [activeFilter, setActiveFilter] = useState('all')
//   const [selectedLanguage, setSelectedLanguage] = useState('all')
//   const [isLanguageOpen, setIsLanguageOpen] = useState(false)
//   const dropdownRef = useRef<HTMLDivElement>(null)

//   // Close dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsLanguageOpen(false)
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     return () => document.removeEventListener('mousedown', handleClickOutside)
//   }, [])

//   const filters = [
//     { id: 'all', label: 'All', icon: null },
//     { id: 'sayari', label: 'Sayari', icon: null },
//     { id: 'kavita', label: 'Kavita', icon: null },
//     { id: 'ghazal', label: 'Ghazal', icon: null },
//     { id: 'audio', label: 'Audio', icon: null },
//     { id: 'story_chapter', label: 'Story', icon: null },
//   ]

//   const languages = [
//     { id: 'all', label: '🌐 All Languages', flag: '🌐' },
//     { id: 'hi', label: 'हिंदी', flag: '🇮🇳' },
//     { id: 'ur', label: 'اردو', flag: '🇵🇰' },
//     { id: 'en', label: 'English', flag: '🇬🇧' },
//   ]

//   const getLanguageLabel = (id: string) => {
//     const lang = languages.find(l => l.id === id)
//     return lang ? lang.label : '🌐 All Languages'
//   }

//   return (
//     <div>
//       {/* Top Navigation Bar - Filters + Language Dropdown */}
//       <div className="sticky top-0 z-30 bg-gradient-to-b from-bg via-bg/95 to-transparent pt-4 pb-2  -mx-4 px-4 backdrop-blur-sm">
//         <div className="flex items-center gap-3">
//           {/* Filter Buttons - Horizontal Scroll */}
//           <div className="flex-1 overflow-x-auto scrollbar-hide">
//             <div className="flex gap-2 min-w-max">
//               {filters.map((filter) => (
//                 <button
//                   key={filter.id}
//                   onClick={() => setActiveFilter(filter.id)}
//                   className={cn(
//                     "shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
//                     activeFilter === filter.id
//                       ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30"
//                       : "bg-surface2/50 text-muted hover:text-text hover:bg-surface2 border border-border/50"
//                   )}
//                 >
//                   {filter.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Language Dropdown */}
//           <div className="relative" ref={dropdownRef}>
//             <button
//               onClick={() => setIsLanguageOpen(!isLanguageOpen)}
//               className={cn(
//                 "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
//                 isLanguageOpen || selectedLanguage !== 'all'
//                   ? "bg-primary/10 text-primary border border-primary/30"
//                   : "bg-surface2/50 text-muted hover:text-text hover:bg-surface2 border border-border/50"
//               )}
//             >
//               <Globe className="w-4 h-4" />
//               <span className="hidden sm:inline">{getLanguageLabel(selectedLanguage)}</span>
//               <span className="sm:hidden">
//                 {languages.find(l => l.id === selectedLanguage)?.flag || '🌐'}
//               </span>
//               <ChevronDown className={cn(
//                 "w-4 h-4 transition-transform duration-300",
//                 isLanguageOpen && "rotate-180"
//               )} />
//             </button>

//             {/* Custom Dropdown */}
//             {isLanguageOpen && (
//               <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-slideDown z-50">
//                 <div className="p-2">
//                   {languages.map((lang) => (
//                     <button
//                       key={lang.id}
//                       onClick={() => {
//                         setSelectedLanguage(lang.id)
//                         setIsLanguageOpen(false)
//                       }}
//                       className={cn(
//                         "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200",
//                         selectedLanguage === lang.id
//                           ? "bg-primary/10 text-primary"
//                           : "text-text hover:bg-surface2"
//                       )}
//                     >
//                       <span className="text-xl">{lang.flag}</span>
//                       <span className="flex-1 text-left">{lang.label}</span>
//                       {selectedLanguage === lang.id && (
//                         <span className="w-2 h-2 bg-primary rounded-full" />
//                       )}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="mt-4">
//         <FeedContent 
//           filter={activeFilter} 
//           language={selectedLanguage} 
//         />
//       </div>
//     </div>
//   )
// }

// // ── Feed Content ──────────────────────────────

// function FeedContent({ filter, language }: { filter: string; language: string }) {
//   const type = filter === 'all' ? '' : filter
//   const lang = language === 'all' ? '' : language

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
//     ['feed', 'explore', type, lang],
//     (page) => feedApi.explore({ 
//       type: (type || undefined) as Post['type'] | undefined, 
//       language: (lang || undefined) as Post['language'] | undefined, 
//       page, 
//       limit: 10 
//     }).then(r => r.data.data)
//   )

//   const posts = data?.pages.flatMap(p => p.posts) ?? []

//   return (
//     <div>
//       <PostFeedList posts={posts} isLoading={isLoading} />
      
//       {hasNextPage && (
//         <div className="flex justify-center mt-8">
//           <Button 
//             variant="outline" 
//             onClick={() => fetchNextPage()} 
//             loading={isFetchingNextPage}
//             className="px-8 py-3 rounded-full border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
//           >
//             Load more posts
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Explore Page (full page) ──────────────────

// export function ExplorePage() {
//   const { data: topCreators } = useInfiniteQuery({
//     queryKey: ['feed', 'topCreators'],
//     queryFn : () => feedApi.topCreators({ limit: 8 }).then(r => r.data.data.creators),
//     initialPageParam: 1,
//     getNextPageParam: () => undefined,
//   })

//   const creators = topCreators?.pages.flat() ?? []

//   return (
//     <div className="flex flex-col gap-10 pb-8">
//       {/* Top Creators */}
//       {creators.length > 0 && (
//         <section>
//           <div className="flex items-center justify-between mb-5">
//             <h2 className="text-xl font-bold text-text flex items-center gap-2">
//               <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
//                 <TrendingUp className="w-5 h-5 text-primary" />
//               </div>
//               Top Creators
//             </h2>
//             <Link 
//               to="/creators" 
//               className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors group"
//             >
//               See all 
//               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//             </Link>
//           </div>
//           <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
//             {creators.map(creator => <CreatorPill key={creator._id} creator={creator} />)}
//           </div>
//         </section>
//       )}

//       {/* Trending Tags */}
//       <TrendingTagsSection />

//       {/* Mood Feeds */}
//       <section>
//         <h2 className="text-xl font-bold text-text mb-5 flex items-center gap-2">
//           <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
//             <Music className="w-5 h-5 text-accent" />
//           </div>
//           Browse by Mood
//         </h2>
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//           {Object.entries(MOOD_LABELS).map(([mood, label]) => {
//             const emoji = label.split(' ')[0]
//             const text = label.split(' ').slice(1).join(' ')
//             return (
//               <Link
//                 key={mood}
//                 to={`/mood/${mood}`}
//                 className="group relative bg-gradient-to-br from-surface2/50 to-surface2/20 border border-border/50 rounded-2xl p-5 text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                 <div className="relative">
//                   <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{emoji}</div>
//                   <p className="text-sm text-text font-medium group-hover:text-primary transition-colors">
//                     {text}
//                   </p>
//                 </div>
//               </Link>
//             )
//           })}
//         </div>
//       </section>
//     </div>
//   )
// }

// // ── Mood Feed Page ────────────────────────────

// export function MoodFeedPage() {
//   const mood = window.location.pathname.split('/mood/')[1]

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
//     ['feed', 'mood', mood],
//     (page) => feedApi.moodFeed(mood, { page }).then(r => r.data.data)
//   )

//   const posts = data?.pages.flatMap(p => p.posts) ?? []
//   const label = MOOD_LABELS[mood] || mood
//   const emoji = label.split(' ')[0]
//   const text = label.split(' ').slice(1).join(' ')

//   return (
//     <div>
//       <div className="relative mb-8 p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/20 overflow-hidden">
//         <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
//         <div className="relative flex items-center gap-5">
//           <div className="text-5xl animate-float">{emoji}</div>
//           <div>
//             <h1 className="text-3xl font-bold text-text">{text}</h1>
//             <p className="text-muted text-sm mt-1">{posts.length} posts in this mood</p>
//           </div>
//         </div>
//       </div>
      
//       <PostFeedList posts={posts} isLoading={isLoading} />
      
//       {hasNextPage && (
//         <div className="flex justify-center mt-8">
//           <Button 
//             variant="outline" 
//             onClick={() => fetchNextPage()} 
//             loading={isFetchingNextPage}
//             className="px-8 py-3 rounded-full"
//           >
//             Load more
//           </Button>
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Shared: Post Feed List ────────────────────

// export function PostFeedList({ posts, isLoading }: { posts: Post[]; isLoading: boolean }) {
//   if (isLoading) return (
//     <div className="flex flex-col gap-4">
//       {Array.from({ length: 3 }).map((_, i) => (
//         <div key={i} className="bg-surface2/30 rounded-2xl overflow-hidden animate-pulse border border-border/30">
//           <div className="flex items-center gap-3 p-4">
//             <div className="w-10 h-10 rounded-full bg-surface2/80" />
//             <div className="flex-1 space-y-2">
//               <div className="h-3 bg-surface2/80 rounded w-1/3" />
//               <div className="h-2 bg-surface2/80 rounded w-1/4" />
//             </div>
//           </div>
//           <div className="aspect-video bg-surface2/80" />
//           <div className="h-12 bg-surface/50" />
//         </div>
//       ))}
//     </div>
//   )

//   if (!posts.length) return (
//     <div className="flex flex-col items-center justify-center py-20">
//       <div className="text-6xl mb-4">📝</div>
//       <h3 className="text-xl font-semibold text-text mb-2">No posts here yet</h3>
//       <p className="text-muted text-sm">Check back later or explore other sections</p>
//     </div>
//   )

//   return (
//     <div className="flex flex-col gap-6">
//       {posts.map((post) => (
//         <div key={post._id} className="animate-slideUp">
//           <PostCard post={post} />
//         </div>
//       ))}
//     </div>
//   )
// }

// // ── Creator Pill ──────────────────────────────

// function CreatorPill({ creator }: { creator: AuthUser }) {
//   return (
//     <Link 
//       to={`/@${creator.username}`} 
//       className="flex flex-col items-center gap-3 p-4 bg-surface2/30 border border-border/50 rounded-2xl min-w-[110px] hover:border-primary/50 hover:bg-surface2/50 transition-all duration-300 group snap-start"
//     >
//       <div className="relative">
//         <Avatar user={creator} size="lg" className="ring-2 ring-transparent group-hover:ring-primary/30 transition-all" />
//         {creator.isVerified && (
//           <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-[10px] border-2 border-bg">
//             ✓
//           </div>
//         )}
//       </div>
//       <div className="text-center">
//         <p className="text-sm font-semibold text-text truncate max-w-[90px] group-hover:text-primary transition-colors">
//           {creator.displayName}
//         </p>
//         <p className="text-[10px] text-muted truncate">@{creator.username}</p>
//       </div>
//     </Link>
//   )
// }

// // ── Trending Tags Section ─────────────────────

// function TrendingTagsSection() {
//   const { data } = useInfiniteQuery({
//     queryKey: ['search', 'trendingTags'],
//     queryFn : () => searchApi.trendingTags(20).then(r => r.data.data.tags),
//     initialPageParam: 1,
//     getNextPageParam: () => undefined,
//   })

//   const tags = data?.pages.flat() ?? []
//   if (!tags.length) return null

//   return (
//     <section>
//       <h2 className="text-xl font-bold text-text mb-5 flex items-center gap-2">
//         <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
//           <Flame className="w-5 h-5 text-accent" />
//         </div>
//         Trending Tags
//       </h2>
//       <div className="flex flex-wrap gap-2.5">
//         {tags.map((t, index) => (
//           <Link
//             key={t.tag}
//             to={`/search?tag=${t.tag}`}
//             className="group relative px-4 py-2 bg-surface2/30 border border-border/50 rounded-full text-sm text-muted hover:text-primary hover:border-primary/50 transition-all duration-300 overflow-hidden"
//             style={{ animationDelay: `${index * 50}ms` }}
//           >
//             <span className="relative z-10">#{t.tag}</span>
//             <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//           </Link>
//         ))}
//       </div>
//     </section>
//   )
// }

// // ── Add these animations to your global CSS ──

// /*
// @keyframes slideDown {
//   from { opacity: 0; transform: translateY(-10px) scale(0.95); }
//   to { opacity: 1; transform: translateY(0) scale(1); }
// }

// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }

// @keyframes slideUp {
//   from { opacity: 0; transform: translateY(20px); }
//   to { opacity: 1; transform: translateY(0); }
// }

// @keyframes float {
//   0%, 100% { transform: translateY(0px); }
//   50% { transform: translateY(-10px); }
// }

// .animate-slideDown {
//   animation: slideDown 0.3s ease-out forwards;
// }

// .animate-fadeIn {
//   animation: fadeIn 0.5s ease-out forwards;
// }

// .animate-slideUp {
//   animation: slideUp 0.4s ease-out forwards;
// }

// .animate-float {
//   animation: float 3s ease-in-out infinite;
// }

// .scrollbar-hide::-webkit-scrollbar {
//   display: none;
// }

// .scrollbar-hide {
//   -ms-overflow-style: none;
//   scrollbar-width: none;
// }
// */




import { useState, useRef, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, Compass, Sparkles, Music, BookOpen, Flame, 
  ArrowRight, ChevronDown, Globe, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import { feedApi, searchApi } from '../../api'
import { useAuthStore } from '../../store/auth.store'
import { PostCard } from '../../components/post/PostCard'
import { Avatar, Button, PageSpinner, EmptyState } from '../../components/ui'
import { cn, MOOD_LABELS } from '../../utils'
import type { Post, AuthUser } from '../../types'

// ── Infinite scroll hook ──────────────────────

function useInfiniteFeed<T extends { posts: Post[]; pagination?: { pages?: number } }>(
  queryKey: unknown[],
  fetcher: (page: number) => Promise<T>
) {
  return useInfiniteQuery({
    queryKey,
    queryFn       : ({ pageParam }) => fetcher(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last, _, lastPageParam) => {
      const pages = last.pagination?.pages
      return pages && (lastPageParam as number) < pages ? (lastPageParam as number) + 1 : undefined
    },
  })
}

// ─────────────────────────────────────────────
//  HOME PAGE
// ─────────────────────────────────────────────

export function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [showScrollLeft, setShowScrollLeft] = useState(false)
  const [showScrollRight, setShowScrollRight] = useState(true)
  
  const filterContainerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filters = [
    { id: 'all', label: '✨ All' },
    { id: 'sayari', label: '📝 Sayari' },
    { id: 'kavita', label: '🌸 Kavita' },
    { id: 'ghazal', label: '🎭 Ghazal' },
    { id: 'audio', label: '🎙️ Audio' },
    { id: 'story_chapter', label: '📖 Story' },
  ]

  const languages = [
    { id: 'all', label: '🌐 All Languages', flag: '🌐' },
    { id: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { id: 'ur', label: 'اردو', flag: '🇵🇰' },
    { id: 'en', label: 'English', flag: '🇬🇧' },
  ]

  const getLanguageLabel = (id: string) => {
    const lang = languages.find(l => l.id === id)
    return lang ? lang.label : '🌐 All Languages'
  }

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    const container = filterContainerRef.current
    if (!container) return
    
    const { scrollLeft, scrollWidth, clientWidth } = container
    setShowScrollLeft(scrollLeft > 10)
    setShowScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  // Scroll left/right
  const scrollFilters = (direction: 'left' | 'right') => {
    const container = filterContainerRef.current
    if (!container) return
    
    const scrollAmount = 200
    const target = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount
    
    container.scrollTo({ left: target, behavior: 'smooth' })
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Check scroll on mount and resize
  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  return (
    <div>
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-bg via-bg/95 to-transparent pt-4 pb-2 mx-4 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Filter Buttons - With Scroll Arrows */}
          <div className="flex-1 relative overflow-hidden">
            {/* Left Arrow */}
            {showScrollLeft && (
              <button
                onClick={() => scrollFilters('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-surface/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-text hover:bg-surface2 transition-all shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Scrollable Filter Buttons */}
            <div 
              ref={filterContainerRef}
              onScroll={checkScroll}
              className="flex gap-2 overflow-x-auto scrollbar-hide px-6"
              style={{ scrollBehavior: 'smooth' }}
            >
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
                    activeFilter === filter.id
                      ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30"
                      : "bg-surface2/50 text-muted hover:text-text hover:bg-surface2 border border-border/50"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Right Arrow */}
            {showScrollRight && (
              <button
                onClick={() => scrollFilters('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-surface/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-text hover:bg-surface2 transition-all shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Gradient fades on edges */}
            {showScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-bg to-transparent pointer-events-none" />
            )}
            {showScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-bg to-transparent pointer-events-none" />
            )}
          </div>

          {/* Language Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
                isLanguageOpen || selectedLanguage !== 'all'
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-surface2/50 text-muted hover:text-text hover:bg-surface2 border border-border/50"
              )}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{getLanguageLabel(selectedLanguage)}</span>
              <span className="sm:hidden">
                {languages.find(l => l.id === selectedLanguage)?.flag || '🌐'}
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-300",
                isLanguageOpen && "rotate-180"
              )} />
            </button>

            {/* Custom Dropdown */}
            {isLanguageOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-slideDown z-50">
                <div className="p-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setSelectedLanguage(lang.id)
                        setIsLanguageOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200",
                        selectedLanguage === lang.id
                          ? "bg-primary/10 text-primary"
                          : "text-text hover:bg-surface2"
                      )}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="flex-1 text-left">{lang.label}</span>
                      {selectedLanguage === lang.id && (
                        <span className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        <FeedContent 
          filter={activeFilter} 
          language={selectedLanguage} 
        />
      </div>
    </div>
  )
}

// ── Feed Content ──────────────────────────────

function FeedContent({ filter, language }: { filter: string; language: string }) {
  const type = filter === 'all' ? '' : filter
  const lang = language === 'all' ? '' : language

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
    ['feed', 'explore', type, lang],
    (page) => feedApi.explore({ 
      type: (type || undefined) as Post['type'] | undefined, 
      language: (lang || undefined) as Post['language'] | undefined, 
      page, 
      limit: 10 
    }).then(r => r.data.data)
  )

  const posts = data?.pages.flatMap(p => p.posts) ?? []

  return (
    <div>
      <PostFeedList posts={posts} isLoading={isLoading} />
      
      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => fetchNextPage()} 
            loading={isFetchingNextPage}
            className="px-8 py-3 rounded-full border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            Load more posts
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Explore Page (full page) ──────────────────

export function ExplorePage() {
  const { data: topCreators } = useInfiniteQuery({
    queryKey: ['feed', 'topCreators'],
    queryFn : () => feedApi.topCreators({ limit: 8 }).then(r => r.data.data.creators),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
  })

  const creators = topCreators?.pages.flat() ?? []

  return (
    <div className="flex flex-col gap-10 p-20">
      {/* Top Creators */}
      {creators.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              Top Creators
            </h2>
            <Link 
              to="/creators" 
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors group"
            >
              See all 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
            {creators.map(creator => <CreatorPill key={creator._id} creator={creator} />)}
          </div>
        </section>
      )}

      {/* Trending Tags */}
      <TrendingTagsSection />

      {/* Mood Feeds */}
      <section>
        <h2 className="text-xl font-bold text-text mb-5 flex items-center gap-2">
          <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
            <Music className="w-5 h-5 text-accent" />
          </div>
          Browse by Mood
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(MOOD_LABELS).map(([mood, label]) => {
            const emoji = label.split(' ')[0]
            const text = label.split(' ').slice(1).join(' ')
            return (
              <Link
                key={mood}
                to={`/mood/${mood}`}
                className="group relative bg-gradient-to-br from-surface2/50 to-surface2/20 border border-border/50 rounded-2xl p-5 text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{emoji}</div>
                  <p className="text-sm text-text font-medium group-hover:text-primary transition-colors">
                    {text}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

// ── Mood Feed Page ────────────────────────────

export function MoodFeedPage() {
  const mood = window.location.pathname.split('/mood/')[1]

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteFeed(
    ['feed', 'mood', mood],
    (page) => feedApi.moodFeed(mood, { page }).then(r => r.data.data)
  )

  const posts = data?.pages.flatMap(p => p.posts) ?? []
  const label = MOOD_LABELS[mood] || mood
  const emoji = label.split(' ')[0]
  const text = label.split(' ').slice(1).join(' ')

  return (
    <div>
      <div className="relative mb-8 p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/20 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="text-5xl animate-float">{emoji}</div>
          <div>
            <h1 className="text-3xl font-bold text-text">{text}</h1>
            <p className="text-muted text-sm mt-1">{posts.length} posts in this mood</p>
          </div>
        </div>
      </div>
      
      <PostFeedList posts={posts} isLoading={isLoading} />
      
      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => fetchNextPage()} 
            loading={isFetchingNextPage}
            className="px-8 py-3 rounded-full"
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Shared: Post Feed List ────────────────────

export function PostFeedList({ posts, isLoading }: { posts: Post[]; isLoading: boolean }) {
  if (isLoading) return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-surface2/30 rounded-2xl overflow-hidden animate-pulse border border-border/30">
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-full bg-surface2/80" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-surface2/80 rounded w-1/3" />
              <div className="h-2 bg-surface2/80 rounded w-1/4" />
            </div>
          </div>
          <div className="aspect-video bg-surface2/80" />
          <div className="h-12 bg-surface/50" />
        </div>
      ))}
    </div>
  )

  if (!posts.length) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-xl font-semibold text-text mb-2">No posts here yet</h3>
      <p className="text-muted text-sm">Check back later or explore other sections</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <div key={post._id} className="animate-slideUp">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  )
}

// ── Creator Pill ──────────────────────────────

function CreatorPill({ creator }: { creator: AuthUser }) {
  return (
    <Link 
      to={`/@${creator.username}`} 
      className="flex flex-col items-center gap-3 p-4 bg-surface2/30 border border-border/50 rounded-2xl min-w-[110px] hover:border-primary/50 hover:bg-surface2/50 transition-all duration-300 group snap-start"
    >
      <div className="relative">
        <Avatar user={creator} size="lg" className="ring-2 ring-transparent group-hover:ring-primary/30 transition-all" />
        {creator.isVerified && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-[10px] border-2 border-bg">
            ✓
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-text truncate max-w-[90px] group-hover:text-primary transition-colors">
          {creator.displayName}
        </p>
        <p className="text-[10px] text-muted truncate">@{creator.username}</p>
      </div>
    </Link>
  )
}

// ── Trending Tags Section ─────────────────────

function TrendingTagsSection() {
  const { data } = useInfiniteQuery({
    queryKey: ['search', 'trendingTags'],
    queryFn : () => searchApi.trendingTags(20).then(r => r.data.data.tags),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
  })

  const tags = data?.pages.flat() ?? []
  if (!tags.length) return null

  return (
    <section>
      <h2 className="text-xl font-bold text-text mb-5 flex items-center gap-2">
        <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
          <Flame className="w-5 h-5 text-accent" />
        </div>
        Trending Tags
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {tags.map((t, index) => (
          <Link
            key={t.tag}
            to={`/search?tag=${t.tag}`}
            className="group relative px-4 py-2 bg-surface2/30 border border-border/50 rounded-full text-sm text-muted hover:text-primary hover:border-primary/50 transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="relative z-10">#{t.tag}</span>
            <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        ))}
      </div>
    </section>
  )
}