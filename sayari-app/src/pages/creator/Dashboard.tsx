import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BarChart2, Eye, Heart, Users, Play, Plus, Filter,
  Globe, Lock, Users as UsersIcon, Trash2, Edit, Clock,
  TrendingUp, BookOpen, Music, Image
} from 'lucide-react'
import { postsApi, analyticsApi } from '../../api'
import { Button, Select, Tabs, EmptyState, Card, PageSpinner } from '../../components/ui'
import { PostGrid } from '../../components/post/PostCard'
import { useUiStore } from '../../store/index'
import { cn, formatCount, timeAgo, getErrorMessage } from '../../utils'
import type { Post } from '../../types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────
//  CREATOR DASHBOARD
// ─────────────────────────────────────────────

export function CreatorDashboardPage() {
  const [tab, setTab] = useState('overview')
  const { openPostModal } = useUiStore()

  const tabs = [
    { id: 'overview',  label: 'Overview',  icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'posts',     label: 'Posts',     icon: <Image className="w-4 h-4" />     },
    { id: 'series',    label: 'Series',    icon: <BookOpen className="w-4 h-4" />  },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" />},
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Creator Studio</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" icon={<Music className="w-4 h-4" />} onClick={() => openPostModal('audio')}>Audio</Button>
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => openPostModal('image')}>New Post</Button>
        </div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6" />

      {tab === 'overview'  && <DashboardOverview />}
      {tab === 'posts'     && <MyPostsManager />}
      {tab === 'series'    && <Link to="/series/mine" className="block"><Button variant="outline" className="w-full">Manage Series →</Button></Link>}
      {tab === 'analytics' && <AnalyticsDashboard />}
    </div>
  )
}

// ── Dashboard Overview ────────────────────────

function DashboardOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'overview', '30d'],
    queryFn : () => analyticsApi.overview('30d').then(r => r.data.data),
  })

  const { data: topPosts, isLoading: tpLoading } = useQuery({
    queryKey: ['analytics', 'topPosts', '30d'],
    queryFn : () => analyticsApi.topPosts('30d', 'views', 5).then(r => r.data.data),
  })

  if (isLoading) return <PageSpinner />

  const stats = [
    { label: 'Total Views',    value: data?.engagement.views    ?? 0, icon: <Eye className="w-5 h-5" />,     color: 'text-blue-400'   },
    { label: 'Total Likes',    value: data?.engagement.likes    ?? 0, icon: <Heart className="w-5 h-5" />,   color: 'text-[#FF6584]'  },
    { label: 'New Followers',  value: data?.followers.new       ?? 0, icon: <Users className="w-5 h-5" />,   color: 'text-green-400'  },
    { label: 'Audio Plays',    value: data?.engagement.audioPlays ?? 0, icon: <Play className="w-5 h-5" />, color: 'text-[#6C63FF]'  },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className={cn('mb-2', s.color)}>{s.icon}</div>
            <p className="text-2xl font-bold text-white">{formatCount(s.value)}</p>
            <p className="text-xs text-[#888] mt-0.5">{s.label} <span className="text-[#555]">(30d)</span></p>
          </Card>
        ))}
      </div>

      {/* Totals */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3">All Time</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { l: 'Total Posts',     v: data?.posts.total     ?? 0 },
            { l: 'Published',       v: data?.posts.published ?? 0 },
            { l: 'Total Followers', v: data?.followers.total ?? 0 },
          ].map(item => (
            <div key={item.l} className="text-center">
              <p className="text-xl font-bold text-white">{formatCount(item.v)}</p>
              <p className="text-xs text-[#888] mt-0.5">{item.l}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Top posts */}
      {!tpLoading && topPosts && topPosts.posts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Top Posts (30d)</h3>
          <div className="flex flex-col gap-2">
            {topPosts.posts.map((post, i) => (
              <Link key={post._id} to={`/post/${post._id}`}
                className="flex items-center gap-3 p-3 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl hover:border-[#6C63FF] transition-colors">
                <span className="text-lg font-bold text-[#555] w-6 text-center">{i + 1}</span>
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#242424] shrink-0">
                  {post.renderedImage?.thumbnail
                    ? <img src={post.renderedImage.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-sm">📝</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{post.title || 'Untitled'}</p>
                  <p className="text-xs text-[#888]">{formatCount(post.stats.viewCount)} views</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── My Posts Manager ──────────────────────────

function MyPostsManager() {
  const [status, setStatus]     = useState('')
  const [type, setType]         = useState('')
  const [visibility, setViz]    = useState('')
  const queryClient             = useQueryClient()
  const navigate                = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['myPosts', status, type, visibility],
    queryFn : () => postsApi.myPosts({
      status    : status     || undefined,
      type      : type       || undefined,
      visibility: visibility || undefined,
      limit     : 50,
    }).then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess  : () => {
      queryClient.invalidateQueries({ queryKey: ['myPosts'] })
      toast.success('Post deleted')
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: string }) =>
      postsApi.updateVisibility(id, visibility as 'public' | 'private' | 'followers_only'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPosts'] })
      toast.success('Visibility updated')
    },
  })

  const posts = data?.posts ?? []

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Select
          options={[
            { value: '', label: 'All Status' },
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'archived', label: 'Archived' },
          ]}
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="text-sm min-w-[130px]"
        />
        <Select
          options={[
            { value: '', label: 'All Types' },
            { value: 'sayari', label: 'Sayari' },
            { value: 'kavita', label: 'Kavita' },
            { value: 'audio', label: 'Audio' },
            { value: 'story_chapter', label: 'Story' },
          ]}
          value={type}
          onChange={e => setType(e.target.value)}
          className="text-sm min-w-[120px]"
        />
        <Select
          options={[
            { value: '', label: 'All Visibility' },
            { value: 'public', label: '🌐 Public' },
            { value: 'private', label: '🔒 Private' },
            { value: 'followers_only', label: '👥 Followers' },
          ]}
          value={visibility}
          onChange={e => setViz(e.target.value)}
          className="text-sm min-w-[150px]"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-[#1A1A1A] rounded-xl animate-pulse" />)}
        </div>
      ) : !posts.length ? (
        <EmptyState
          icon="📝"
          title="No posts found"
          description="Create your first post!"
          action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/create')}>Create Post</Button>}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map(post => (
            <PostManagerRow
              key={post._id}
              post={post}
              onDelete={() => deleteMutation.mutate(post._id)}
              onVisibilityChange={(viz) => visibilityMutation.mutate({ id: post._id, visibility: viz })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PostManagerRow({ post, onDelete, onVisibilityChange }: {
  post: Post
  onDelete: () => void
  onVisibilityChange: (v: string) => void
}) {
  const navigate = useNavigate()
  const vizIcons = { public: <Globe className="w-3.5 h-3.5" />, private: <Lock className="w-3.5 h-3.5" />, followers_only: <UsersIcon className="w-3.5 h-3.5" /> }
  const statusColors = { published: 'text-green-400', draft: 'text-[#888]', scheduled: 'text-yellow-400', archived: 'text-[#555]', under_review: 'text-orange-400' }

  return (
    <div className="flex items-center gap-3 p-3 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl hover:border-[#3E3E3E] transition-colors">
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#242424] shrink-0">
        {post.renderedImage?.thumbnail
          ? <img src={post.renderedImage.thumbnail} alt="" className="w-full h-full object-cover" />
          : post.type === 'audio'
            ? <div className="w-full h-full flex items-center justify-center"><Music className="w-5 h-5 text-[#6C63FF]" /></div>
            : <div className="w-full h-full flex items-center justify-center"><Image className="w-5 h-5 text-[#555]" /></div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{post.title || 'Untitled post'}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn('text-xs capitalize', statusColors[post.status])}>{post.status}</span>
          {post.status === 'scheduled' && post.scheduledAt && (
            <span className="text-xs text-[#555] flex items-center gap-1">
              <Clock className="w-3 h-3" />{timeAgo(post.scheduledAt)}
            </span>
          )}
          <span className="text-xs text-[#555]">· {formatCount(post.stats.viewCount)} views</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Visibility toggle */}
        <select
          value={post.visibility}
          onChange={e => onVisibilityChange(e.target.value)}
          className="text-xs bg-[#242424] border border-[#2E2E2E] rounded-lg px-2 py-1 text-[#888] outline-none"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="followers_only">Followers</option>
        </select>
        <button onClick={() => navigate(`/post/${post._id}/edit`)} className="p-1.5 text-[#888] hover:text-white transition-colors">
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 text-[#888] hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Analytics Dashboard ───────────────────────

function AnalyticsDashboard() {
  const [period, setPeriod] = useState('30d')

  const { data: views,     isLoading: vLoading } = useQuery({
    queryKey: ['analytics', 'views', period],
    queryFn : () => analyticsApi.viewsChart(period).then(r => r.data.data),
  })

  const { data: followers, isLoading: fLoading } = useQuery({
    queryKey: ['analytics', 'followers', period],
    queryFn : () => analyticsApi.followerGrowth(period).then(r => r.data.data),
  })

  const { data: engagement } = useQuery({
    queryKey: ['analytics', 'engagement', period],
    queryFn : () => analyticsApi.engagement(period).then(r => r.data.data),
  })

  const { data: bestTimes } = useQuery({
    queryKey: ['analytics', 'bestTimes'],
    queryFn : () => analyticsApi.bestTimes().then(r => r.data.data),
  })

  const periodOptions = [
    { value: '7d', label: '7 days' }, { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' }, { value: '1y', label: '1 year' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {periodOptions.map(p => (
          <button key={p.value} onClick={() => setPeriod(p.value)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              period === p.value ? 'bg-[#6C63FF] text-white' : 'bg-[#1A1A1A] text-[#888] border border-[#2E2E2E]'
            )}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Views Chart */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Views</h3>
        {vLoading ? (
          <div className="h-40 bg-[#242424] rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={views?.data ?? []}>
              <defs>
                <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
              <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#555', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Area type="monotone" dataKey="views" stroke="#6C63FF" fill="url(#viewGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Followers Chart */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
          Followers
          {followers && <span className="text-[#6C63FF] font-bold">{formatCount(followers.totalNow)} total</span>}
        </h3>
        {fLoading ? (
          <div className="h-40 bg-[#242424] rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={followers?.data ?? []}>
              <defs>
                <linearGradient id="follGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF6584" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6584" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
              <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: '#555', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Area type="monotone" dataKey="total" stroke="#FF6584" fill="url(#follGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Engagement breakdown */}
      {engagement && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Content Type Performance</h3>
          <div className="flex flex-col gap-2">
            {(engagement.contentTypes as { _id: string; views: number; likes: number; posts: number }[]).map(ct => (
              <div key={ct._id} className="flex items-center gap-3">
                <span className="text-xs text-[#888] w-24 capitalize">{ct._id}</span>
                <div className="flex-1 h-2 bg-[#242424] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6C63FF] to-[#FF6584] rounded-full"
                    style={{ width: `${Math.min(100, (ct.views / Math.max(...(engagement.contentTypes as { views: number }[]).map(c => c.views), 1)) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-[#555] w-16 text-right">{formatCount(ct.views)} views</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Best posting times */}
      {bestTimes && bestTimes.bestHours.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Best Times to Post</h3>
          <div className="flex flex-col gap-2">
            {bestTimes.bestHours.slice(0, 5).map(h => (
              <div key={h.hour} className="flex items-center gap-3">
                <span className="text-xs text-[#888] w-16">{h.label}</span>
                <div className="flex-1 h-2 bg-[#242424] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6C63FF] rounded-full"
                    style={{ width: `${(h.views / (bestTimes.bestHours[0]?.views || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#555]">{formatCount(h.views)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#2E2E2E]">
            <p className="text-xs text-[#888] mb-2">Best days</p>
            <div className="flex gap-2 flex-wrap">
              {bestTimes.bestDays.sort((a, b) => b.views - a.views).slice(0, 3).map(d => (
                <span key={d.day} className="text-xs bg-[#6C63FF]/20 text-[#6C63FF] px-2 py-1 rounded-full">{d.name}</span>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Link to="/dashboard/analytics">
        <Button variant="outline" className="w-full">View Full Analytics →</Button>
      </Link>
    </div>
  )
}
