// import { useState } from 'react'
// import { Link } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import {
//   Users, FileText, BookOpen, Ban, Flag, TrendingUp, Eye, Heart
// } from 'lucide-react'
// import { dashboardApi } from '../../api'
// import { Card, PageSpinner } from '../../components/ui'
// import { cn, formatCount, timeAgo } from '../../utils'
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, PieChart, Pie, Cell
// } from 'recharts'

// const COLORS = ['#6C63FF', '#FF6584', '#34C759', '#FFD700', '#5856D6', '#FF9500', '#FF3B30', '#5AC8FA', '#AF52DE']

// export function DashboardPage() {
//   const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d')

//   const { data, isLoading } = useQuery({
//     queryKey: ['admin', 'stats', period],
//     queryFn : () => dashboardApi.stats(period).then(r => r.data.data),
//   })

//   if (isLoading) return <PageSpinner />
//   if (!data) return null

//   const stats = [
//     { label: 'Total Users',      value: data.overview.totalUsers,      newVal: data.overview.newUsers,    icon: <Users className="w-5 h-5" />,     color: 'text-blue-400'  },
//     { label: 'Total Posts',      value: data.overview.totalPosts,      newVal: data.overview.newPosts,    icon: <FileText className="w-5 h-5" />,  color: 'text-[#6C63FF]' },
//     { label: 'Total Series',     value: data.overview.totalSeries,     newVal: null,                       icon: <BookOpen className="w-5 h-5" />,  color: 'text-green-400' },
//     { label: 'Banned Users',     value: data.overview.bannedUsers,     newVal: null,                       icon: <Ban className="w-5 h-5" />,       color: 'text-red-400'   },
//   ]

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-xl font-bold text-white">Dashboard</h1>
//         <div className="flex gap-2">
//           {(['7d', '30d', '90d'] as const).map(p => (
//             <button
//               key={p}
//               onClick={() => setPeriod(p)}
//               className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
//                 period === p ? 'bg-[#6C63FF] text-white' : 'bg-[#1A1A1A] text-[#888] border border-[#2E2E2E]'
//               )}
//             >
//               {p}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Reports alert */}
//       {data.overview.reportsPending > 0 && (
//         <Link to="/reports" className="flex items-center gap-3 mb-6 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl hover:bg-yellow-500/20 transition-colors">
//           <Flag className="w-5 h-5 text-yellow-400 shrink-0" />
//           <p className="text-sm text-yellow-400">
//             <span className="font-semibold">{data.overview.reportsPending}</span> reports pending review
//           </p>
//         </Link>
//       )}

//       {/* Stat cards */}
//       <div className="grid grid-cols-4 gap-4 mb-6">
//         {stats.map(s => (
//           <Card key={s.label} className="p-4">
//             <div className={cn('mb-2', s.color)}>{s.icon}</div>
//             <p className="text-2xl font-bold text-white">{formatCount(s.value)}</p>
//             <p className="text-xs text-[#888] mt-0.5">
//               {s.label}
//               {s.newVal !== null && <span className="text-green-400 ml-1">+{s.newVal}</span>}
//             </p>
//           </Card>
//         ))}
//       </div>

//       <div className="grid grid-cols-2 gap-6 mb-6">
//         {/* Registrations chart */}
//         <Card className="p-4">
//           <h3 className="text-sm font-semibold text-white mb-4">New Registrations</h3>
//           <ResponsiveContainer width="100%" height={200}>
//             <BarChart data={data.dailyRegistrations}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
//               <XAxis dataKey="_id" tick={{ fill: '#555', fontSize: 10 }} tickFormatter={d => d.slice(5)} />
//               <YAxis tick={{ fill: '#555', fontSize: 10 }} />
//               <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 8, color: '#fff', fontSize: 12 }} />
//               <Bar dataKey="count" fill="#6C63FF" radius={[6, 6, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </Card>

