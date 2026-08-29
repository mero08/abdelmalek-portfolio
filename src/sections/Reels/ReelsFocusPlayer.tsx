import { lazy, Suspense, useEffect, useRef } from 'react'
import styles from './Reels.module.css'

const LazyMuxPlayer = lazy(async () => {
  const mod = await import('@mux/mux-player-react')
  return { default: mod.default }
})

type ReelsFocusPlayerProps = {
  playbackId: string
  title: string
  poster: string
  playing: boolean
  onPlaybackActiveChange?: (active: boolean) => void
}

export function ReelsFocusPlayer({
  playbackId,
  title,
  poster,
  playing,
  onPlaybackActiveChange,
}: ReelsFocusPlayerProps) {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!playing) {
      onPlaybackActiveChange?.(false)
      return undefined
    }

    let cancelled = false
    let bootRaf = 0
    let detach: (() => void) | undefined

    const attach = () => {
      if (cancelled) return
      const mux = wrapRef.current?.querySelector('mux-player') as HTMLMediaElement | null
      if (!mux) {
        bootRaf = requestAnimationFrame(attach)
        return
      }

      const sync = () => onPlaybackActiveChange?.(!mux.paused)
      mux.addEventListener('playing', sync)
      mux.addEventListener('pause', sync)
      sync()

      detach = () => {
        mux.removeEventListener('playing', sync)
        mux.removeEventListener('pause', sync)
      }
    }

    attach()

    return () => {
      cancelled = true
      if (bootRaf) cancelAnimationFrame(bootRaf)
      detach?.()
      onPlaybackActiveChange?.(false)
    }
  }, [onPlaybackActiveChange, playbackId, playing])

  if (!playing) {
    return (
      <div ref={wrapRef} className={styles.focusPlayerWrap}>
        <img className={styles.focusPoster} src={poster} alt="" draggable={false} decoding="async" />
      </div>
    )
  }

  return (
    <div ref={wrapRef} className={styles.focusPlayerWrap}>
      <Suspense
        fallback={
          <img className={styles.focusPoster} src={poster} alt="" draggable={false} decoding="async" />
        }
      >
        <LazyMuxPlayer
          className={styles.muxPlayer}
          playbackId={playbackId}
          streamType="on-demand"
          poster={poster}
          title={title}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          nohotkeys
          disablePictureInPicture
          data-testid="reels-focus-mux"
        />
      </Suspense>
    </div>
  )
}
