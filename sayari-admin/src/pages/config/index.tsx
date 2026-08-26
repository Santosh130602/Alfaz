// import { useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { Settings, RefreshCw, AlertTriangle, Check, Zap } from 'lucide-react'
// import { configApi } from '../../api'
// import { Button, Card, Toggle, Input, PageSpinner } from '../../components/ui'
// import { cn, getErrorMessage } from '../../utils'
// import type { AppConfig } from '../../types'
// import toast from 'react-hot-toast'

// export function AppConfigPage() {
//   const queryClient = useQueryClient()

//   const { data, isLoading } = useQuery({
//     queryKey: ['admin', 'config'],
//     queryFn : () => configApi.getAll().then(r => r.data.data.configs),
//   })

//   const { data: kafkaData } = useQuery({
//     queryKey: ['admin', 'kafka'],
//     queryFn : () => configApi.kafkaStatus().then(r => r.data.data),
//   })

//   const updateMutation = useMutation({
//     mutationFn: ({ key, value }: { key: string; value: unknown }) => configApi.update(key, value),
//     onSuccess : () => {
//       queryClient.invalidateQueries({ queryKey: ['admin', 'config'] })
//       toast.success('Config updated')
//     },
//     onError: err => toast.error(getErrorMessage(err)),
//   })

//   const flushMutation = useMutation({
//     mutationFn: (pattern: string) => configApi.cacheFlush(pattern),
//     onSuccess : () => toast.success('Cache flushed'),
//     onError   : err => toast.error(getErrorMessage(err)),
//   })

//   if (isLoading) return <PageSpinner />
//   if (!data)     return null

//   const configMap = data.reduce((acc, c) => { acc[c.key] = c; return acc }, {} as Record<string, AppConfig>)

//   const boolConfigs = [
//     { key: 'maintenance_mode',     label: 'Maintenance Mode',          desc: 'Block all API requests with 503',  danger: true  },
//     { key: 'registration_open',    label: 'Registration Open',          desc: 'Allow new user sign-ups',          danger: false },
//     { key: 'whatsapp_otp_enabled', label: 'WhatsApp OTP',              desc: 'Enable WhatsApp OTP login',         danger: false },
//     { key: 'google_oauth_enabled', label: 'Google OAuth',              desc: 'Enable Google sign-in',             danger: false },
//     { key: 'apple_oauth_enabled',  label: 'Apple OAuth',               desc: 'Enable Apple sign-in',              danger: false },
//     { key: 'force_update_enabled', label: 'Force App Update',          desc: 'Require minimum app version',       danger: false },
//   ]

//   const numberConfigs = [
//     { key: 'max_post_image_size_mb', label: 'Max Post Image (MB)',   min: 1,  max: 50  },
//     { key: 'max_audio_size_mb',      label: 'Max Audio Upload (MB)', min: 10, max: 500 },
//     { key: 'max_tags_per_post',      label: 'Max Tags Per Post',     min: 1,  max: 30  },
//     { key: 'otp_expiry_mins',        label: 'OTP Expiry (min)',      min: 1,  max: 30  },
//   ]

//   const stringConfigs = [
//     { key: 'min_app_version_ios',     label: 'Min iOS Version'     },
//     { key: 'min_app_version_android', label: 'Min Android Version' },
//   ]

//   const maintenanceEnabled = configMap['maintenance_mode']?.value === true

//   return (
//     <div>
//       <h1 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
//         <Settings className="w-5 h-5 text-[#6C63FF]" /> App Configuration
//       </h1>

//       {/* Maintenance mode alert */}
//       {maintenanceEnabled && (
//         <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
//           <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
//           <div>
//             <p className="text-sm font-semibold text-red-400">Platform is in Maintenance Mode</p>
//             <p className="text-xs text-red-400/70">All API requests are returning 503. Disable this to restore access.</p>
//           </div>
//         </div>
//       )}

