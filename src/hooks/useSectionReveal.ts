import { useRef } from 'react'
import gsap from 'gsap'
import { useGsapContext } from './useGsapContext'

export function useSectionReveal() {
  const scopeRef = useRef<HTMLDivElement>(null)

  useGsapContext(scopeRef, () => {
    const targets = scopeRef.current?.querySelectorAll('[data-reveal]')
    if (!targets?.length) return

    targets.forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 48,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
      })
    })
  })

  return scopeRef
}
