import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { Reel } from '../../content/types'
import { useLocale } from '../../i18n/useLocale'
import { prefersReducedMotion } from '../../lib/reducedMotion'
import { ReelsExpandOverlay } from './ReelsExpandOverlay'
import { ReelsOrbitFallback } from './ReelsOrbitFallback'
import { ReelsOrbitPhone } from './ReelsOrbitPhone'
import styles from './Reels.module.css'
import { REELS_EXPAND } from './reelsExpandConfig'
import type { ExpandRect } from './reelsExpandLayout'
import { REELS_ORBIT } from './reelsOrbitConfig'
import { useReelsOrbitPhysics } from './useReelsOrbitPhysics'

type ReelsOrbitDialProps = {
  reels: Reel[]
}

type ExpandSession = {
  reel: Reel
  fromRect: ExpandRect
  initialTime: number
}

function rectFromDom(node: HTMLElement): ExpandRect {
  const rect = node.getBoundingClientRect()
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  }
}

function readMuxTime(node: HTMLElement | null): number {
  const media = node?.querySelector('mux-player') as HTMLMediaElement | null
  return media?.currentTime ?? 0
}

function resumeFocusPlayback(node: HTMLElement | null, time: number) {
  const media = node?.querySelector('mux-player') as HTMLMediaElement | null
  if (!media) return
  media.currentTime = time
  media.muted = true
  media.play().catch(() => {})
}

export function ReelsOrbitDial({ reels }: ReelsOrbitDialProps) {
  const { t } = useLocale()
  const stageRef = useRef<HTMLDivElement | null>(null)
  const focusPhoneRef = useRef<HTMLDivElement | null>(null)
  const tapStartRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const [visible, setVisible] = useState(false)
  const [expandSession, setExpandSession] = useState<ExpandSession | null>(null)
  const reducedMotion = prefersReducedMotion()

  const expanded = expandSession !== null

  const physics = useReelsOrbitPhysics({
    count: reels.length,
    paused: !visible || expanded,
    frozen: expanded,
  })

  useEffect(() => {
    focusPhoneRef.current = physics.getPhoneEl(physics.activeIndex)
  }, [physics.activeIndex, physics.getPhoneEl])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '80px 0px', threshold: 0.12 },
    )
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const bindStageRef = (node: HTMLDivElement | null) => {
    stageRef.current = node
    physics.setContainerRef(node)
  }

  const openExpand = useCallback(() => {
    const node = focusPhoneRef.current
    if (!node || expandSession) return
    const reel = reels[physics.activeIndex]
    if (!reel) return

    setExpandSession({
      reel,
      fromRect: rectFromDom(node),
      initialTime: readMuxTime(node),
    })
  }, [expandSession, physics.activeIndex, reels])

  const handleExpandClose = useCallback(
    (currentTime: number) => {
      resumeFocusPlayback(focusPhoneRef.current, currentTime)
      setExpandSession(null)
    },
    [],
  )

  const tryOpenFromTap = useCallback(
    (clientX: number, clientY: number) => {
      const start = tapStartRef.current
      if (!start || expanded) return
      const dx = clientX - start.x
      const dy = clientY - start.y
      const dt = performance.now() - start.t
      tapStartRef.current = null
      if (Math.hypot(dx, dy) < REELS_EXPAND.TAP_MOVE_PX && dt < REELS_EXPAND.TAP_MAX_MS) {
        openExpand()
      }
    },
    [expanded, openExpand],
  )

  const handleCenterPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (expanded) return
    event.stopPropagation()
    tapStartRef.current = { x: event.clientX, y: event.clientY, t: performance.now() }
  }, [expanded])

  const handleCenterActivate = useCallback(
    (event: ReactPointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
      if (expanded || physics.draggingRef.current) return
      tryOpenFromTap(event.clientX, event.clientY)
    },
    [expanded, physics.draggingRef, tryOpenFromTap],
  )

  const handleCenterPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (expanded) return
      event.stopPropagation()
      tryOpenFromTap(event.clientX, event.clientY)
    },
    [expanded, tryOpenFromTap],
  )

  if (reducedMotion) {
    return <ReelsOrbitFallback reels={reels} />
  }

  const activeReel = reels[physics.activeIndex]
  const streamActive = visible && !expanded

  return (
    <div className={styles.stageWrap}>
      {expandSession ? (
        <ReelsExpandOverlay
          reel={expandSession.reel}
          title={t(expandSession.reel.title)}
          fromRect={expandSession.fromRect}
          initialTime={expandSession.initialTime}
          returnRect={() => (focusPhoneRef.current ? rectFromDom(focusPhoneRef.current) : null)}
          onClose={handleExpandClose}
        />
      ) : null}

      <div className={styles.stageGlow} aria-hidden />
      <div
        ref={bindStageRef}
        className={`${styles.stage} ${expanded ? styles.stageExpanded : ''}`}
        onPointerDown={(event) => {
          if (event.button !== 0 || expanded) return
          physics.onPointerDown(event.clientX, event.pointerId)
        }}
        onPointerMove={(event) => physics.onPointerMove(event.clientX)}
        onPointerUp={physics.onPointerUp}
        onPointerCancel={physics.onPointerUp}
        role="region"
        aria-roledescription="carousel"
        aria-label={t({ en: 'Reels dial', ar: 'قرص الريلز' })}
      >
        <div className={styles.dialLayer}>
          <div
            className={styles.world}
            style={{
              perspective: `${REELS_ORBIT.PERSPECTIVE}px`,
              perspectiveOrigin: '50% 12%',
            }}
          >
            <div
              className={styles.worldInner}
              style={{
                transform: `translate(-50%, -50%) rotateX(${REELS_ORBIT.WORLD_ROTATE_X_DEG}deg)`,
              }}
            >
              <div className={styles.ringGuide} aria-hidden />
              {reels.map((reel, index) => {
                const isCenter = index === physics.activeIndex

                return (
                  <ReelsOrbitPhone
                    key={reel.id}
                    reelId={reel.id}
                    cover={reel.cover}
                    title={t(reel.title)}
                    isCenter={isCenter}
                    orbitIndex={index}
                    registerPhone={physics.registerPhone}
                    muxPlaybackId={reel.muxPlaybackId}
                    playing={isCenter && streamActive}
                    hiddenForExpand={isCenter && expanded}
                    onCenterActivate={isCenter ? handleCenterActivate : undefined}
                    onCenterPointerDown={isCenter ? handleCenterPointerDown : undefined}
                    onCenterPointerUp={isCenter ? handleCenterPointerUp : undefined}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <p className={styles.meta} aria-live="polite">
        <span className={styles.metaIndex}>
          {String(physics.activeIndex + 1).padStart(2, '0')} / {String(reels.length).padStart(2, '0')}
        </span>
        <span className={styles.metaTitle}>{t(activeReel.title)}</span>
      </p>
    </div>
  )
}
