import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, type RefObject } from 'react'
import type { AboutStat } from '../../content/types'
import { prefersReducedMotion } from '../../lib/reducedMotion'
import { formatStatValue } from './formatStatValue'

gsap.registerPlugin(ScrollTrigger)

type Options = {
  sectionRef: RefObject<HTMLElement | null>
  pinRef: RefObject<HTMLElement | null>
  stats: AboutStat[]
}

function setStatTexts(
  section: HTMLElement,
  stats: AboutStat[],
  values: number[],
) {
  const nodes = section.querySelectorAll<HTMLElement>('[data-stat-value]')
  nodes.forEach((node, i) => {
    const stat = stats[i]
    if (!stat) return
    node.textContent = formatStatValue(values[i] ?? 0, stat.format, stat.suffix ?? '')
  })
}

export function useAboutChoreography({ sectionRef, pinRef, stats }: Options) {
  useEffect(() => {
    const section = sectionRef.current
    const pin = pinRef.current
    if (!section || !pin) return

    const cards = gsap.utils.toArray<HTMLElement>('[data-about-stat]', section)
    const copy = section.querySelector<HTMLElement>('[data-about-copy]')
    const values = stats.map((s) => s.value)

    if (prefersReducedMotion()) {
      setStatTexts(section, stats, values)
      gsap.set(cards, { opacity: 1, x: 0, y: 0 })
      if (copy) gsap.set(copy, { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(min-width: 901px)', () => {
        const fromX = document.documentElement.dir === 'rtl' ? -72 : 72
        setStatTexts(section, stats, stats.map(() => 0))
        gsap.set(cards, { opacity: 0, x: fromX, y: 28 })
        if (copy) gsap.set(copy, { opacity: 0.72, y: 12 })

        const counters = stats.map(() => ({ val: 0 }))

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=125%',
            pin,
            scrub: 0.55,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        if (copy) {
          tl.to(copy, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }, 0)
        }

        cards.forEach((card, i) => {
          const offset = 0.12 + i * 0.22
          tl.to(
            card,
            { opacity: 1, x: 0, y: 0, duration: 0.28, ease: 'power3.out' },
            offset,
          )
          tl.to(
            counters[i],
            {
              val: values[i],
              duration: 0.32,
              ease: 'power2.out',
              onUpdate: () => {
                const node = card.querySelector<HTMLElement>('[data-stat-value]')
                const stat = stats[i]
                if (!node || !stat) return
                node.textContent = formatStatValue(
                  counters[i].val,
                  stat.format,
                  stat.suffix ?? '',
                )
              },
            },
            offset + 0.04,
          )
        })
      })

      mm.add('(max-width: 900px)', () => {
        setStatTexts(section, stats, values.map(() => 0))
        gsap.set(cards, { opacity: 0, y: 36 })

        cards.forEach((card, i) => {
          const counter = { val: 0 }
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
            },
          })
          gsap.to(counter, {
            val: values[i],
            duration: 1.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
            },
            onUpdate: () => {
              const node = card.querySelector<HTMLElement>('[data-stat-value]')
              const stat = stats[i]
              if (!node || !stat) return
              node.textContent = formatStatValue(
                counter.val,
                stat.format,
                stat.suffix ?? '',
              )
            },
          })
        })
      })
    }, section)

    const refresh = () => ScrollTrigger.refresh()
    requestAnimationFrame(refresh)

    return () => ctx.revert()
  }, [sectionRef, pinRef, stats])
}
