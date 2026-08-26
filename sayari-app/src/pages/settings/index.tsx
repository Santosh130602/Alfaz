import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User, Settings, Lock, Bell, Camera,
  LogOut, ChevronRight, ArrowLeft, Check
} from 'lucide-react'
import { creatorApi, authApi, notificationsApi } from '../../api'
import { useAuthStore } from '../../store/auth.store'
import { tokenStorage } from '../../api/client'
import { Button, Input, Textarea, Select, Toggle, Avatar, Card, Tabs, Spinner } from '../../components/ui'
import { cn, getErrorMessage } from '../../utils'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────
//  SETTINGS PAGE (tabbed layout)
// ─────────────────────────────────────────────

export function SettingsPage() {
  const [tab, setTab] = useState('profile')
  const navigate      = useNavigate()
  const { logout }    = useAuthStore()

  const tabs = [
    { id: 'profile',  label: 'Profile',  icon: <User className="w-4 h-4" />     },
    { id: 'channel',  label: 'Channel',  icon: <Settings className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" />     },
    { id: 'notifs',   label: 'Notifications', icon: <Bell className="w-4 h-4" />},
  ]

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/login')
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-[#888] hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6" />

      {tab === 'profile'  && <ProfileSettings />}
      {tab === 'channel'  && <ChannelSettings />}
      {tab === 'security' && <SecuritySettings />}
      {tab === 'notifs'   && <NotificationSettings />}

      {/* Logout */}
      <div className="mt-8 pt-6 border-t border-[#2E2E2E]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-4 text-red-400 hover:bg-red-400/5 rounded-2xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  )
}

// ── Profile Settings ──────────────────────────

const profileSchema = z.object({
  displayName : z.string().min(2).max(60),
  username    : z.string().min(3).max(30).regex(/^[a-z0-9_.]+$/, 'Only lowercase letters, numbers, _ and .'),
  bio         : z.string().max(300).optional(),
  language    : z.enum(['ur', 'hi', 'en', 'mixed']),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl  : z.string().url().optional().or(z.literal('')),
  twitterUrl  : z.string().url().optional().or(z.literal('')),
  websiteUrl  : z.string().url().optional().or(z.literal('')),
})

type ProfileForm = z.infer<typeof profileSchema>

function ProfileSettings() {
  const { user, setUser }   = useAuthStore()
  const queryClient         = useQueryClient()
  const fileRef             = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, setValue } = useForm<ProfileForm>({
    resolver     : zodResolver(profileSchema),
    defaultValues: {
      displayName : user?.displayName || '',
      username    : user?.username    || '',
      bio         : user?.bio         || '',
      language    : (user?.language   || 'hi') as ProfileForm['language'],
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    try {
      const res = await creatorApi.updateMyProfile({
        displayName : data.displayName,
        username    : data.username,
        bio         : data.bio,
        language    : data.language,
        socialLinks : {
          instagram: data.instagramUrl || undefined,
          youtube  : data.youtubeUrl   || undefined,
          twitter  : data.twitterUrl   || undefined,
          website  : data.websiteUrl   || undefined,
        },
      })
      setUser(res.data.data.user)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }

    setUploading(true)
    try {
      const res = await creatorApi.uploadAvatar(file)
      if (user) setUser({ ...user, avatar: res.data.data.avatar as typeof user.avatar })
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Avatar upload */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar user={user} size="xl" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-[#6C63FF] rounded-full flex items-center justify-center hover:bg-[#5A52D5] transition-colors"
          >
            {uploading ? <Spinner size="sm" className="text-white" /> : <Camera className="w-3.5 h-3.5 text-white" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{user?.displayName}</p>
          <p className="text-xs text-[#888]">@{user?.username}</p>
          <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-[#6C63FF] hover:underline mt-1">
            Change avatar
          </button>
        </div>
      </div>

      <Input label="Display Name" error={errors.displayName?.message} {...register('displayName')} />

      <Input
        label="Username"
        error={errors.username?.message}
        {...register('username')}
        onChange={e => setValue('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
      />

      <Textarea label="Bio" placeholder="Tell your story..." rows={3} error={errors.bio?.message} {...register('bio')} />

      <Select
        label="Language"
        options={[
          { value: 'hi', label: 'हिंदी' }, { value: 'ur', label: 'اردو' },
          { value: 'en', label: 'English' }, { value: 'mixed', label: 'Mixed' },
        ]}
        {...register('language')}
      />

      {/* Social links */}
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[#888] font-medium">Social Links</p>
        <Input placeholder="Instagram URL" {...register('instagramUrl')} />
        <Input placeholder="YouTube URL"   {...register('youtubeUrl')}   />
        <Input placeholder="Twitter URL"   {...register('twitterUrl')}   />
        <Input placeholder="Website URL"   {...register('websiteUrl')}   />
      </div>

      <Button type="submit" loading={isSubmitting} disabled={!isDirty} icon={<Check className="w-4 h-4" />}>
        Save Changes
      </Button>
    </form>
  )
}

// ── Channel Settings ──────────────────────────

const channelSchema = z.object({
  name       : z.string().min(2).max(80),
  handle     : z.string().min(3).max(40).regex(/^[a-z0-9_.]+$/, 'Only lowercase letters, numbers, _ and .'),
  tagline    : z.string().max(160).optional(),
  description: z.string().max(2000).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

type ChannelForm = z.infer<typeof channelSchema>

function ChannelSettings() {
  const queryClient = useQueryClient()
  const fileRef     = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const { data: channelData, isLoading } = useQuery({
    queryKey: ['myChannel'],
    queryFn : () => creatorApi.getMyChannel().then(r => r.data.data.channel),
  })

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, setValue, watch } = useForm<ChannelForm>({
    resolver     : zodResolver(channelSchema),
    defaultValues: {
      name       : channelData?.name        || '',
      handle     : channelData?.handle      || '',
      tagline    : channelData?.tagline     || '',
      description: channelData?.description || '',
      accentColor: channelData?.theme?.accentColor || '#6C63FF',
    },
  })

  const onSubmit = async (data: ChannelForm) => {
    try {
      await creatorApi.updateChannel({
        name       : data.name,
        handle     : data.handle,
        tagline    : data.tagline,
        description: data.description,
        theme      : { accentColor: data.accentColor },
      } as Parameters<typeof creatorApi.updateChannel>[0])
      queryClient.invalidateQueries({ queryKey: ['myChannel'] })
      toast.success('Channel updated!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      // Upload as avatar for now (same endpoint)
      await creatorApi.uploadAvatar(file)
      queryClient.invalidateQueries({ queryKey: ['myChannel'] })
      toast.success('Logo updated!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally { setUploading(false) }
  }

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={channelData?.logo?.thumbnail} name={channelData?.name} size="xl" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-[#6C63FF] rounded-full flex items-center justify-center">
            {uploading ? <Spinner size="sm" className="text-white" /> : <Camera className="w-3.5 h-3.5 text-white" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{channelData?.name}</p>
          <p className="text-xs text-[#888]">@{channelData?.handle}</p>
        </div>
      </div>

      <Input label="Channel Name" error={errors.name?.message}   {...register('name')}   />
      <Input
        label="Handle"
        error={errors.handle?.message}
        {...register('handle')}
        onChange={e => setValue('handle', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
      />
      <Input label="Tagline" placeholder="Your creative one-liner..." error={errors.tagline?.message} {...register('tagline')} />
      <Textarea label="Description" rows={4} placeholder="Tell the world about your channel..." error={errors.description?.message} {...register('description')} />

      {/* Accent colour */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-[#888] font-medium">Accent Colour</label>
        <div className="flex items-center gap-3">
          <input type="color" value={watch('accentColor')} onChange={e => setValue('accentColor', e.target.value)}
            className="w-11 h-11 rounded-xl border border-[#2E2E2E] bg-[#1A1A1A] cursor-pointer" />
          <Input {...register('accentColor')} placeholder="#6C63FF" className="font-mono" />
        </div>
      </div>

      <Button type="submit" loading={isSubmitting} disabled={!isDirty} icon={<Check className="w-4 h-4" />}>
        Save Channel
      </Button>
    </form>
  )
}

// ── Security Settings ─────────────────────────

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword    : z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/\d/),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
})

type PasswordForm = z.infer<typeof passwordSchema>

function SecuritySettings() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data: PasswordForm) => {
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword)
      reset()
      toast.success('Password changed successfully!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h3 className="text-base font-semibold text-white mb-5">Change Password</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Current Password"
            type={showCurrent ? 'text' : 'password'}
            placeholder="Your current password"
            error={errors.currentPassword?.message}
            suffix={<button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-xs text-[#888]">{showCurrent ? 'Hide' : 'Show'}</button>}
            {...register('currentPassword')}
          />
          <Input
            label="New Password"
            type={showNew ? 'text' : 'password'}
            placeholder="Min 8 chars, uppercase, number"
            error={errors.newPassword?.message}
            suffix={<button type="button" onClick={() => setShowNew(!showNew)} className="text-xs text-[#888]">{showNew ? 'Hide' : 'Show'}</button>}
            {...register('newPassword')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" loading={isSubmitting} icon={<Lock className="w-4 h-4" />}>
            Change Password
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-white mb-2">Active Sessions</h3>
        <p className="text-sm text-[#888] mb-4">Log out from all devices for extra security</p>
        <Button
          variant="danger"
          size="sm"
          onClick={async () => {
            try {
              await authApi.logout(undefined, true)
              toast.success('Logged out from all devices')
            } catch (err) { toast.error(getErrorMessage(err)) }
          }}
        >
          Log Out All Devices
        </Button>
      </Card>
    </div>
  )
}

// ── Notification Settings ─────────────────────

function NotificationSettings() {
  const queryClient = useQueryClient()

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['notif-prefs'],
    queryFn : () => notificationsApi.getPrefs().then(r => r.data.data.prefs as Record<string, boolean>),
  })

  const updateMutation = useMutation({
    mutationFn: (update: Record<string, boolean>) => notificationsApi.updatePrefs(update),
    onSuccess  : () => {
      queryClient.invalidateQueries({ queryKey: ['notif-prefs'] })
      toast.success('Preferences saved')
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>

  const sections = [
    {
      title: 'Activity',
      items: [
        { key: 'newFollower', label: 'New followers',     desc: 'When someone follows you'                },
        { key: 'newComment',  label: 'Comments',          desc: 'When someone comments on your posts'     },
        { key: 'newLike',     label: 'Likes',             desc: 'When your posts get liked'               },
        { key: 'newChapter',  label: 'New chapters',      desc: 'When creators you follow post new content'},
      ],
    },
    {
      title: 'Delivery',
      items: [
        { key: 'push',      label: 'Push notifications', desc: 'In-app and mobile alerts'   },
        { key: 'whatsapp',  label: 'WhatsApp',           desc: 'Notifications via WhatsApp' },
        { key: 'email',     label: 'Email',              desc: 'Email notifications'         },
      ],
    },
    {
      title: 'Platform',
      items: [
        { key: 'adminAnnouncement', label: 'Announcements', desc: 'Important platform updates' },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {sections.map(section => (
        <div key={section.title}>
          <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">{section.title}</h3>
          <Card className="divide-y divide-[#2E2E2E]">
            {section.items.map(item => (
              <div key={item.key} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-white">{item.label}</p>
                  <p className="text-xs text-[#555] mt-0.5">{item.desc}</p>
                </div>
                <Toggle
                  checked={!!prefs?.[item.key]}
                  onChange={v => updateMutation.mutate({ [item.key]: v })}
                />
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  )
}
