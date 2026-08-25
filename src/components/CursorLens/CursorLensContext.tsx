import gsap from 'gsap'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react'
import { prefersReducedMotion } from '../../lib/reducedMotion'
import {
  CURSOR_EXPAND_ATTR,
  EXPAND_SIZE,
  IDLE_SIZE,
} from './cursorConfig'

type CursorEngineApi = {
  enabled: boolean
  trackRef: RefObject<HTMLDivElement | null>
  discRef: RefObject<HTMLDivElement | null>
  rootRef: RefObject<HTMLElement | null>
}

const CursorEngineContext = createContext<CursorEngineApi | null>(null)

const EXPAND_SEL = `[${CURSOR_EXPAND_ATTR}]`
const ENTER_PAD = 12
const LEAVE_PAD = 28

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia !== 'function') return false
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  )
}

type Box = { left: number; top: number; right: number; bottom: number }

function inflate(rect: DOMRect, pad: number): Box {
  return {
    left: rect.left - pad,
    top: rect.top - pad,
    right: rect.right + pad,
    bottom: rect.bottom + pad,
  }
}

function contains(x: number, y: number, box: Box): boolean {
  return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom
}

function hitTestExpandZone(
  x: number,
  y: number,
  sticky: HTMLElement | null,
): HTMLElement | null {
  if (sticky?.isConnected) {
    const leaveBox = inflate(sticky.getBoundingClientRect(), LEAVE_PAD)
    if (contains(x, y, leaveBox)) return sticky
  }

  const roots = document.querySelectorAll<HTMLElement>(EXPAND_SEL)
  for (const root of roots) {
    const enterBox = inflate(root.getBoundingClientRect(), ENTER_PAD)
    if (contains(x, y, enterBox)) return root
  }

  return null
}

function clearExpandRoot(root: HTMLElement) {
  root.style.setProperty('--lens-size', '0px')
}

export function CursorLensProvider({ children }: { children: ReactNode }) {
  const enabled = useMemo(() => !prefersReducedMotion() && !isTouchDevice(), [])
  const trackRef = useRef<HTMLDivElement | null>(null)
  const discRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)
  const posRef = useRef({ x: -9999, y: -9999 })
  const sizeProxy = useRef({ size: IDLE_SIZE })
  const expandedRef = useRef(false)
  const activeRootRef = useRef<HTMLElement | null>(null)
  const targetSizeRef = useRef(IDLE_SIZE)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    document.documentElement.classList.toggle('has-circle-cursor', enabled)
    rootRef.current = enabled ? document.documentElement : null
    return () => {
      document.documentElement.classList.remove('has-circle-cursor')
      rootRef.current = null
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const applyMasks = () => {
      const { x, y } = posRef.current
      const size = sizeProxy.current.size
      const activeRoot = activeRootRef.current
      const html = document.documentElement

      html.style.setProperty('--cx', `${x}px`)
      html.style.setProperty('--cy', `${y}px`)

      const roots = document.querySelectorAll<HTMLElement>(EXPAND_SEL)
      for (const root of roots) {
        const rect = root.getBoundingClientRect()
        root.style.setProperty('--mx', `${x - rect.left}px`)
        root.style.setProperty('--my', `${y - rect.top}px`)
        root.style.setProperty(
          '--lens-size',
          root === activeRoot ? `${size}px` : '0px',
        )
      }

      const disc = discRef.current
      if (disc) {
        const expanded = size > IDLE_SIZE * 2
        expandedRef.current = expanded
        disc.dataset.expanded = expanded ? 'true' : 'false'
      }
    }

    const flush = () => {
      rafRef.current = 0
      const { x, y } = posRef.current

      const track = trackRef.current
      if (track) {
        track.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      }

      const activeRoot = hitTestExpandZone(x, y, activeRootRef.current)
      if (activeRootRef.current && activeRootRef.current !== activeRoot) {
        clearExpandRoot(activeRootRef.current)
      }
      activeRootRef.current = activeRoot

      const targetSize = activeRoot ? EXPAND_SIZE : IDLE_SIZE
      if (targetSizeRef.current !== targetSize) {
        targetSizeRef.current = targetSize
        tweenRef.current?.kill()
        tweenRef.current = gsap.to(sizeProxy.current, {
          size: targetSize,
          duration: 0.35,
          ease: 'power3.out',
          onUpdate: applyMasks,
        })
      }

      applyMasks()
    }

    const schedule = () => {
      if (rafRef.current) return
      rafRef.current = window.requestAnimationFrame(flush)
    }

    const onPointerMove = (event: PointerEvent) => {
      posRef.current.x = event.clientX
      posRef.current.y = event.clientY
      schedule()
    }

    const onScrollOrResize = () => schedule()

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScrollOrResize, { passive: true, capture: true })
    window.addEventListener('resize', onScrollOrResize, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      tweenRef.current?.kill()
      if (activeRootRef.current) clearExpandRoot(activeRootRef.current)
      activeRootRef.current = null
      document.documentElement.style.removeProperty('--cx')
      document.documentElement.style.removeProperty('--cy')
    }
  }, [enabled])

  const value = useMemo(
    () => ({ enabled, trackRef, discRef, rootRef }),
    [enabled],
  )

  return (
    <CursorEngineContext.Provider value={value}>{children}</CursorEngineContext.Provider>
  )
}

export function useCursorEngine() {
  const ctx = useContext(CursorEngineContext)
  if (!ctx) {
    return {
      enabled: false,
      trackRef: { current: null },
      discRef: { current: null },
      rootRef: { current: null },
    } satisfies CursorEngineApi
  }
  return ctx
}

export function useCursorLens() {
  const { enabled } = useCursorEngine()
  return { enabled }
}