//         {/* Post type breakdown */}
//         <Card className="p-4">
//           <h3 className="text-sm font-semibold text-white mb-4">Content Type Breakdown</h3>
//           <ResponsiveContainer width="100%" height={200}>
//             <PieChart>
//               <Pie
//                 data={Object.entries(data.postTypeBreakdown).map(([name, value]) => ({ name, value }))}
//                 dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75}
//                 paddingAngle={2}
//               >
//                 {Object.keys(data.postTypeBreakdown).map((_, i) => (
//                   <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 8, color: '#fff', fontSize: 12 }} />
//             </PieChart>
//           </ResponsiveContainer>
//           <div className="flex flex-wrap gap-2 mt-2 justify-center">
//             {Object.entries(data.postTypeBreakdown).map(([name], i) => (
//               <span key={name} className="flex items-center gap-1 text-[10px] text-[#888]">
//                 <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
//                 {name}
//               </span>
//             ))}
//           </div>
//         </Card>
//       </div>

//       <div className="grid grid-cols-2 gap-6">
//         {/* Top posts */}
//         <Card className="p-4">
//           <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
//             <TrendingUp className="w-4 h-4 text-[#6C63FF]" /> Top Posts
//           </h3>
//           <div className="flex flex-col gap-2">
//             {data.topPosts.slice(0, 5).map((post, i) => (
//               <div key={post._id} className="flex items-center gap-3 p-2 hover:bg-[#242424] rounded-xl transition-colors">
//                 <span className="text-xs font-bold text-[#555] w-4">{i + 1}</span>
//                 <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#242424] shrink-0">
//                   {post.renderedImage?.thumbnail && <img src={post.renderedImage.thumbnail} alt="" className="w-full h-full object-cover" />}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-xs text-white truncate">{post.title || 'Untitled'}</p>
//                   <p className="text-[10px] text-[#555]">by {typeof post.author === 'object' ? post.author.displayName : ''}</p>
//                 </div>
//                 <div className="flex items-center gap-1 text-[10px] text-[#888] shrink-0">
//                   <Eye className="w-3 h-3" />{formatCount(post.stats.viewCount)}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>

//         {/* Top channels */}
//         <Card className="p-4">
//           <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
//             <Users className="w-4 h-4 text-[#FF6584]" /> Top Channels
//           </h3>
//           <div className="flex flex-col gap-2">
//             {data.topChannels.slice(0, 5).map((channel, i) => (
//               <div key={channel._id} className="flex items-center gap-3 p-2 hover:bg-[#242424] rounded-xl transition-colors">
//                 <span className="text-xs font-bold text-[#555] w-4">{i + 1}</span>
//                 <div className="w-8 h-8 rounded-full overflow-hidden bg-[#242424] shrink-0">
//                   {channel.logo?.thumbnail && <img src={channel.logo.thumbnail} alt="" className="w-full h-full object-cover" />}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-xs text-white truncate flex items-center gap-1">
//                     {channel.name} {channel.isVerified && <span>✅</span>}
//                   </p>
//                   <p className="text-[10px] text-[#555]">@{channel.handle}</p>
//                 </div>
//                 <div className="flex items-center gap-1 text-[10px] text-[#888] shrink-0">
//                   <Heart className="w-3 h-3" />{formatCount(channel.stats.followersCount)}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>
//       </div>
//     </div>
//   )
// }


























import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users, FileText, BookOpen, Ban, Flag, TrendingUp, Eye, Heart, Activity, BadgeCheck
} from 'lucide-react'
import { dashboardApi } from '../../api'
import { Card, PageSpinner } from '../../components/ui'
import { cn, formatCount, timeAgo } from '../../utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

// Upgraded to tech-focused neon colors for the charts
const COLORS = ['#E60000', '#00E676', '#3B82F6', '#FBBF24', '#A855F7', '#FF3366', '#06B6D4', '#F97316']