//       {/* Boolean toggles */}
//       <Card className="p-5 mb-6">
//         <h2 className="text-sm font-semibold text-white mb-4">Feature Toggles</h2>
//         <div className="flex flex-col divide-y divide-[#1E1E1E]">
//           {boolConfigs.map(cfg => {
//             const config = configMap[cfg.key]
//             if (!config) return null
//             return (
//               <div key={cfg.key} className={cn('flex items-center justify-between py-4 first:pt-0 last:pb-0', cfg.danger && (config.value as boolean) && 'bg-red-500/5 -mx-5 px-5 rounded-xl')}>
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <p className="text-sm font-medium text-white">{cfg.label}</p>
//                     {cfg.danger && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">Critical</span>}
//                   </div>
//                   <p className="text-xs text-[#555] mt-0.5">{cfg.desc}</p>
//                 </div>
//                 <Toggle
//                   checked={!!(config.value as boolean)}
//                   onChange={(v) => {
//                     if (cfg.danger && v) {
//                       if (!window.confirm(`Are you sure you want to enable "${cfg.label}"? This will affect all users.`)) return
//                     }
//                     updateMutation.mutate({ key: cfg.key, value: v })
//                   }}
//                 />
//               </div>
//             )
//           })}
//         </div>
//       </Card>

//       {/* Number configs */}
//       <Card className="p-5 mb-6">
//         <h2 className="text-sm font-semibold text-white mb-4">Limits & Thresholds</h2>
//         <div className="grid grid-cols-2 gap-4">
//           {numberConfigs.map(cfg => {
//             const config = configMap[cfg.key]
//             if (!config) return null
//             return (
//               <NumberConfigRow
//                 key={cfg.key}
//                 label={cfg.label}
//                 value={config.value as number}
//                 min={cfg.min}
//                 max={cfg.max}
//                 onSave={(v) => updateMutation.mutate({ key: cfg.key, value: v })}
//               />
//             )
//           })}
//         </div>
//       </Card>

//       {/* String configs */}
//       <Card className="p-5 mb-6">
//         <h2 className="text-sm font-semibold text-white mb-4">Version Gates</h2>
//         <div className="grid grid-cols-2 gap-4">
//           {stringConfigs.map(cfg => {
//             const config = configMap[cfg.key]
//             if (!config) return null
//             return (
//               <StringConfigRow
//                 key={cfg.key}
//                 label={cfg.label}
//                 value={config.value as string}
//                 onSave={(v) => updateMutation.mutate({ key: cfg.key, value: v })}
//               />
//             )
//           })}
//         </div>
//       </Card>

//       {/* Cache management */}
//       <Card className="p-5 mb-6">
//         <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
//           <RefreshCw className="w-4 h-4" /> Cache Management
//         </h2>
//         <div className="grid grid-cols-3 gap-3">
//           {[
//             { pattern: 'feed:',      label: 'Feed Cache',      desc: 'For you, trending, explore'  },
//             { pattern: 'trending:',  label: 'Trending Cache',  desc: 'Trending scores and tags'     },
//             { pattern: 'channel:',   label: 'Channel Cache',   desc: 'Channel profiles and pages'  },
//             { pattern: 'search:',    label: 'Search Cache',    desc: 'Search results and autocomplete' },
//             { pattern: 'appconfig:', label: 'Config Cache',    desc: 'App configuration values'    },
//           ].map(c => (
//             <button
//               key={c.pattern}
//               onClick={() => {
//                 if (window.confirm(`Flush ${c.label}? This may slow the platform temporarily.`))
//                   flushMutation.mutate(c.pattern)
//               }}
//               className="flex flex-col items-start p-3 bg-[#0F0F0F] rounded-xl border border-[#2E2E2E] hover:border-[#6C63FF] transition-colors text-left"
//             >
//               <span className="text-sm font-medium text-white">{c.label}</span>
//               <span className="text-xs text-[#555] mt-0.5">{c.desc}</span>
//               <span className="text-xs text-[#6C63FF] mt-2 flex items-center gap-1">
//                 <RefreshCw className="w-3 h-3" /> Flush
//               </span>
//             </button>
//           ))}
//         </div>
//       </Card>

