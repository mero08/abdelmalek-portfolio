import { useEffect, useState } from 'react'
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

export function useWebglEnabled(): boolean {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    setEnabled(detectWebgl())
  }, [])

  return enabled
}
