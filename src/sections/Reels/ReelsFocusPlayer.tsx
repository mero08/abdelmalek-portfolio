import { Suspense, useEffect, useRef, useState } from 'react'
import styles from './Reels.module.css'
import { LazyMuxPlayer } from './lazyMuxPlayer'
import { useMuxPlaybackStability } from './useMuxPlaybackStability'

type ReelsFocusPlayerProps = {
  playbackId: string
  title: string
  poster: string
  /** When true, Mux should be actively playing. */
  playing: boolean
  onPlaybackActiveChange?: (active: boolean) => void
}

/**
 * Keeps the Mux element mounted after first play so orbit remounts
 * do not cold-start long VODs (site-only lag vs Mux standalone).
 */
export function ReelsFocusPlayer({
  playbackId,
  title,
  poster,
  playing,
  onPlaybackActiveChange,
}: ReelsFocusPlayerProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [armed, setArmed] = useState(playing)

  useEffect(() => {
    if (playing) setArmed(true)
  }, [playing])

  useMuxPlaybackStability(wrapRef, {
    enabled: playing,
    playbackId,
  })

  useEffect(() => {
    if (!armed) {
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

      const sync = () => onPlaybackActiveChange?.(!mux.paused && playing)
      const onPlaying = () => sync()
      const onPause = () => sync()
      mux.addEventListener('playing', onPlaying)
      mux.addEventListener('pause', onPause)

      if (playing) {
        mux.muted = true
        void mux.play().catch(() => {})
      } else {
        mux.pause()
      }
      sync()

      detach = () => {
        mux.removeEventListener('playing', onPlaying)
        mux.removeEventListener('pause', onPause)
      }
    }

    attach()

    return () => {
      cancelled = true
      if (bootRaf) cancelAnimationFrame(bootRaf)
      detach?.()
      onPlaybackActiveChange?.(false)
    }
  }, [armed, onPlaybackActiveChange, playbackId, playing])

  return (
    <div ref={wrapRef} className={styles.focusPlayerWrap} data-playing={playing ? 'true' : 'false'}>
      {!playing ? (
        <img className={styles.focusPoster} src={poster} alt="" draggable={false} decoding="async" />
      ) : null}

      {armed ? (
        <Suspense
          fallback={
            playing ? (
              <img className={styles.focusPoster} src={poster} alt="" draggable={false} decoding="async" />
            ) : null
          }
        >
          <LazyMuxPlayer
            className={`${styles.muxPlayer} ${playing ? '' : styles.muxPlayerParked}`}
            playbackId={playbackId}
            streamType="on-demand"
            poster={poster}
            title={title}
            muted
            autoPlay={playing}
            loop
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            maxResolution="720p"
            nohotkeys
            disablePictureInPicture
            data-testid="reels-focus-mux"
          />
        </Suspense>
      ) : (
        <img className={styles.focusPoster} src={poster} alt="" draggable={false} decoding="async" />
      )}
    </div>
  )
}
