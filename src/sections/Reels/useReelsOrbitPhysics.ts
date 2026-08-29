import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { REELS_ORBIT, resolveHoldMs } from './reelsOrbitConfig'
import {
  angleForFrontIndex,
  computePhoneLayouts,
  easeInOutCubic,
  nearestFrontIndex,
  shortestAngleDelta,
  wrapAngle,
  type OrbitPhoneLayout,
} from './reelsOrbitLayout'

type Phase = 'hold' | 'step' | 'coast'

type UseReelsOrbitPhysicsOptions = {
  count: number
  paused?: boolean
  frozen?: boolean
}

export type ReelsOrbitPhysics = {
  activeIndex: number
  draggingRef: RefObject<boolean>
  onPointerDown: (clientX: number, pointerId: number) => void
  onPointerMove: (clientX: number) => void
  onPointerUp: () => void
  setContainerRef: (node: HTMLDivElement | null) => void
  registerPhone: (index: number, node: HTMLDivElement | null) => void
  getPhoneEl: (index: number) => HTMLDivElement | null
}

function layoutsEqual(a: OrbitPhoneLayout[], b: OrbitPhoneLayout[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i]
    const right = b[i]
    if (
      left.isCenter !== right.isCenter ||
      left.opacity !== right.opacity ||
      left.blurPx !== right.blurPx ||
      left.zIndex !== right.zIndex ||
      left.transform !== right.transform
    ) {
      return false
    }
  }
  return true
}

function applyPhoneLayout(
  el: HTMLDivElement,
  layout: OrbitPhoneLayout,
  dragging: boolean,
) {
  el.style.opacity = String(layout.opacity)
  el.style.zIndex = String(layout.zIndex)
  el.style.transform = layout.transform
  const blurPx = dragging ? 0 : layout.blurPx
  el.style.filter = blurPx > 0 ? `blur(${blurPx}px)` : 'none'
}

function applyAllPhoneLayouts(
  phones: Map<number, HTMLDivElement>,
  layouts: OrbitPhoneLayout[],
  dragging: boolean,
) {
  layouts.forEach((layout, index) => {
    const el = phones.get(index)
    if (el) applyPhoneLayout(el, layout, dragging)
  })
}

