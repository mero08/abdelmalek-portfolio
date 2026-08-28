export type AtmosphereSectionId = 'about' | 'reels' | 'featured' | 'contact'

export type AtmosphereSection = {
  id: AtmosphereSectionId
  /** Resting warmth 0–1 (higher = warmer / more present). */
  mood: number
}

/** Soft cinematic — enter swell duration seconds. */
export const ENTER_DURATION = 0.65

/** Mouse lerp factor per frame (~60fps). */
export const MOUSE_LERP = 0.06

/** Scroll velocity decay per frame. */
export const SCROLL_VEL_DECAY = 0.92

/** Max scroll-velocity contribution before clamp. */
export const SCROLL_VEL_MAX = 1.2

export const ATMOSPHERE_SECTIONS: AtmosphereSection[] = [
  { id: 'about', mood: 0.55 },
  { id: 'reels', mood: 0.35 },
  { id: 'featured', mood: 0.4 },
  { id: 'contact', mood: 0.22 },
]

export function moodForSectionId(id: string): number {
  return ATMOSPHERE_SECTIONS.find((s) => s.id === id)?.mood ?? 0.35
}
