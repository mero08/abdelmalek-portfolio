import { useEffect, type RefObject } from 'react'

type Options = {
  enabled?: boolean
  playbackId: string
  /** Max automatic recoveries per playback id mount. */
  maxRecoveries?: number
}

/**
 * Soft-recover Mux playback on stall / error without changing UI.
 * Never reloads during the first buffer — long 1080p VODs wait more than 2s to start.
 */
export function useMuxPlaybackStability(
  wrapRef: RefObject<HTMLElement | null>,
  { enabled = true, playbackId, maxRecoveries = 2 }: Options,
) {
  useEffect(() => {
    if (!enabled || !playbackId) return undefined

    let cancelled = false
    let bootRaf = 0
    let recoveries = 0
    let stallTimer = 0
    let hasPlayed = false
    let media: HTMLMediaElement | null = null

    const clearStallTimer = () => {
      if (stallTimer) {
        window.clearTimeout(stallTimer)
        stallTimer = 0
      }
    }

    const recover = () => {
      if (!media || cancelled || recoveries >= maxRecoveries) return
      recoveries += 1
      const resumeAt = Number.isFinite(media.currentTime) ? media.currentTime : 0
      const wasMuted = media.muted
      try {
        media.load()
        media.currentTime = resumeAt
        media.muted = wasMuted
        void media.play().catch(() => {})
      } catch {
        // Ignore — next user gesture can still play
      }
    }

    const onWaiting = () => {
      clearStallTimer()
      // First buffer of a long HLS VOD is not a stall — don't reload.
      if (!hasPlayed) return
      stallTimer = window.setTimeout(() => {
        if (cancelled || !media) return
        if (media.readyState >= 3) return
        recover()
      }, 8000)
    }

    const onPlaying = () => {
      hasPlayed = true
      clearStallTimer()
    }
    const onError = () => {
      clearStallTimer()
      if (!hasPlayed) return
      recover()
    }

    const attach = () => {
      if (cancelled) return
      media = wrapRef.current?.querySelector('mux-player') as HTMLMediaElement | null
      if (!media) {
        bootRaf = requestAnimationFrame(attach)
        return
      }
      media.addEventListener('waiting', onWaiting)
      media.addEventListener('stalled', onWaiting)
      media.addEventListener('playing', onPlaying)
      media.addEventListener('error', onError)
    }

    attach()

    return () => {
      cancelled = true
      clearStallTimer()
      if (bootRaf) cancelAnimationFrame(bootRaf)
      media?.removeEventListener('waiting', onWaiting)
      media?.removeEventListener('stalled', onWaiting)
      media?.removeEventListener('playing', onPlaying)
      media?.removeEventListener('error', onError)
    }
  }, [enabled, maxRecoveries, playbackId, wrapRef])
}