//       {/* Kafka status */}
//       {kafkaData && (
//         <Card className="p-5">
//           <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
//             <Zap className="w-4 h-4" /> Kafka Status
//           </h2>
//           <div className="flex items-center gap-3">
//             <div className={cn('w-2.5 h-2.5 rounded-full', kafkaData.enabled ? 'bg-green-400' : 'bg-[#555]')} />
//             <span className="text-sm text-white">{kafkaData.enabled ? 'Connected' : 'Disabled'}</span>
//             <span className="text-xs text-[#555]">Mode: {kafkaData.mode}</span>
//           </div>
//           {kafkaData.brokers.length > 0 && (
//             <div className="mt-2">
//               {kafkaData.brokers.map(b => (
//                 <span key={b} className="text-xs text-[#888] bg-[#242424] px-2 py-1 rounded-lg mr-2">{b}</span>
//               ))}
//             </div>
//           )}
//         </Card>
//       )}
//     </div>
//   )
// }

// // ── Number Config Row ──────────────────────────

// function NumberConfigRow({ label, value, min, max, onSave }: {
//   label: string; value: number; min: number; max: number; onSave: (v: number) => void
// }) {
//   const [editing, setEditing] = useState(false)
//   const [local, setLocal]     = useState(String(value))

//   const save = () => {
//     const n = parseInt(local)
//     if (isNaN(n) || n < min || n > max) { toast.error(`Must be ${min}–${max}`); return }
//     onSave(n)
//     setEditing(false)
//   }

//   return (
//     <div className="bg-[#0F0F0F] rounded-xl p-3">
//       <p className="text-xs text-[#888] mb-2">{label}</p>
//       {editing ? (
//         <div className="flex items-center gap-2">
//           <input type="number" value={local} min={min} max={max}
//             onChange={e => setLocal(e.target.value)}
//             className="flex-1 h-8 bg-[#1A1A1A] border border-[#6C63FF] rounded-lg text-white text-sm px-2 outline-none"
//           />
//           <button onClick={save} className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center">
//             <Check className="w-3.5 h-3.5 text-white" />
//           </button>
//         </div>
//       ) : (
//         <button onClick={() => setEditing(true)} className="text-lg font-bold text-white hover:text-[#6C63FF] transition-colors">
//           {value}
//         </button>
//       )}
//     </div>
//   )
// }

// // ── String Config Row ──────────────────────────

// function StringConfigRow({ label, value, onSave }: {
//   label: string; value: string; onSave: (v: string) => void
// }) {
//   const [editing, setEditing] = useState(false)
//   const [local, setLocal]     = useState(value)

//   const save = () => {
//     if (!local.match(/^\d+\.\d+\.\d+$/)) { toast.error('Format: x.y.z'); return }
//     onSave(local)
//     setEditing(false)
//   }

//   return (
//     <div className="bg-[#0F0F0F] rounded-xl p-3">
//       <p className="text-xs text-[#888] mb-2">{label}</p>
//       {editing ? (
//         <div className="flex items-center gap-2">
//           <input value={local} onChange={e => setLocal(e.target.value)} placeholder="1.0.0"
//             className="flex-1 h-8 bg-[#1A1A1A] border border-[#6C63FF] rounded-lg text-white text-sm px-2 outline-none"
//           />
//           <button onClick={save} className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center">
//             <Check className="w-3.5 h-3.5 text-white" />
//           </button>
//         </div>
//       ) : (
//         <button onClick={() => setEditing(true)} className="text-lg font-bold text-white hover:text-[#6C63FF] transition-colors font-mono">
//           {value}
//         </button>
//       )}
//     </div>
//   )
// }





















import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, RefreshCw, AlertTriangle, Check, Zap, Server, ShieldAlert } from 'lucide-react'
import { configApi } from '../../api'
import { Button, Card, Toggle, Input, PageSpinner } from '../../components/ui'
import { cn, getErrorMessage } from '../../utils'
import type { AppConfig } from '../../types'
import toast from 'react-hot-toast'