export function useReelsOrbitPhysics({
  count,
  paused = false,
  frozen = false,
}: UseReelsOrbitPhysicsOptions): ReelsOrbitPhysics {
  const slot = 360 / count
  const angleRef = useRef(0)
  const velRef = useRef(0)
  const draggingRef = useRef(false)
  const frozenRef = useRef(frozen)
  const pausedRef = useRef(paused)
  const lastXRef = useRef(0)
  const lastTRef = useRef(0)
  const pendingXRef = useRef<number | null>(null)
  const moveRafRef = useRef<number | null>(null)
  const phaseRef = useRef<Phase>('hold')
  const phaseT0Ref = useRef(0)
  const stepFromRef = useRef(0)
  const lastEngageAtRef = useRef(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const capturedPointerRef = useRef<number | null>(null)
  const phonesRef = useRef<Map<number, HTMLDivElement>>(new Map())
  const layoutsRef = useRef<OrbitPhoneLayout[]>(computePhoneLayouts(0, count))
  const activeRef = useRef(0)
  const holdTimerRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const [activeIndex, setActiveIndex] = useState(0)

  pausedRef.current = paused
  frozenRef.current = frozen

  const markEngaged = useCallback(() => {
    lastEngageAtRef.current = performance.now()
  }, [])

  const publishLayout = useCallback(
    (angle: number, force = false) => {
      const nextActive = nearestFrontIndex(angle, count)
      const nextLayouts = computePhoneLayouts(angle, count)
      const layoutsChanged = force || !layoutsEqual(nextLayouts, layoutsRef.current)
      const activeChanged = nextActive !== activeRef.current

      if (!activeChanged && !layoutsChanged) return

      activeRef.current = nextActive
      layoutsRef.current = nextLayouts
      applyAllPhoneLayouts(phonesRef.current, nextLayouts, draggingRef.current)

      if (activeChanged) setActiveIndex(nextActive)
    },
    [count],
  )

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }, [])

  const stopMotionLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const stopMoveLoop = useCallback(() => {
    if (moveRafRef.current !== null) {
      cancelAnimationFrame(moveRafRef.current)
      moveRafRef.current = null
    }
  }, [])

  const scheduleHoldRef = useRef<() => void>(() => {})
  const startMotionLoopRef = useRef<() => void>(() => {})

  scheduleHoldRef.current = () => {
    clearHoldTimer()
    if (pausedRef.current) return
    phaseRef.current = 'hold'
    phaseT0Ref.current = performance.now()
    const holdMs = resolveHoldMs(lastEngageAtRef.current)
    holdTimerRef.current = window.setTimeout(() => {
      if (draggingRef.current || pausedRef.current) return
      phaseRef.current = 'step'
      phaseT0Ref.current = performance.now()
      stepFromRef.current = angleRef.current
      startMotionLoopRef.current()
    }, holdMs)
  }

  startMotionLoopRef.current = () => {
    stopMotionLoop()

    const tick = (now: number) => {
      if (draggingRef.current || pausedRef.current) {
        stopMotionLoop()
        return
      }

      if (phaseRef.current === 'step') {
        const t = Math.min(1, (now - phaseT0Ref.current) / REELS_ORBIT.STEP_MS)
        const eased = easeInOutCubic(t)
        const intended = (nearestFrontIndex(stepFromRef.current, count) + 1) % count
        angleRef.current = wrapAngle(stepFromRef.current - slot * eased)
        publishLayout(angleRef.current)
        if (t >= 1) {
          angleRef.current = angleForFrontIndex(intended, count)
          velRef.current = 0
          publishLayout(angleRef.current, true)
          scheduleHoldRef.current()
          stopMotionLoop()
          return
        }
      } else if (phaseRef.current === 'coast') {
        angleRef.current = wrapAngle(angleRef.current + velRef.current)
        velRef.current *= REELS_ORBIT.DAMP
        publishLayout(angleRef.current)

        if (Math.abs(velRef.current) < REELS_ORBIT.VEL_STOP) {
          const index = nearestFrontIndex(angleRef.current, count)
          const target = angleForFrontIndex(index, count)
          const diff = shortestAngleDelta(angleRef.current, target)
          angleRef.current = wrapAngle(angleRef.current + diff * REELS_ORBIT.SNAP_LERP)
          publishLayout(angleRef.current)
          if (Math.abs(diff) < 0.5) {
            angleRef.current = target
            velRef.current = 0
            publishLayout(angleRef.current, true)
            scheduleHoldRef.current()
            stopMotionLoop()
            return
          }
        }
      } else {
        stopMotionLoop()
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  const startMotionLoop = useCallback(() => {
    startMotionLoopRef.current()
  }, [])

  const applyPointerMove = useCallback(
    (clientX: number) => {
      if (!draggingRef.current) return
      const now = performance.now()
      const dx = clientX - lastXRef.current
      const dt = Math.max(8, now - lastTRef.current)
      const dAngle = dx * REELS_ORBIT.DRAG_SENS
      angleRef.current = wrapAngle(angleRef.current + dAngle)
      velRef.current = (dAngle / dt) * 16
      lastXRef.current = clientX
      lastTRef.current = now
      publishLayout(angleRef.current)
    },
    [publishLayout],
  )

  useEffect(() => {
    angleRef.current = angleForFrontIndex(0, count)
    publishLayout(angleRef.current, true)
    scheduleHoldRef.current()
    return () => {
      clearHoldTimer()
      stopMotionLoop()
      stopMoveLoop()
    }
  }, [clearHoldTimer, count, publishLayout, stopMotionLoop, stopMoveLoop])

  useEffect(() => {
    if (paused) {
      clearHoldTimer()
      stopMotionLoop()
    } else if (phaseRef.current === 'hold' && !draggingRef.current) {
      scheduleHoldRef.current()
    }
  }, [clearHoldTimer, paused, stopMotionLoop])

  const setDraggingVisual = useCallback((dragging: boolean) => {
    draggingRef.current = dragging
    const container = containerRef.current
    if (container) container.toggleAttribute('data-dragging', dragging)
    applyAllPhoneLayouts(phonesRef.current, layoutsRef.current, dragging)
  }, [])

  const onPointerDown = useCallback(
    (clientX: number, pointerId: number) => {
      if (frozenRef.current) return
      const container = containerRef.current
      if (container) {
        container.setPointerCapture(pointerId)
        capturedPointerRef.current = pointerId
      }
      markEngaged()
      clearHoldTimer()
      stopMotionLoop()
      setDraggingVisual(true)
      lastXRef.current = clientX
      lastTRef.current = performance.now()
      pendingXRef.current = null
      velRef.current = 0
      phaseRef.current = 'coast'
    },
    [clearHoldTimer, markEngaged, setDraggingVisual, stopMotionLoop],
  )

  const onPointerMove = useCallback(
    (clientX: number) => {
      if (!draggingRef.current || frozenRef.current) return
      pendingXRef.current = clientX
      if (moveRafRef.current !== null) return
      moveRafRef.current = requestAnimationFrame(() => {
        moveRafRef.current = null
        if (pendingXRef.current === null) return
        applyPointerMove(pendingXRef.current)
        pendingXRef.current = null
      })
    },
    [applyPointerMove],
  )

  const onPointerUp = useCallback(() => {
    if (!draggingRef.current) return
    markEngaged()
    setDraggingVisual(false)
    if (pendingXRef.current !== null) {
      applyPointerMove(pendingXRef.current)
      pendingXRef.current = null
    }
    velRef.current = Math.max(
      -REELS_ORBIT.VEL_CLAMP,
      Math.min(REELS_ORBIT.VEL_CLAMP, velRef.current),
    )
    phaseRef.current = 'coast'
    phaseT0Ref.current = performance.now()

    const container = containerRef.current
    const pointerId = capturedPointerRef.current
    if (container && pointerId !== null && container.hasPointerCapture(pointerId)) {
      container.releasePointerCapture(pointerId)
    }
    capturedPointerRef.current = null
    startMotionLoop()
  }, [applyPointerMove, markEngaged, setDraggingVisual, startMotionLoop])

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node
  }, [])

  const registerPhone = useCallback((index: number, node: HTMLDivElement | null) => {
    if (node) {
      phonesRef.current.set(index, node)
      const layout = layoutsRef.current[index]
      if (layout) applyPhoneLayout(node, layout, draggingRef.current)
      return
    }
    phonesRef.current.delete(index)
  }, [])

  const getPhoneEl = useCallback((index: number) => phonesRef.current.get(index) ?? null, [])

  return {
    activeIndex,
    draggingRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    setContainerRef,
    registerPhone,
    getPhoneEl,
  }
}
