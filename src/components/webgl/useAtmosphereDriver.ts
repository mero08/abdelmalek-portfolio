import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { useEffect, useRef, type RefObject } from 'react'
import {
  ATMOSPHERE_SECTIONS,
  ENTER_DURATION,
  MOUSE_LERP,
  SCROLL_VEL_DECAY,
  SCROLL_VEL_MAX,
  moodForSectionId,
  type AtmosphereSectionId,
} from './atmosphereConfig'

gsap.registerPlugin(ScrollTrigger)

export type AtmosphereState = {
  mouseX: number
  mouseY: number
  targetMouseX: number
  targetMouseY: number
  scrollVel: number
  mood: number
  enter: number
  heroCover: number
}

function createState(): AtmosphereState {
  return {
    mouseX: 0.5,
    mouseY: 0.5,
    targetMouseX: 0.5,
    targetMouseY: 0.5,
    scrollVel: 0,
    mood: moodForSectionId('about'),
    enter: 0,
    heroCover: 1,
  }
}

function nearestSectionId(): AtmosphereSectionId | null {
  const viewMid = window.innerHeight * 0.45
  let best: AtmosphereSectionId | null = null
  let bestDist = Infinity

  for (const section of ATMOSPHERE_SECTIONS) {
    const el = document.getElementById(section.id)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (rect.bottom < 80 || rect.top > window.innerHeight - 40) continue
    const mid = rect.top + Math.min(rect.height, window.innerHeight) * 0.35
    const dist = Math.abs(mid - viewMid)
    if (dist < bestDist) {
      bestDist = dist
      best = section.id
    }
  }

  return best
}

export function useAtmosphereDriver(): RefObject<AtmosphereState> {
  const stateRef = useRef<AtmosphereState>(createState())

  useEffect(() => {
    const state = stateRef.current
    let lastScrollY = window.scrollY
    let raf = 0
    let activeId: string | null = null
    let enterPhase: 'idle' | 'up' | 'down' = 'idle'
    let lastTs = performance.now()
    let frame = 0

    const writeCss = () => {
      const root = document.documentElement
      root.style.setProperty('--atm-enter', state.enter.toFixed(3))
      root.style.setProperty('--atm-mood', state.mood.toFixed(3))
      root.style.setProperty('--atm-hero', state.heroCover.toFixed(3))
      root.style.setProperty('--atm-vel', state.scrollVel.toFixed(3))
      if (activeId) root.dataset.atmSection = activeId
    }

    const pulseEnter = (id: string) => {
      if (id === activeId) return
      activeId = id
      state.mood = moodForSectionId(id)
      state.enter = 0
      enterPhase = 'up'
    }

    const syncSection = () => {
      if (state.heroCover > 0.72) return
      const id = nearestSectionId()
      if (id) pulseEnter(id)
    }

    const tick = (ts: number) => {
      const dt = Math.min(0.05, (ts - lastTs) / 1000)
      lastTs = ts

      state.mouseX += (state.targetMouseX - state.mouseX) * MOUSE_LERP
      state.mouseY += (state.targetMouseY - state.mouseY) * MOUSE_LERP
      state.scrollVel *= SCROLL_VEL_DECAY
      if (state.scrollVel < 0.001) state.scrollVel = 0

      const upDur = ENTER_DURATION * 0.4
      const downDur = ENTER_DURATION * 0.6
      if (enterPhase === 'up') {
        state.enter = Math.min(1, state.enter + dt / upDur)
        if (state.enter >= 1) enterPhase = 'down'
      } else if (enterPhase === 'down') {
        state.enter = Math.max(0, state.enter - dt / downDur)
        if (state.enter <= 0) enterPhase = 'idle'
      }

      frame += 1
      if (frame % 8 === 0) syncSection()
      writeCss()
      raf = requestAnimationFrame(tick)
    }

    const onPointer = (e: PointerEvent) => {
      state.targetMouseX = e.clientX / Math.max(1, window.innerWidth)
      state.targetMouseY = e.clientY / Math.max(1, window.innerHeight)
    }

    const onScroll = () => {
      const y = window.scrollY
      const dy = Math.abs(y - lastScrollY)
      lastScrollY = y
      state.scrollVel = Math.min(
        SCROLL_VEL_MAX,
        state.scrollVel + dy / Math.max(1, window.innerHeight),
      )
      syncSection()
    }

    const triggers: ScrollTrigger[] = []
    const hero = document.getElementById('hero')
    if (hero) {
      triggers.push(
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            state.heroCover = 1 - self.progress
            if (state.heroCover < 0.72) syncSection()
          },
        }),
      )
    }

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    raf = requestAnimationFrame(tick)

    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      syncSection()
    })

    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll, true)
      cancelAnimationFrame(raf)
      for (const t of triggers) t.kill()
      const root = document.documentElement
      root.style.removeProperty('--atm-enter')
      root.style.removeProperty('--atm-mood')
      root.style.removeProperty('--atm-hero')
      root.style.removeProperty('--atm-vel')
      delete root.dataset.atmSection
    }
  }, [])

  return stateRef
}