export function DashboardPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats', period],
    queryFn : () => dashboardApi.stats(period).then(r => r.data.data),
  })

  if (isLoading) return <PageSpinner />
  if (!data) return null

  // Upgraded stats array with custom glowing backgrounds and drop shadows for the icons
  const stats = [
    { label: 'Total Users',  value: data.overview.totalUsers,  newVal: data.overview.newUsers, icon: <Users className="w-5 h-5 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />,     color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
    { label: 'Total Posts',  value: data.overview.totalPosts,  newVal: data.overview.newPosts, icon: <FileText className="w-5 h-5 drop-shadow-[0_0_8px_rgba(230,0,0,0.5)]" />,  color: 'text-[#E60000]', bg: 'bg-[#E60000]/10' },
    { label: 'Total Series', value: data.overview.totalSeries, newVal: null,                   icon: <BookOpen className="w-5 h-5 drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]" />,  color: 'text-[#00E676]', bg: 'bg-[#00E676]/10' },
    { label: 'Banned Users', value: data.overview.bannedUsers, newVal: null,                   icon: <Ban className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,51,102,0.5)]" />,       color: 'text-[#FF3366]', bg: 'bg-[#FF3366]/10' },
  ]

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 bg-[#141414] border border-[#1F1F1F] rounded-xl flex items-center justify-center shadow-inner">
              <Activity className="w-5 h-5 text-[#E60000] drop-shadow-[0_0_8px_rgba(230,0,0,0.5)]" />
            </div>
            Command Center
          </h1>
          <p className="text-[#71717A] text-sm mt-2 ml-1">Platform overview and vital statistics.</p>
        </div>

        {/* Time Period Selector - Pill Shaped */}
        <div className="flex gap-1 bg-[#0A0A0A] border border-[#1F1F1F] p-1 rounded-xl shadow-inner">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn('px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest transition-all duration-300',
                period === p 
                  ? 'bg-[#E60000] text-white shadow-[0_2px_10px_rgba(230,0,0,0.3)]' 
                  : 'bg-transparent text-[#71717A] hover:text-white hover:bg-[#141414]'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Reports alert - Cyberpunk style */}
      {data.overview.reportsPending > 0 && (
        <Link to="/reports" className="group flex items-center gap-4 mb-8 px-6 py-4 bg-[#FBBF24]/5 border border-[#FBBF24]/20 rounded-[20px] hover:bg-[#FBBF24]/10 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FBBF24] shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
          <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center border border-[#FBBF24]/20 group-hover:scale-110 transition-transform">
            <Flag className="w-5 h-5 text-[#FBBF24] drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
          </div>
          <div>
            <p className="text-sm text-[#FBBF24] font-sans">
              <span className="font-display font-bold text-lg mr-1.5">{data.overview.reportsPending}</span> 
              reports pending review
            </p>
            <p className="text-[11px] font-mono text-[#FBBF24]/70 uppercase tracking-widest mt-0.5">Action required in moderation queue</p>
          </div>
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(s => (
          <Card key={s.label} className="p-6 relative overflow-hidden group hover:border-[#2A2A2A] transition-colors duration-300">
            {/* Subtle radial background glow */}
            <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none", s.bg.replace('/10', ''))} />
            
            <div className="relative z-10 flex items-start justify-between mb-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border border-white/5', s.bg, s.color)}>
                {s.icon}
              </div>
              {s.newVal !== null && (
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-1 rounded-md uppercase tracking-wider">
                  <TrendingUp className="w-3 h-3" />
                  +{s.newVal}
                </div>
              )}
            </div>
            <p className="text-3xl font-display font-bold text-white tracking-tight relative z-10">{formatCount(s.value)}</p>
            <p className="text-xs text-[#71717A] font-mono uppercase tracking-widest mt-1 relative z-10">
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Registrations chart */}
        <Card className="p-6 group hover:border-[#2A2A2A] transition-colors">
          <h3 className="text-base font-display font-bold text-white mb-6 tracking-wide">New Registrations</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.dailyRegistrations} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
              <XAxis dataKey="_id" tick={{ fill: '#71717A', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#71717A', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#141414' }}
                contentStyle={{ background: '#050505', border: '1px solid #1F1F1F', borderRadius: '12px', color: '#fff', fontSize: '12px', fontFamily: 'monospace', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                itemStyle={{ color: '#E60000' }}
              />
              <Bar dataKey="count" fill="#E60000" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Post type breakdown */}
        <Card className="p-6 group hover:border-[#2A2A2A] transition-colors">
          <h3 className="text-base font-display font-bold text-white mb-2 tracking-wide">Content Type Breakdown</h3>
          <ResponsiveContainer width="100%" height={200} >
            <PieChart>
              <Pie
                data={Object.entries(data.postTypeBreakdown).map(([name, value]) => ({ name, value }))}
                dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                paddingAngle={4}
                stroke="none"
              >
                {Object.keys(data.postTypeBreakdown).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#050505', border: '1px solid #1F1F1F', borderRadius: '12px', color: '#fff', fontSize: '12px', fontFamily: 'monospace', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {Object.entries(data.postTypeBreakdown).map(([name], i) => (
              <div key={name} className="flex items-center gap-1.5 bg-[#0A0A0A] border border-[#1F1F1F] px-2.5 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length], boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}80` }} />
                <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">{name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top posts */}
        <Card className="p-6 group hover:border-[#2A2A2A] transition-colors">
          <h3 className="text-base font-display font-bold text-white mb-5 flex items-center gap-2 tracking-wide">
            <TrendingUp className="w-5 h-5 text-[#E60000]" /> Top Posts
          </h3>
          <div className="flex flex-col gap-2">
            {data.topPosts.slice(0, 5).map((post, i) => (
              <div key={post._id} className="flex items-center gap-4 p-3 bg-[#0A0A0A] border border-transparent hover:border-[#1F1F1F] hover:bg-[#141414] rounded-xl transition-all duration-300">
                <span className="text-[10px] font-mono font-bold text-[#71717A] w-4 text-center">{i + 1}</span>
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1F1F1F] shrink-0 border border-[#2A2A2A]">
                  {post.renderedImage?.thumbnail ? (
                    <img src={post.renderedImage.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#71717A] m-auto mt-3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-medium text-white truncate">{post.title || 'Untitled'}</p>
                  <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider mt-0.5 truncate">
                    By <span className="text-[#A1A1AA]">{typeof post.author === 'object' ? post.author.displayName : 'Unknown'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A1A1AA] bg-[#1F1F1F] px-2 py-1 rounded-md shrink-0">
                  <Eye className="w-3.5 h-3.5 text-[#3B82F6]" />{formatCount(post.stats.viewCount)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top channels */}
        <Card className="p-6 group hover:border-[#2A2A2A] transition-colors">
          <h3 className="text-base font-display font-bold text-white mb-5 flex items-center gap-2 tracking-wide">
            <Users className="w-5 h-5 text-[#3B82F6]" /> Top Channels
          </h3>
          <div className="flex flex-col gap-2">
            {data.topChannels.slice(0, 5).map((channel, i) => (
              <div key={channel._id} className="flex items-center gap-4 p-3 bg-[#0A0A0A] border border-transparent hover:border-[#1F1F1F] hover:bg-[#141414] rounded-xl transition-all duration-300">
                <span className="text-[10px] font-mono font-bold text-[#71717A] w-4 text-center">{i + 1}</span>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1F1F1F] shrink-0 border border-[#2A2A2A]">
                  {channel.logo?.thumbnail ? (
                    <img src={channel.logo.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-4 h-4 text-[#71717A] m-auto mt-3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-medium text-white truncate flex items-center gap-1.5">
                    {channel.name} 
                    {/* Swapped Emoji for Lucide BadgeCheck */}
                    {channel.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />}
                  </p>
                  <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider mt-0.5 truncate">@{channel.handle}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A1A1AA] bg-[#1F1F1F] px-2 py-1 rounded-md shrink-0">
                  <Heart className="w-3.5 h-3.5 text-[#FF3366]" />{formatCount(channel.stats.followersCount)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}