import { useState } from 'react'
import { prefersReducedMotion } from '../../lib/reducedMotion'

function detectWebgl(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    )
  } catch {
    return false
  }
}

/**
 * Sync detect on first client render so Hero choreography does not remount
 * when WebGL flips from a deferred false → true.
 */
export function useWebglEnabled(): boolean {
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false
    if (prefersReducedMotion()) return false
    return detectWebgl()
  })

  return enabled
}

/** Prefer the CSS cinema still on phones — sharper, lighter, visible at rest. */
export function prefersCssHeroPlate(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
}
