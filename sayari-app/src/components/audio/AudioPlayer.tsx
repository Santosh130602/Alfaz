import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, X, Volume2, ChevronUp, ChevronDown } from 'lucide-react'
import { useAudioStore } from '../../store/index'
import { cn, formatDuration, getDriveThumb } from '../../utils'
import { Link } from 'react-router-dom'

export function AudioMiniPlayer() {
  const {
    currentPost, isPlaying, currentTime, duration, playbackSpeed, volume,
    isMinimised, setPlaying, setCurrentTime, setDuration, setSpeed, setVolume,
    setMinimised, playNext, playPrev, clearPlayer,
  } = useAudioStore()

  const audioRef = useRef<HTMLAudioElement>(null)
  const [seeking, setSeeking] = useState(false)

  // Sync audio element with store
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentPost?.audio?.fileUrl) return
    audio.src   = currentPost.audio.fileUrl
    audio.load()
    if (isPlaying) audio.play().catch(() => {})
  }, [currentPost?._id])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) audio.play().catch(() => {})
    else audio.pause()
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed
  }, [playbackSpeed])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  if (!currentPost) return null

  const cover    = currentPost.audio?.coverImage?.thumbnail || currentPost.audio?.coverImage?.url
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const SPEEDS   = [0.75, 1, 1.25, 1.5, 2]

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value)
    setCurrentTime(t)
    if (audioRef.current) audioRef.current.currentTime = t
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => !seeking && setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => { playNext(); if (!useAudioStore.getState().currentPost) setPlaying(false) }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Player bar */}
      <div className={cn(
        'fixed bottom-16 md:bottom-0 left-0 right-0 z-50 transition-all duration-300',
        'bg-[#1A1A1A]/95 backdrop-blur border-t border-[#2E2E2E] shadow-2xl',
        isMinimised ? 'h-16' : 'h-auto'
      )}>
        {/* Progress bar (always visible) */}
        <div className="relative h-0.5 bg-[#2E2E2E] group cursor-pointer">
          <div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#FF6584]" style={{ width: `${progress}%` }} />
          <input
            type="range" min={0} max={duration || 100} value={currentTime} step={0.5}
            onChange={handleSeek}
            onMouseDown={() => setSeeking(true)}
            onMouseUp={() => setSeeking(false)}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-2">
          {/* Cover + info */}
          <Link to={`/post/${currentPost._id}`} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#242424] shrink-0">
              {cover
                ? <img src={getDriveThumb(cover)} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-lg">🎙️</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentPost.title || 'Audio'}</p>
              <p className="text-xs text-[#888] truncate">{typeof currentPost.author === 'object' ? currentPost.author.displayName : ''}</p>
            </div>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={playPrev} className="p-1.5 text-[#888] hover:text-white transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPlaying(!isPlaying)}
              className="w-9 h-9 bg-[#6C63FF] hover:bg-[#5A52D5] rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying
                ? <Pause className="w-4 h-4 text-white" fill="white" />
                : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
              }
            </button>
            <button onClick={playNext} className="p-1.5 text-[#888] hover:text-white transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Time */}
          <span className="text-xs text-[#555] shrink-0 hidden sm:block">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>

          {/* Expand/collapse */}
          <button onClick={() => setMinimised(!isMinimised)} className="p-1.5 text-[#888] hover:text-white transition-colors">
            {isMinimised ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button onClick={clearPlayer} className="p-1.5 text-[#888] hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded controls */}
        {!isMinimised && (
          <div className="px-4 pb-4 flex items-center gap-4 border-t border-[#2E2E2E] pt-3">
            {/* Speed */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#888] mr-1">Speed</span>
              {SPEEDS.map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn('text-xs px-2 py-1 rounded-lg transition-colors',
                    playbackSpeed === s ? 'bg-[#6C63FF] text-white' : 'text-[#888] hover:text-white'
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 ml-auto">
              <Volume2 className="w-4 h-4 text-[#888]" />
              <input
                type="range" min={0} max={1} step={0.05} value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-20 accent-[#6C63FF]"
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
