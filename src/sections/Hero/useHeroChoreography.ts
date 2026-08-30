import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from '../../lib/reducedMotion'

gsap.registerPlugin(ScrollTrigger)

type Options = {
  sectionRef: RefObject<HTMLElement | null>
  pinRef: RefObject<HTMLElement | null>
  progressRef: RefObject<number>
}

/**
 * Hero scroll: one pin + --hero-p. Visual scrub is CSS-driven (no filter tweens).
 * Intro runs once and is not tied to WebGL mount.
 */
export function useHeroChoreography({
  sectionRef,
  pinRef,
  progressRef,
}: Options) {
  useEffect(() => {
    const section = sectionRef.current
    const pin = pinRef.current
    if (!section || !pin) return

    const setProgress = (p: number) => {
      progressRef.current = p
      section.style.setProperty('--hero-p', p.toFixed(4))
    }

    if (prefersReducedMotion()) {
      setProgress(0.45)
      return () => setProgress(0)
    }

    const ctx = gsap.context(() => {
      const lines = section.querySelectorAll<HTMLElement>('[data-hero-line]')
      const label = section.querySelector<HTMLElement>('[data-hero-label]')
      const cue = section.querySelector<HTMLElement>('[data-hero-scroll]')

      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.05,
      })

      if (label) {
        intro.fromTo(
          label,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85 },
          0,
        )
      }

      if (lines.length) {
        intro.fromTo(
          lines,
          { yPercent: 110 },
          { yPercent: 0, duration: 1.05, stagger: 0.08 },
          0.12,
        )
      }

      if (cue) {
        intro.fromTo(
          cue,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          0.75,
        )
      }

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        // Mobile keeps a full pin, but not the tall desktop scrub distance.
        end: () =>
          window.matchMedia('(max-width: 700px)').matches ? '+=100%' : '+=145%',
        pin,
        scrub: 0.4,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setProgress(self.progress),
        onRefresh: (self) => setProgress(self.progress),
      })
    }, section)

    const refresh = () => ScrollTrigger.refresh()
    const fontsReady =
      typeof document !== 'undefined' && document.fonts?.ready
        ? document.fonts.ready.then(refresh).catch(() => undefined)
        : Promise.resolve()

    requestAnimationFrame(refresh)

    return () => {
      void fontsReady
      ctx.revert()
      setProgress(0)
    }
  }, [sectionRef, pinRef, progressRef])
}
