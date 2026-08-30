import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import type { Reel } from '../../content/types'
import styles from './Reels.module.css'
import { LazyMuxPlayer } from './lazyMuxPlayer'
import { REELS_EXPAND } from './reelsExpandConfig'
import { rectToShellStyle, targetExpandRect, type ExpandRect } from './reelsExpandLayout'
import { useExpandScrollLock } from './useExpandScrollLock'
import { useMuxPlaybackStability } from './useMuxPlaybackStability'
type MuxMediaElement = HTMLMediaElement & {
  muted: boolean
  loop: boolean
  play: () => Promise<void>
}

const ICONS = {
  play: 'M8 5v14l11-7z',
  pause: 'M6 5h4v14H6V5zm8 0h4v14h-4V5z',
  mute: 'M4 9v6h4l5 5V4L8 9H4zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
  muted:
    'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z',
} as const

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

type ReelsExpandOverlayProps = {
  reel: Reel
  title: string
  fromRect: ExpandRect
  initialTime: number
  returnRect: () => ExpandRect | null
  onClose: (currentTime: number) => void
}

export function ReelsExpandOverlay({
  reel,
  title,
  fromRect,
  initialTime,
  returnRect,
  onClose,
}: ReelsExpandOverlayProps) {
  const videoWrapRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<MuxMediaElement | null>(null)
  const playIconRef = useRef<SVGPathElement | null>(null)
  const closingRef = useRef(false)
  const [shellStyle, setShellStyle] = useState<ExpandRect>(fromRect)
  const [visible, setVisible] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [timeLabel, setTimeLabel] = useState('0:00 / 0:00')
  const [muted, setMuted] = useState(false)
  const [paused, setPaused] = useState(false)

  useExpandScrollLock(true)
  useMuxPlaybackStability(videoWrapRef, {
    enabled: true,
    playbackId: reel.muxPlaybackId,
  })

  const getPlayer = useCallback(() => {
    if (playerRef.current) return playerRef.current
    const el = videoWrapRef.current?.querySelector('mux-player')
    playerRef.current = (el as MuxMediaElement | null) ?? null
    return playerRef.current
  }, [])

  const syncPlayIcon = useCallback((isPaused: boolean) => {
    playIconRef.current?.setAttribute('d', isPaused ? ICONS.play : ICONS.pause)
    setPaused(isPaused)
  }, [])

  const syncProgress = useCallback(() => {
    const player = getPlayer()
    if (!player || scrubbing) return
    const duration = player.duration
    const current = player.currentTime
    if (!Number.isFinite(duration) || duration <= 0) return
    setProgress(Math.round((current / duration) * REELS_EXPAND.SCRUB_STEPS))
    setTimeLabel(`${formatTime(current)} / ${formatTime(duration)}`)
  }, [getPlayer, scrubbing])

  useEffect(() => {
    setShellStyle(fromRect)
    setVisible(false)
    const raf = requestAnimationFrame(() => {
      setShellStyle(targetExpandRect(window.innerWidth, window.innerHeight))
      setVisible(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [fromRect])

  useEffect(() => {
    let cancelled = false
    let bootRaf = 0
    let detach: (() => void) | undefined

    const attachPlayer = () => {
      if (cancelled) return
      const player = getPlayer()
      if (!player) {
        bootRaf = requestAnimationFrame(attachPlayer)
        return
      }

      player.currentTime = initialTime
      player.muted = false
      player.loop = false
      setMuted(false)
      syncPlayIcon(player.paused)

      player
        .play()
        .then(() => syncPlayIcon(false))
        .catch(() => syncPlayIcon(true))

      const onTimeUpdate = () => syncProgress()
      const onPlay = () => syncPlayIcon(false)
      const onPause = () => syncPlayIcon(true)
      const onLoaded = () => syncProgress()

      player.addEventListener('timeupdate', onTimeUpdate)
      player.addEventListener('play', onPlay)
      player.addEventListener('pause', onPause)
      player.addEventListener('loadedmetadata', onLoaded)
      player.addEventListener('durationchange', onLoaded)

      detach = () => {
        player.removeEventListener('timeupdate', onTimeUpdate)
        player.removeEventListener('play', onPlay)
        player.removeEventListener('pause', onPause)
        player.removeEventListener('loadedmetadata', onLoaded)
        player.removeEventListener('durationchange', onLoaded)
      }
    }

    attachPlayer()

    return () => {
      cancelled = true
      if (bootRaf) cancelAnimationFrame(bootRaf)
      detach?.()
    }
  }, [getPlayer, initialTime, reel.muxPlaybackId, syncPlayIcon, syncProgress])

  const handleClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    const player = getPlayer()
    const currentTime = player?.currentTime ?? initialTime
    if (player) {
      player.muted = true
      player.pause()
    }

    const back = returnRect()
    if (back) setShellStyle(back)
    setVisible(false)

    window.setTimeout(() => {
      closingRef.current = false
      onClose(currentTime)
    }, REELS_EXPAND.CLOSE_MS)
  }, [getPlayer, initialTime, onClose, returnRect])

  const handlePlayToggle = useCallback(() => {
    const player = getPlayer()
    if (!player) return
    if (player.paused) {
      player.play().then(() => syncPlayIcon(false)).catch(() => syncPlayIcon(true))
    } else {
      player.pause()
      syncPlayIcon(true)
    }
  }, [getPlayer, syncPlayIcon])

  const handleMuteToggle = useCallback(() => {
    const player = getPlayer()
    if (!player) return
    player.muted = !player.muted
    setMuted(player.muted)
  }, [getPlayer])

  const handleScrub = useCallback(
    (value: number) => {
      const player = getPlayer()
      if (!player) return
      const duration = player.duration
      if (!Number.isFinite(duration) || duration <= 0) return
      const ratio = value / REELS_EXPAND.SCRUB_STEPS
      player.currentTime = ratio * duration
      setProgress(value)
      setTimeLabel(`${formatTime(player.currentTime)} / ${formatTime(duration)}`)
    },
    [getPlayer],
  )

  const bindPress = (handler: () => void) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    handler()
  }

  const fillWidth = `${(progress / REELS_EXPAND.SCRUB_STEPS) * 100}%`

  return createPortal(
    <div className={styles.expandLayer} data-testid="reels-expand-layer">
      <div className={styles.expandScrim} aria-hidden onPointerDown={(e) => e.preventDefault()} />
      <div
        className={`${styles.expandShell} ${visible ? styles.expandShellVisible : ''}`}
        aria-hidden={!visible}
        data-testid="reels-expand-shell"
        style={rectToShellStyle(shellStyle)}
      >
        <div className={styles.expandVideoWrap} ref={videoWrapRef}>
          <Suspense fallback={<div className={styles.expandFallback} aria-hidden />}>
            <LazyMuxPlayer
              className={styles.expandMuxPlayer}
              playbackId={reel.muxPlaybackId}
              streamType="on-demand"
              poster={reel.cover}
              title={title}
              muted
              autoPlay
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              preferPlayback="mse"
              nohotkeys
              disablePictureInPicture
              accentColor="#ff4d2e"
              data-testid="reels-expand-mux"
            />          </Suspense>
          <div className={styles.expandOverlay}>
            <button
              type="button"
              className={`${styles.expandIconBtn} ${styles.expandMute}`}
              aria-label={muted ? 'Unmute' : 'Mute'}
              onPointerDown={bindPress(handleMuteToggle)}
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d={muted ? ICONS.muted : ICONS.mute} />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.expandIconBtn} ${styles.expandClose}`}
              aria-label="Close"
              onPointerDown={bindPress(handleClose)}
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.29 19.7 2.88 18.3 9.17 12 2.88 5.71 4.29 4.3 10.59 10.6l6.3-6.3z" />
              </svg>
            </button>
            <div className={styles.transportBar}>
              <button
                type="button"
                className={`${styles.expandIconBtn} ${styles.expandPlay} ${paused ? styles.expandPlayPaused : ''}`}
                aria-label={paused ? 'Play' : 'Pause'}
                onPointerDown={bindPress(handlePlayToggle)}
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path ref={playIconRef} d={ICONS.pause} />
                </svg>
              </button>
              <div className={`${styles.scrubZone} ${scrubbing ? styles.scrubZoneActive : ''}`}>
                <span className={styles.scrubTime}>{timeLabel}</span>
                <div className={styles.scrubTrack}>
                  <div className={styles.scrubFill} style={{ width: fillWidth }} />
                </div>
                <input
                  type="range"
                  className={styles.scrubInput}
                  min={0}
                  max={REELS_EXPAND.SCRUB_STEPS}
                  step={1}
                  value={progress}
                  aria-label="Seek video"
                  onPointerDown={(event) => {
                    event.stopPropagation()
                    setScrubbing(true)
                  }}
                  onPointerUp={() => setScrubbing(false)}
                  onChange={(event) => handleScrub(Number(event.target.value))}
                  onInput={(event) => handleScrub(Number(event.currentTarget.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
