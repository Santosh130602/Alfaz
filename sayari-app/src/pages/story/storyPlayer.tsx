import { useState, useRef, useEffect } from 'react'
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, Share2, MessageSquare, Sparkles, Disc3 
} from 'lucide-react'
import { useAudioStore } from '../../store'
import { Button, Avatar } from '../../components/ui'
import { cn } from '../../utils'

export function StoryPlayerPage() {
  const { currentPost, isPlaying, setPlaying, playNext, playPrev } = useAudioStore()
  
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(180) // 3 mins default
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)

  // Fallback data if no audio is currently loaded in store
  const story = {
    title: currentPost?.title || 'The Midnight Whispers & Lost Verses',
    author: currentPost?.author?.displayName || 'Faiz Ahmed Faiz',
    username: currentPost?.author?.username || 'faiz_official',
    avatar: currentPost?.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    cover: currentPost?.mediaUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    content: currentPost?.content || `Raat yun dil mein teri khoyi hui yaad aayi\nJaise veeraane mein chupke se bahaar aa jaaye\nJaise saahron mein chupke se qadam rakh de koi\nJaise sote hue raathon mein sharaab aa jaaye...\n\nYeh tera hi zikr tha jo subah tak chalta raha,\nHar ek lafz mein bas tera hi naam ghulta raha.`,
    likes: 1240,
    comments: 312,
  }

  // Simulated audio progress ticker when playing
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isPlaying, duration, setPlaying])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = Math.floor(secs % 60)
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 select-none text-text">
      
      {/* ── MAIN STORY PLAYER CONTAINER (Spotify Immersive Theme Style) ── */}
      <div className="relative rounded-[32px] bg-gradient-to-b from-primary/20 via-surface to-surface border border-border/60 p-6 md:p-10 shadow-2xl overflow-hidden backdrop-blur-2xl">
        
        {/* Ambient Glow background */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left: Animated Cover / Vinyl Art */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className={cn(
              "relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-border/80 transition-transform duration-700",
              isPlaying ? "scale-105 shadow-primary/30" : "scale-100"
            )}>
              <img src={story.cover} alt={story.title} className="w-full h-full object-cover" />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-black/40 px-3 py-1 rounded-full w-fit mb-1">
                  Immersive Audio Story
                </span>
                <p className="text-white font-bold text-sm truncate">{story.title}</p>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3 mt-6 bg-surface2/60 px-5 py-2.5 rounded-full border border-border/50 shadow-sm">
              <img src={story.avatar} alt={story.author} className="w-9 h-9 rounded-full object-cover border border-primary/40" />
              <div>
                <p className="text-sm font-bold text-text">{story.author}</p>
                <p className="text-[10px] text-muted font-mono">@{story.username}</p>
              </div>
            </div>
          </div>

          {/* Right: Scrolling Story / Lyrics / Poetry Text */}
          <div className="lg:col-span-7 flex flex-col h-[380px] bg-surface2/40 border border-border/50 rounded-2xl p-6 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Disc3 className="w-4 h-4 animate-spin" /> Live Verses & Story
              </span>
              <div className="flex items-center gap-3 text-muted">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={cn("transition-colors hover:text-primary", isLiked && "text-accent")}
                >
                  <Heart className={cn("w-5 h-5", isLiked && "fill-accent")} />
                </button>
                <button className="hover:text-text transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Text Box */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4 text-center md:text-left flex flex-col justify-center">
              <h2 className="text-xl md:text-2xl font-black text-text tracking-tight mb-2">{story.title}</h2>
              <p className="text-sm md:text-base text-text/90 font-medium whitespace-pre-line leading-relaxed italic">
                {story.content}
              </p>
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted">
              <span>❤️ {story.likes} Likes</span>
              <span>💬 {story.comments} Comments</span>
            </div>
          </div>

        </div>

        {/* ── BOTTOM AUDIO CONTROLS BAR ── */}
        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col gap-4">
          
          {/* Progress Slider Bar */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-xs font-mono text-muted w-10 text-right">{formatTime(currentTime)}</span>
            <div 
              className="flex-1 h-2 bg-surface2 rounded-full overflow-hidden cursor-pointer relative group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const pos = (e.clientX - rect.left) / rect.width
                setCurrentTime(pos * duration)
              }}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-150"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted w-10">{formatTime(duration)}</span>
          </div>

          {/* Buttons and Volume Controls */}
          <div className="flex items-center justify-between">
            
            {/* Left Options */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsShuffling(!isShuffling)}
                className={cn("text-muted hover:text-text transition-colors", isShuffling && "text-primary")}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsLooping(!isLooping)}
                className={cn("text-muted hover:text-text transition-colors", isLooping && "text-primary")}
                title="Repeat"
              >
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            {/* Center Playback Controls */}
            <div className="flex items-center gap-4">
              <button 
                onClick={playPrev}
                className="text-muted hover:text-text transition-colors p-2"
                title="Previous"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button 
                onClick={() => setPlaying(!isPlaying)}
                className="w-14 h-14 rounded-full bg-primary text-bg flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                )}
              </button>

              <button 
                onClick={playNext}
                className="text-muted hover:text-text transition-colors p-2"
                title="Next"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>
            </div>

            {/* Right Volume Controls */}
            <div className="hidden sm:flex items-center gap-3 w-36">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-muted hover:text-text transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value))
                  setIsMuted(false)
                }}
                className="w-full h-1.5 bg-surface2 rounded-full accent-primary cursor-pointer"
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}