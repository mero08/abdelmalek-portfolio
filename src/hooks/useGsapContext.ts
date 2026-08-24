import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/reducedMotion'

gsap.registerPlugin(ScrollTrigger)

export function useGsapContext(
  scopeRef: RefObject<Element | null>,
  fn: () => void,
  deps: unknown[] = [],
) {
  useEffect(() => {
    if (prefersReducedMotion() || !scopeRef.current) return

    const ctx = gsap.context(fn, scopeRef)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeRef, ...deps])
}
