import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import WaveSurfer from 'wavesurfer.js'
import {
  Upload, Music, Image as ImageIcon, X, Check,
  Play, Pause, ArrowLeft, Mic
} from 'lucide-react'
import { postsApi } from '../../api'
import { Button, Input, Select, Spinner, Modal } from '../../components/ui'
import { cn, formatDuration, getErrorMessage } from '../../utils'
import type { Visibility } from '../../types'
import toast from 'react-hot-toast'

const MAX_AUDIO_MB = 100
const MAX_COVER_MB = 10
const ALLOWED_AUDIO = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/x-m4a']

export function AudioUploadPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [audioFile, setAudioFile]   = useState<File | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)
  const [coverFile, setCoverFile]   = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [narrator, setNarrator]     = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading]   = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)

  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const waveformRef    = useRef<HTMLDivElement>(null)
  const wavesurferRef  = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration]   = useState(0)

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['post', id, 'audio-edit'],
    queryFn : () => postsApi.get(id!).then(r => r.data.data.post),
    enabled : !!id,
  })

  // ── Initialise waveform when audio preview is ready ──
  useEffect(() => {
    if (!audioPreviewUrl || !waveformRef.current) return

    wavesurferRef.current?.destroy()

    const ws = WaveSurfer.create({
      container : waveformRef.current,
      waveColor : '#3E3E3E',
      progressColor: '#6C63FF',
      cursorColor: '#FF6584',
      barWidth  : 3,
      barGap    : 2,
      barRadius : 3,
      height    : 64,
      url       : audioPreviewUrl,
    })

    ws.on('ready', () => setDuration(ws.getDuration()))
    ws.on('play',  () => setIsPlaying(true))
    ws.on('pause', () => setIsPlaying(false))
    ws.on('finish',() => setIsPlaying(false))

    wavesurferRef.current = ws

    return () => { ws.destroy() }
  }, [audioPreviewUrl])

  // ── Handle audio file select ──────────────────
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_AUDIO.includes(file.type)) {
      toast.error('Please select a valid audio file (MP3, WAV, M4A, OGG)')
      return
    }
    if (file.size > MAX_AUDIO_MB * 1024 * 1024) {
      toast.error(`Audio must be under ${MAX_AUDIO_MB}MB`)
      return
    }

    setAudioFile(file)
    setAudioPreviewUrl(URL.createObjectURL(file))
  }

  // ── Handle cover image select ─────────────────
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > MAX_COVER_MB * 1024 * 1024) { toast.error(`Cover must be under ${MAX_COVER_MB}MB`); return }

    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const togglePlay = useCallback(() => {
    wavesurferRef.current?.playPause()
  }, [])

  // ── Upload mutation ────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!audioFile) throw new Error('No audio file selected')
      setUploading(true)

      // 1. Upload audio
      await postsApi.uploadAudio(id!, audioFile, (pct) => setUploadProgress(pct))

      // 2. Upload cover if provided
      if (coverFile) {
        await postsApi.uploadCover(id!, coverFile)
      }

      // 3. Update title/narrator metadata
      if (narrator) {
        await postsApi.update(id!, { title: post?.title } as never)
      }

      return true
    },
    onSuccess: () => {
      setUploading(false)
      toast.success('Audio uploaded! Ready to publish')
      setShowPublishModal(true)
    },
    onError: err => { setUploading(false); toast.error(getErrorMessage(err)) },
  })

  if (postLoading) return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center"><Spinner size="lg" /></div>
  )

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 h-14 flex items-center justify-between px-4 border-b border-[#2E2E2E] bg-[#0F0F0F]/95 backdrop-blur">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#888] hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold text-white">Upload Audio</h1>
        <div className="w-5" />
      </div>

      <div className="max-w-md mx-auto p-4 flex flex-col gap-6">

        {/* Audio uploader */}
        {!audioFile ? (
          <button
            onClick={() => audioInputRef.current?.click()}
            className="aspect-video border-2 border-dashed border-[#2E2E2E] rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#6C63FF] transition-colors"
          >
            <div className="w-14 h-14 bg-[#6C63FF]/20 rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 text-[#6C63FF]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">Upload audio file</p>
              <p className="text-xs text-[#888] mt-1">MP3, WAV, M4A — up to {MAX_AUDIO_MB}MB</p>
            </div>
          </button>
        ) : (
          <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white font-medium truncate">{audioFile.name}</p>
              <button onClick={() => { setAudioFile(null); setAudioPreviewUrl(null) }} className="text-[#888] hover:text-red-400 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Waveform */}
            <div ref={waveformRef} className="mb-3" />

            <div className="flex items-center justify-between">
              <button onClick={togglePlay} className="w-9 h-9 bg-[#6C63FF] rounded-full flex items-center justify-center">
                {isPlaying ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
              </button>
              <span className="text-xs text-[#888]">{formatDuration(duration)}</span>
            </div>
          </div>
        )}
        <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioSelect} />

        {/* Cover image uploader */}
        <div>
          <label className="text-sm text-[#888] font-medium mb-2 block">Cover Image</label>
          {!coverFile ? (
            <button
              onClick={() => coverInputRef.current?.click()}
              className="w-full aspect-square max-w-[200px] mx-auto border-2 border-dashed border-[#2E2E2E] rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#6C63FF] transition-colors"
            >
              <ImageIcon className="w-6 h-6 text-[#888]" />
              <span className="text-xs text-[#888]">Add cover art</span>
            </button>
          ) : (
            <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-2xl overflow-hidden">
              <img src={coverPreview!} alt="Cover" className="w-full h-full object-cover" />
              <button onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
        </div>

        {/* Narrator */}
        <Input
          label="Narrator (optional)"
          placeholder="Who is narrating this audio?"
          value={narrator}
          onChange={e => setNarrator(e.target.value)}
        />

        {/* Upload progress */}
        {uploading && (
          <div className="flex flex-col gap-2">
            <div className="h-2 bg-[#242424] rounded-full overflow-hidden">
              <div className="h-full bg-[#6C63FF] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-xs text-[#888] text-center">{uploadProgress}% uploaded</p>
          </div>
        )}

        <Button
          icon={<Upload className="w-4 h-4" />}
          disabled={!audioFile}
          loading={uploadMutation.isPending}
          onClick={() => uploadMutation.mutate()}
        >
          Upload & Continue
        </Button>
      </div>

      {showPublishModal && (
        <AudioPublishModal postId={id!} onClose={() => setShowPublishModal(false)} />
      )}
    </div>
  )
}

// ── Publish Modal (audio) ─────────────────────

function AudioPublishModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [scheduling, setScheduling] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')

  const publishMutation = useMutation({
    mutationFn: async () => {
      await postsApi.update(postId, { visibility })
      return postsApi.publish(postId, scheduling ? scheduledAt : undefined)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPosts'] })
      toast.success(scheduling ? 'Audio scheduled!' : 'Audio published! 🎉')
      navigate(`/post/${postId}`)
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  return (
    <Modal open onClose={onClose} title="Publish Audio" size="sm">
      <div className="p-6 flex flex-col gap-4">
        <Select
          label="Who can see this?"
          value={visibility}
          onChange={e => setVisibility(e.target.value as Visibility)}
          options={[
            { value: 'public',         label: '🌐 Public — Everyone'   },
            { value: 'followers_only', label: '👥 Followers only'      },
            { value: 'private',        label: '🔒 Private — Only me'   },
          ]}
        />

        <label className="flex items-center gap-2 text-sm text-[#888]">
          <input type="checkbox" checked={scheduling} onChange={e => setScheduling(e.target.checked)} className="accent-[#6C63FF]" />
          Schedule for later
        </label>

        {scheduling && (
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full h-11 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl text-white px-4 outline-none focus:border-[#6C63FF]"
          />
        )}

        <div className="flex gap-3 mt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Later</Button>
          <Button
            className="flex-1"
            icon={<Check className="w-4 h-4" />}
            loading={publishMutation.isPending}
            disabled={scheduling && !scheduledAt}
            onClick={() => publishMutation.mutate()}
          >
            {scheduling ? 'Schedule' : 'Publish'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
