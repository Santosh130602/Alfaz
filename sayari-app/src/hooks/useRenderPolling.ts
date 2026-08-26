import { useEffect, useRef, useState } from 'react'
import { postsApi } from '../api'

interface RenderState {
  rendered : boolean
  imageUrl : string | null
  thumbnail: string | null
  status   : string
  error    : string | null
  polling  : boolean
}

/**
 * Polls /posts/:id/render until the Puppeteer-rendered image is ready,
 * or until the post is confirmed published with an image, or timeout.
 *
 * Usage:
 *   const { rendered, imageUrl, polling } = useRenderPolling(postId, !post.renderedImage?.url)
 */
export function useRenderPolling(postId: string | undefined, shouldPoll: boolean, intervalMs = 2500, timeoutMs = 60000) {
  const [state, setState] = useState<RenderState>({
    rendered: false, imageUrl: null, thumbnail: null, status: 'pending', error: null, polling: false,
  })

  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!postId || !shouldPoll) return

    let cancelled = false
    setState(s => ({ ...s, polling: true }))

    const check = async () => {
      try {
        const res = await postsApi.getRenderStatus(postId)
        const data = res.data.data
        if (cancelled) return

        setState({
          rendered : data.rendered,
          imageUrl : data.imageUrl,
          thumbnail: data.thumbnail,
          status   : data.status,
          error    : null,
          polling  : !data.rendered,
        })

        if (data.rendered) {
          if (timerRef.current) clearInterval(timerRef.current)
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
      } catch {
        // Network blip — keep polling, don't surface error yet
      }
    }

    check() // immediate first check
    timerRef.current = setInterval(check, intervalMs)
    timeoutRef.current = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current)
      setState(s => ({ ...s, polling: false, error: s.rendered ? null : 'Render is taking longer than expected' }))
    }, timeoutMs)

    return () => {
      cancelled = true
      if (timerRef.current) clearInterval(timerRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [postId, shouldPoll, intervalMs, timeoutMs])

  return state
}
