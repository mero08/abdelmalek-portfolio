import gsap from 'gsap'
import { useEffect, type RefObject } from 'react'
import {
  CURSOR_MAGNET_ATTR,
  MAGNET_PULL,
  MAGNET_RADIUS,
} from '../CursorLens/cursorConfig'
import { useCursorEngine } from '../CursorLens/CursorLensContext'

/**
 * Pulls [data-cursor-magnet] children toward the pointer with an elastic release.
 */
export function useMagneticSocials(listRef: RefObject<HTMLElement | null>) {
  const { enabled } = useCursorEngine()

  useEffect(() => {
    const list = listRef.current
    if (!enabled || !list) return

    const nodes = () =>
      Array.from(list.querySelectorAll<HTMLElement>(`[${CURSOR_MAGNET_ATTR}]`))

    let raf = 0
    let x = -9999
    let y = -9999

    const tick = () => {
      raf = 0
      for (const node of nodes()) {
        const rect = node.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = x - cx
        const dy = y - cy
        const dist = Math.hypot(dx, dy)

        if (dist < MAGNET_RADIUS && dist > 0.01) {
          const t = 1 - dist / MAGNET_RADIUS
          const strength = t * t
          const pullX = (dx / dist) * MAGNET_PULL * strength
          const pullY = (dy / dist) * MAGNET_PULL * strength
          gsap.to(node, {
            x: pullX,
            y: pullY,
            duration: 0.35,
            ease: 'power3.out',
            overwrite: 'auto',
          })
        } else {
          gsap.to(node, {
            x: 0,
            y: 0,
            duration: 0.75,
            ease: 'elastic.out(1, 0.35)',
            overwrite: 'auto',
          })
        }
      }
    }

    const schedule = () => {
      if (raf) return
      raf = window.requestAnimationFrame(tick)
    }

    const onMove = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      schedule()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
      for (const node of nodes()) {
        gsap.killTweensOf(node)
        gsap.set(node, { x: 0, y: 0 })
      }
    }
  }, [enabled, listRef])
}
