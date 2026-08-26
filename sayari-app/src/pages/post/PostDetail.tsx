import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Trash2, Heart, Loader2 } from 'lucide-react'
import { postsApi, engagementApi } from '../../api'
import { useAuthStore } from '../../store/auth.store'
import { useRenderPolling } from '../../hooks/useRenderPolling'
import { Avatar, Button, Input, PageSpinner, Spinner } from '../../components/ui'
import { PostCard } from '../../components/post/PostCard'
import { cn, timeAgo, formatCount, getErrorMessage } from '../../utils'
import { REACTIONS } from '../../types'
import type { Comment, ReactionType } from '../../types'
import toast from 'react-hot-toast'

export function PostDetailPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  // Record view
  useEffect(() => {
    if (id) engagementApi.recordView(id, 'post', 'direct').catch(() => {})
  }, [id])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['post', id],
    queryFn : () => postsApi.get(id!).then(r => r.data.data.post),
    enabled : !!id,
  })

  // Poll render status if image isn't ready yet (e.g. just published, audio post excluded)
  const needsRender = !!data && data.type !== 'audio' && !data.renderedImage?.url && !!data.canvasState?.fabricJson
  const renderState  = useRenderPolling(id, needsRender)

  // Refetch full post once render completes
  useEffect(() => {
    if (renderState.rendered && needsRender) refetch()
  }, [renderState.rendered, needsRender, refetch])

  if (isLoading) return <PageSpinner />
  if (error || !data) return (
    <div className="text-center py-20">
      <p className="text-[#888]">Post not found</p>
      <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
    </div>
  )

  return (
    <div>
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#888] hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Rendering banner */}
      {needsRender && renderState.polling && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-[#6C63FF]/10 border border-[#6C63FF]/30 rounded-2xl">
          <Loader2 className="w-4 h-4 text-[#6C63FF] animate-spin shrink-0" />
          <p className="text-sm text-[#6C63FF]">Designing your post image... this takes a few seconds</p>
        </div>
      )}
      {needsRender && renderState.error && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
          <p className="text-sm text-yellow-400">{renderState.error}. Refresh to check again.</p>
        </div>
      )}

      {/* Post card */}
      <PostCard post={data} showChannel compact={false} />

      {/* Series info */}
      {data.series && (
        <Link
          to={`/series/${typeof data.series === 'object' ? data.series._id : data.series}`}
          className="flex items-center gap-3 mt-4 p-4 bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl hover:border-[#6C63FF] transition-colors"
        >
          <div className="w-10 h-10 bg-[#6C63FF]/20 rounded-xl flex items-center justify-center">
            <span className="text-lg">📖</span>
          </div>
          <div>
            <p className="text-xs text-[#888]">Part of series</p>
            <p className="text-sm font-semibold text-white">
              {typeof data.series === 'object' ? data.series.title : 'View Series'}
            </p>
            {data.chapterNumber && <p className="text-xs text-[#6C63FF]">Chapter {data.chapterNumber}</p>}
          </div>
        </Link>
      )}

      {/* Comments section */}
      <div className="mt-6">
        <h2 className="text-base font-semibold text-white mb-4">
          Comments ({formatCount(data.stats.commentCount)})
        </h2>
        <CommentsSection postId={data._id} currentUserId={user?._id} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  )
}

// ── Comments Section ──────────────────────────