export function AppConfigPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn : () => configApi.getAll().then(r => r.data.data.configs),
  })

  const { data: kafkaData } = useQuery({
    queryKey: ['admin', 'kafka'],
    queryFn : () => configApi.kafkaStatus().then(r => r.data.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => configApi.update(key, value),
    onSuccess : () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'config'] })
      toast.success('Config updated')
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  const flushMutation = useMutation({
    mutationFn: (pattern: string) => configApi.cacheFlush(pattern),
    onSuccess : () => toast.success('Cache flushed'),
    onError   : err => toast.error(getErrorMessage(err)),
  })

  if (isLoading) return <PageSpinner />
  if (!data)     return null

  const configMap = data.reduce((acc, c) => { acc[c.key] = c; return acc }, {} as Record<string, AppConfig>)

  const boolConfigs = [
    { key: 'maintenance_mode',     label: 'Maintenance Mode',          desc: 'Block all API requests with 503',  danger: true  },
    { key: 'registration_open',    label: 'Registration Open',         desc: 'Allow new user sign-ups',          danger: false },
    { key: 'whatsapp_otp_enabled', label: 'WhatsApp OTP',              desc: 'Enable WhatsApp OTP login',        danger: false },
    { key: 'google_oauth_enabled', label: 'Google OAuth',              desc: 'Enable Google sign-in',            danger: false },
    { key: 'apple_oauth_enabled',  label: 'Apple OAuth',               desc: 'Enable Apple sign-in',             danger: false },
    { key: 'force_update_enabled', label: 'Force App Update',          desc: 'Require minimum app version',      danger: false },
  ]

  const numberConfigs = [
    { key: 'max_post_image_size_mb', label: 'Max Post Image (MB)',   min: 1,  max: 50  },
    { key: 'max_audio_size_mb',      label: 'Max Audio Upload (MB)', min: 10, max: 500 },
    { key: 'max_tags_per_post',      label: 'Max Tags Per Post',     min: 1,  max: 30  },
    { key: 'otp_expiry_mins',        label: 'OTP Expiry (min)',      min: 1,  max: 30  },
  ]

  const stringConfigs = [
    { key: 'min_app_version_ios',     label: 'Min iOS Version'     },
    { key: 'min_app_version_android', label: 'Min Android Version' },
  ]

  const maintenanceEnabled = configMap['maintenance_mode']?.value === true

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 tracking-tight">
            <div className="w-10 h-10 bg-[#141414] border border-[#1F1F1F] rounded-xl flex items-center justify-center shadow-inner">
              <Settings className="w-5 h-5 text-[#E60000] drop-shadow-[0_0_8px_rgba(230,0,0,0.5)]" />
            </div>
            System Configuration
          </h1>
          <p className="text-[#71717A] text-sm mt-2 ml-1">Manage global platform parameters and infrastructure.</p>
        </div>
      </div>

      {/* Maintenance mode alert - Cyberpunk Critical Alert Style */}
      {maintenanceEnabled && (
        <div className="flex items-center gap-4 mb-8 px-6 py-4 bg-[#E60000]/10 border border-[#E60000]/30 rounded-[20px] shadow-[inset_0_0_20px_rgba(230,0,0,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E60000] animate-pulse shadow-[0_0_15px_rgba(230,0,0,1)]" />
          <ShieldAlert className="w-7 h-7 text-[#E60000] shrink-0 drop-shadow-[0_0_10px_rgba(230,0,0,0.8)] animate-pulse" />
          <div>
            <p className="text-base font-display font-bold text-white tracking-wide">Platform is in Maintenance Mode</p>
            <p className="text-sm font-sans text-[#E60000] mt-0.5">All incoming API requests are being blocked with 503 Service Unavailable. Disable to restore public access.</p>
          </div>
        </div>
      )}

      {/* Boolean toggles - Bento Card */}
      <Card className="p-8 mb-6 group transition-colors hover:border-[#2A2A2A]">
        <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
          Feature Gates
        </h2>
        <div className="flex flex-col divide-y divide-[#1F1F1F]">
          {boolConfigs.map(cfg => {
            const config = configMap[cfg.key]
            if (!config) return null
            const isCriticalActive = cfg.danger && (config.value as boolean)
            
            return (
              <div key={cfg.key} className={cn(
                'flex items-center justify-between py-4 first:pt-0 last:pb-0 transition-colors',
                isCriticalActive ? 'bg-[#E60000]/5 -mx-6 px-6 rounded-xl border border-[#E60000]/20 my-2' : 'hover:bg-[#141414] -mx-4 px-4 rounded-xl'
              )}>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-sans font-medium text-white">{cfg.label}</p>
                    {cfg.danger && (
                      <span className="text-[10px] font-mono bg-[#E60000]/10 border border-[#E60000]/30 text-[#E60000] px-2 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E60000] animate-pulse" />
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#71717A] mt-1.5 font-sans">{cfg.desc}</p>
                </div>
                <Toggle
                  checked={!!(config.value as boolean)}
                  onChange={(v) => {
                    if (cfg.danger && v) {
                      if (!window.confirm(`CRITICAL WARNING:\n\nAre you sure you want to enable "${cfg.label}"? This will immediately affect all users on the platform.`)) return
                    }
                    updateMutation.mutate({ key: cfg.key, value: v })
                  }}
                />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Grid for Numbers and Strings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Number configs */}
        <Card className="p-8 group transition-colors hover:border-[#2A2A2A]">
          <h2 className="text-lg font-display font-bold text-white mb-6">Limits & Thresholds</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {numberConfigs.map(cfg => {
              const config = configMap[cfg.key]
              if (!config) return null
              return (
                <NumberConfigRow
                  key={cfg.key}
                  label={cfg.label}
                  value={config.value as number}
                  min={cfg.min}
                  max={cfg.max}
                  onSave={(v) => updateMutation.mutate({ key: cfg.key, value: v })}
                />
              )
            })}
          </div>
        </Card>

        {/* String configs */}
        <Card className="p-8 group transition-colors hover:border-[#2A2A2A]">
          <h2 className="text-lg font-display font-bold text-white mb-6">Version Control</h2>
          <div className="flex flex-col gap-4">
            {stringConfigs.map(cfg => {
              const config = configMap[cfg.key]
              if (!config) return null
              return (
                <StringConfigRow
                  key={cfg.key}
                  label={cfg.label}
                  value={config.value as string}
                  onSave={(v) => updateMutation.mutate({ key: cfg.key, value: v })}
                />
              )
            })}
          </div>
        </Card>
      </div>

      {/* Cache management & Kafka Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cache management */}
        <Card className="p-8 lg:col-span-2 group transition-colors hover:border-[#2A2A2A]">
          <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-[#71717A]" /> Redis Cache Management
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { pattern: 'feed:',      label: 'Feed Cache',      desc: 'For you, trending, explore'  },
              { pattern: 'trending:',  label: 'Trending Cache',  desc: 'Trending scores and tags'     },
              { pattern: 'channel:',   label: 'Channel Cache',   desc: 'Channel profiles and pages'  },
              { pattern: 'search:',    label: 'Search Cache',    desc: 'Search results and auto-fill' },
              { pattern: 'appconfig:', label: 'Config Cache',    desc: 'App configuration values'    },
            ].map(c => (
              <button
                key={c.pattern}
                onClick={() => {
                  if (window.confirm(`Flush ${c.label}? This will force the database to rebuild the cache.`))
                    flushMutation.mutate(c.pattern)
                }}
                className="group/btn flex flex-col items-start p-4 bg-[#141414] rounded-xl border border-[#1F1F1F] hover:border-[#E60000]/50 hover:bg-[#E60000]/5 hover:shadow-[0_4px_20px_rgba(230,0,0,0.1)] transition-all duration-300 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#E60000] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                <span className="text-sm font-display font-bold text-white">{c.label}</span>
                <span className="text-xs text-[#71717A] mt-1 font-sans">{c.desc}</span>
                <div className="mt-4 flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono text-[#555] bg-[#0A0A0A] px-2 py-1 rounded border border-[#1F1F1F] group-hover/btn:border-[#E60000]/30 transition-colors">
                    {c.pattern}*
                  </span>
                  <span className="text-xs font-mono text-[#71717A] group-hover/btn:text-[#E60000] flex items-center gap-1.5 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5 group-hover/btn:animate-spin" /> Flush
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Kafka status */}
        {kafkaData && (
          <Card className="p-8 group transition-colors hover:border-[#2A2A2A] flex flex-col">
            <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FBBF24]" /> Message Broker
            </h2>
            
            <div className="bg-[#141414] border border-[#1F1F1F] rounded-xl p-5 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex items-center justify-center">
                  {kafkaData.enabled && <div className="absolute w-4 h-4 bg-[#00E676] rounded-full animate-ping opacity-20" />}
                  <div className={cn('w-3 h-3 rounded-full relative z-10', kafkaData.enabled ? 'bg-[#00E676] shadow-[0_0_10px_#00E676]' : 'bg-[#3F3F46]')} />
                </div>
                <div>
                  <span className="block text-sm font-display font-bold text-white tracking-wide">
                    {kafkaData.enabled ? 'KAFKA CONNECTED' : 'KAFKA OFFLINE'}
                  </span>
                  <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest mt-0.5 block">
                    Mode: <span className="text-[#A1A1AA]">{kafkaData.mode}</span>
                  </span>
                </div>
              </div>
              
              <div className="mt-auto">
                <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest mb-2 block border-t border-[#2A2A2A] pt-4">Active Brokers</span>
                <div className="flex flex-wrap gap-2">
                  {kafkaData.brokers.length > 0 ? (
                    kafkaData.brokers.map(b => (
                      <span key={b} className="text-[11px] font-mono text-[#A1A1AA] bg-[#0A0A0A] border border-[#2A2A2A] px-2.5 py-1 rounded-md shadow-inner">
                        {b}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] font-mono text-[#71717A]">No brokers detected</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// ── Number Config Row ──────────────────────────

function NumberConfigRow({ label, value, min, max, onSave }: {
  label: string; value: number; min: number; max: number; onSave: (v: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal]     = useState(String(value))

  const save = () => {
    const n = parseInt(local)
    if (isNaN(n) || n < min || n > max) { toast.error(`Must be between ${min} and ${max}`); return }
    onSave(n)
    setEditing(false)
  }

  return (
    <div className="bg-[#141414] border border-[#1F1F1F] rounded-xl p-4 hover:border-[#2A2A2A] transition-colors group">
      <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-widest mb-3">{label}</p>
      {editing ? (
        <div className="flex items-center gap-2 animate-in fade-in duration-200">
          <input type="number" value={local} min={min} max={max}
            onChange={e => setLocal(e.target.value)}
            className="flex-1 h-9 bg-[#0A0A0A] border border-[#E60000] focus:shadow-[0_0_10px_rgba(230,0,0,0.2)] rounded-lg text-white font-mono text-sm px-3 outline-none transition-all"
            autoFocus
          />
          <button onClick={save} className="w-9 h-9 bg-[#E60000] hover:bg-[#B30000] rounded-lg flex items-center justify-center transition-colors shadow-lg">
            <Check className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <button 
          onClick={() => { setLocal(String(value)); setEditing(true) }} 
          className="text-2xl font-display font-bold text-white group-hover:text-[#E60000] transition-colors flex items-center gap-2"
        >
          {value}
          <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono text-[#71717A] font-normal uppercase tracking-widest transition-opacity ml-auto bg-[#0A0A0A] border border-[#1F1F1F] px-2 py-1 rounded">Edit</span>
        </button>
      )}
    </div>
  )
}

// ── String Config Row ──────────────────────────

function StringConfigRow({ label, value, onSave }: {
  label: string; value: string; onSave: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal]     = useState(value)

  const save = () => {
    if (!local.match(/^\d+\.\d+\.\d+$/)) { toast.error('Format must be x.y.z (e.g. 1.0.0)'); return }
    onSave(local)
    setEditing(false)
  }

  return (
    <div className="bg-[#141414] border border-[#1F1F1F] rounded-xl p-4 flex items-center justify-between hover:border-[#2A2A2A] transition-colors group">
      <p className="text-sm font-sans font-medium text-white">{label}</p>
      {editing ? (
        <div className="flex items-center gap-2 animate-in fade-in duration-200">
          <input value={local} onChange={e => setLocal(e.target.value)} placeholder="1.0.0"
            className="w-24 h-9 bg-[#0A0A0A] border border-[#E60000] focus:shadow-[0_0_10px_rgba(230,0,0,0.2)] rounded-lg text-white font-mono text-sm px-2 outline-none text-center transition-all"
            autoFocus
          />
          <button onClick={save} className="w-9 h-9 bg-[#E60000] hover:bg-[#B30000] rounded-lg flex items-center justify-center transition-colors shadow-lg">
            <Check className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <button 
          onClick={() => { setLocal(value); setEditing(true) }} 
          className="text-base font-mono font-bold text-[#A1A1AA] group-hover:text-[#E60000] transition-colors bg-[#0A0A0A] border border-[#1F1F1F] px-3 py-1.5 rounded-lg group-hover:border-[#E60000]/30"
        >
          {value}
        </button>
      )}
    </div>
  )
}