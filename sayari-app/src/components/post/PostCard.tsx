import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Heart, MessageCircle, Bookmark, Share2, Play,
  Lock, Users, MoreHorizontal, Flag
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useAudioStore } from '../../store/index'
import { engagementApi } from '../../api'
import { Avatar, BadgePill } from '../ui'
import { cn, formatCount, timeAgo, getDriveThumb, POST_TYPE_LABELS, driveImg } from '../../utils'
import { REACTIONS } from '../../types'
import type { Post, ReactionType } from '../../types'
import toast from 'react-hot-toast'

interface PostCardProps {
  post         : Post
  onLiked?     : (postId: string, liked: boolean, reactionType: ReactionType | null) => void
  onSaved?     : (postId: string, saved: boolean) => void
  showChannel? : boolean
  compact?     : boolean
}

export function PostCard({ post, onLiked, onSaved, showChannel = true, compact = false }: PostCardProps) {
  const { isAuthenticated }    = useAuthStore()
  const { setPost }            = useAudioStore()
  const navigate               = useNavigate()
  const [liked, setLiked]      = useState(false)
  const [saved, setSaved]      = useState(false)
  const [likeCount, setLikeCount] = useState(post.stats.likeCount)
  const [showReactions, setShowReactions] = useState(false)
  const [currentReaction, setCurrentReaction] = useState<ReactionType | null>(null)
  const [reporting, setReporting] = useState(false)

  const isAudio = post.type === 'audio'

  const handleLike = async (reactionType: ReactionType = 'like') => {
    if (!isAuthenticated) { navigate('/login'); return }
    setShowReactions(false)
    const newLiked = currentReaction !== reactionType
    const delta    = newLiked ? 1 : -1
    setLiked(newLiked)
    setCurrentReaction(newLiked ? reactionType : null)
    setLikeCount(c => c + delta)
    try {
      const res = await engagementApi.toggleLike(post._id, 'post', reactionType)
      onLiked?.(post._id, res.data.data.liked, res.data.data.reactionType)
    } catch { setLikeCount(c => c - delta); setLiked(!newLiked) }
  }

  const handleSave = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    const newSaved = !saved
    setSaved(newSaved)
    try {
      await engagementApi.toggleSave(post._id, 'post')
      onSaved?.(post._id, newSaved)
      toast(newSaved ? '🔖 Saved!' : 'Removed from saved')
    } catch { setSaved(!newSaved) }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post._id}`
    if (navigator.share) {
      await navigator.share({ title: post.title || 'Sayari Post', url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    }
  }

  const handleReport = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (reporting) return
    setReporting(true)
    try {
      await engagementApi.report(post._id, 'post', 'inappropriate')
      toast.success('Report submitted')
    } catch { toast.error('Failed to report') }
    finally { setReporting(false) }
  }

  return (
    <article className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl overflow-hidden hover:border-[#3E3E3E] transition-colors">

      {/* Author header */}
      {showChannel && (
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Link to={`/@${post.author.username}`}>
            <Avatar user={post.author} size="sm" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link to={`/@${post.author.username}`} className="text-sm font-semibold text-white hover:text-[#6C63FF] transition-colors truncate">
                {post.author.displayName}
              </Link>
              {post.author.isVerified && <span className="text-xs">✅</span>}
              {post.author.badges?.slice(0, 1).map(b => <BadgePill key={b.type} type={b.type} />)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#888]">@{post.author.username}</span>
              <span className="text-xs text-[#555]">·</span>
              <span className="text-xs text-[#555]">{timeAgo(post.publishedAt || post.createdAt)}</span>
            </div>
          </div>

          {/* Type badge + visibility */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs bg-[#242424] text-[#888] px-2 py-0.5 rounded-full">
              {POST_TYPE_LABELS[post.type] || post.type}
            </span>
            {post.visibility === 'private' && <Lock className="w-3.5 h-3.5 text-[#888]" />}
            {post.visibility === 'followers_only' && <Users className="w-3.5 h-3.5 text-[#888]" />}
          </div>
        </div>
      )}

      {/* Title if present */}
      {post.title && !compact && (
        <p className="px-4 pb-2 text-sm text-[#ccc] font-medium">{post.title}</p>
      )}

      {/* Content */}
      {isAudio ? (
        <AudioPostContent post={post} onPlay={() => setPost(post)} />
      ) : (
        <ImagePostContent post={post} />
      )}

      {/* Tags */}
      {post.tags?.length > 0 && !compact && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2">
          {post.tags.slice(0, 4).map(tag => (
            <Link key={tag} to={`/search?tag=${tag}`} className="text-xs text-[#6C63FF] hover:underline">
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Engagement bar */}
      <div className="flex items-center gap-1 px-3 py-3 border-t border-[#2E2E2E]">
        {/* Like / Reactions */}
        <div className="relative">
          <button
            onClick={() => handleLike()}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 300)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-colors',
              liked ? 'text-[#FF6584] bg-[#FF6584]/10' : 'text-[#888] hover:text-white hover:bg-[#242424]'
            )}
          >
            {currentReaction ? REACTIONS.find(r => r.type === currentReaction)?.emoji : <Heart className="w-4 h-4" />}
            <span>{formatCount(likeCount)}</span>
          </button>

          {/* Reaction picker */}
          {showReactions && (
            <div
              className="absolute bottom-full left-0 mb-2 flex gap-1 bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-2 shadow-xl z-10"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              {REACTIONS.map(r => (
                <button
                  key={r.type}
                  onClick={() => handleLike(r.type)}
                  title={r.label}
                  className="text-xl hover:scale-125 transition-transform p-1"
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comments */}
        <Link
          to={`/post/${post._id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#888] hover:text-white hover:bg-[#242424] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{formatCount(post.stats.commentCount)}</span>
        </Link>

        {/* Save */}
        <button
          onClick={handleSave}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-colors',
            saved ? 'text-[#6C63FF] bg-[#6C63FF]/10' : 'text-[#888] hover:text-white hover:bg-[#242424]'
          )}
        >
          <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
          <span className="hidden sm:inline">{formatCount(post.stats.saveCount)}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#888] hover:text-white hover:bg-[#242424] transition-colors ml-auto"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Report */}
        <button
          onClick={handleReport}
          className="p-1.5 rounded-xl text-[#888] hover:text-white hover:bg-[#242424] transition-colors"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>
    </article>
  )
}

