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