function CommentsSection({ postId, currentUserId, isAuthenticated }: {
  postId: string; currentUserId?: string; isAuthenticated: boolean
}) {
  const [text, setText]         = useState('')
  const [replyTo, setReplyTo]   = useState<Comment | null>(null)
  const navigate                = useNavigate()
  const queryClient             = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn : () => engagementApi.getComments(postId, { limit: 30 }).then(r => r.data.data),
  })

  const addMutation = useMutation({
    mutationFn: () => engagementApi.addComment(postId, text, replyTo?._id).then(r => r.data.data.comment),
    onSuccess  : () => {
      setText('')
      setReplyTo(null)
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
    onError: err => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => engagementApi.deleteComment(commentId),
    onSuccess  : () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
    onError    : err => toast.error(getErrorMessage(err)),
  })

  const handleSubmit = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (!text.trim()) return
    addMutation.mutate()
  }

  const topLevel = data?.comments.filter(c => !c.parentComment) ?? []

  return (
    <div className="flex flex-col gap-4">
      {/* Comment input */}
      {isAuthenticated && (
        <div className="flex flex-col gap-2">
          {replyTo && (
            <div className="flex items-center gap-2 text-xs text-[#888] bg-[#1A1A1A] rounded-lg px-3 py-2">
              Replying to <span className="text-white">@{replyTo.author.username}</span>
              <button onClick={() => setReplyTo(null)} className="ml-auto hover:text-white">✕</button>
            </div>
          )}
          <div className="flex gap-3">
            <Input
              placeholder={replyTo ? `Reply to @${replyTo.author.username}...` : 'Add a comment...'}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              className="flex-1"
            />
            <Button
              onClick={handleSubmit}
              loading={addMutation.isPending}
              icon={<Send className="w-4 h-4" />}
              disabled={!text.trim()}
            />
          </div>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : topLevel.length === 0 ? (
        <p className="text-center text-[#888] text-sm py-8">No comments yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-1">
          {topLevel.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              replies={data?.comments.filter(c => c.parentComment === comment._id) ?? []}
              currentUserId={currentUserId}
              onReply={setReplyTo}
              onDelete={(id) => deleteMutation.mutate(id)}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Comment Item ──────────────────────────────

function CommentItem({ comment, replies, currentUserId, onReply, onDelete, isAuthenticated }: {
  comment: Comment
  replies: Comment[]
  currentUserId?: string
  onReply: (c: Comment) => void
  onDelete: (id: string) => void
  isAuthenticated: boolean
}) {
  const [liked, setLiked]     = useState(false)
  const [likes, setLikes]     = useState(comment.likeCount)
  const [showReplies, setShowReplies] = useState(false)
  const navigate = useNavigate()

  const handleLike = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    const newLiked = !liked
    setLiked(newLiked)
    setLikes(l => l + (newLiked ? 1 : -1))
    try {
      await engagementApi.toggleLike(comment._id, 'comment', 'like')
    } catch { setLiked(!newLiked); setLikes(l => l + (!newLiked ? 1 : -1)) }
  }

  return (
    <div className="py-3 border-b border-[#1E1E1E] last:border-0">
      <div className="flex gap-3">
        <Link to={`/@${comment.author.username}`} className="shrink-0">
          <Avatar user={comment.author} size="sm" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/@${comment.author.username}`} className="text-sm font-semibold text-white hover:text-[#6C63FF] transition-colors">
              {comment.author.displayName}
            </Link>
            {comment.author.isVerified && <span className="text-xs">✅</span>}
            <span className="text-xs text-[#555]">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-[#ccc] mt-1 leading-relaxed">{comment.content}</p>

          <div className="flex items-center gap-4 mt-2">
            <button onClick={handleLike} className={cn('flex items-center gap-1 text-xs transition-colors', liked ? 'text-[#FF6584]' : 'text-[#888] hover:text-white')}>
              <Heart className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} />
              {likes > 0 && <span>{likes}</span>}
            </button>
            {isAuthenticated && (
              <button onClick={() => onReply(comment)} className="text-xs text-[#888] hover:text-white transition-colors">
                Reply
              </button>
            )}
            {replies.length > 0 && (
              <button onClick={() => setShowReplies(!showReplies)} className="text-xs text-[#6C63FF] hover:underline">
                {showReplies ? 'Hide' : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
            {comment.author._id === currentUserId && (
              <button onClick={() => onDelete(comment._id)} className="ml-auto text-xs text-[#888] hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3 flex flex-col gap-3 pl-3 border-l border-[#2E2E2E]">
              {replies.map(reply => (
                <div key={reply._id} className="flex gap-2">
                  <Link to={`/@${reply.author.username}`}>
                    <Avatar user={reply.author} size="xs" />
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/@${reply.author.username}`} className="text-xs font-semibold text-white hover:text-[#6C63FF]">
                        {reply.author.displayName}
                      </Link>
                      <span className="text-[10px] text-[#555]">{timeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="text-xs text-[#ccc] mt-0.5">{reply.content}</p>
                  </div>
                  {reply.author._id === currentUserId && (
                    <button onClick={() => onDelete(reply._id)} className="text-[#888] hover:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