// ── Image Post Content ────────────────────────

function ImagePostContent({ post }: { post: Post }) {
  const [imgError, setImgError] = useState(false)
  const imageUrl = post.renderedImage?.url
  const isRendering = !imageUrl && !!post.canvasState?.fabricJson

  if (!imageUrl || imgError) {
    return (
      <div className="aspect-square bg-gradient-to-br from-[#6C63FF]/20 to-[#FF6584]/20 flex items-center justify-center">
        <div className="text-center px-6">
          {isRendering ? (
            <>
              <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-[#888] text-xs">Rendering...</p>
            </>
          ) : (
            <p className="text-[#888] text-sm font-urdu">{post.title || 'Sayari'}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Link to={`/post/${post._id}`}>
      <div className="relative aspect-square overflow-hidden bg-[#0F0F0F]">
        <img
          src={getDriveThumb(imageUrl)}
          alt={post.title || 'Post'}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    </Link>
  )
}

// ── Audio Post Content ────────────────────────

function AudioPostContent({ post, onPlay }: { post: Post; onPlay: () => void }) {
  const { currentPost, isPlaying } = useAudioStore()
  const isCurrentlyPlaying = currentPost?._id === post._id && isPlaying

  return (
    <div className="relative">
      {/* Cover art */}
      <div className="aspect-square bg-gradient-to-br from-[#1A1A2E] to-[#2E1A2E] relative overflow-hidden">
        {post.audio?.coverImage?.url ? (
          <img src={getDriveThumb(post.audio.coverImage.url)} alt="Cover" className="w-full h-full object-cover opacity-70" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-7xl opacity-20">🎙️</div>
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={onPlay}
            className="w-16 h-16 bg-[#6C63FF] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
          >
            {isCurrentlyPlaying
              ? <div className="flex gap-1"><span className="w-1 h-5 bg-white rounded-full animate-pulse" /><span className="w-1 h-5 bg-white rounded-full animate-pulse delay-75" /><span className="w-1 h-5 bg-white rounded-full animate-pulse delay-150" /></div>
              : <Play className="w-7 h-7 text-white ml-1" fill="white" />
            }
          </button>
        </div>

        {/* Duration */}
        {post.audio?.duration && (
          <span className="absolute bottom-3 right-3 text-xs text-white bg-black/60 px-2 py-0.5 rounded-full">
            {Math.floor(post.audio.duration / 60)}:{String(Math.floor(post.audio.duration % 60)).padStart(2, '0')}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Post Grid (for channel pages) ────────────

export function PostGrid({ posts, loading }: { posts: Post[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square bg-[#1A1A1A] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map(post => (
        <Link key={post._id} to={`/post/${post._id}`} className="aspect-square relative overflow-hidden bg-[#1A1A1A] group">
          {post.renderedImage?.thumbnail ? (
            <img src={post.renderedImage.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : post.type === 'audio' ? (
            <div className="w-full h-full bg-gradient-to-br from-[#1A1A2E] to-[#2E1A2E] flex items-center justify-center">
              <Play className="w-6 h-6 text-[#6C63FF]" />
            </div>
          ) : (
            <div className="w-full h-full bg-[#242424] flex items-center justify-center">
              <span className="text-[#555] text-xs">Draft</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <span className="text-white text-xs flex items-center gap-1"><Heart className="w-3 h-3" fill="white" />{formatCount(post.stats.likeCount)}</span>
            <span className="text-white text-xs flex items-center gap-1"><MessageCircle className="w-3 h-3" />{formatCount(post.stats.commentCount)}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
