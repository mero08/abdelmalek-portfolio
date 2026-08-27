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

/** Camera / reel target lerp per frame. */
export const STAGE_LERP = 0.045

export const ATMOSPHERE_SECTIONS: AtmosphereSection[] = [
  { id: 'about', mood: 0.55 },
  { id: 'reels', mood: 0.35 },
  { id: 'featured', mood: 0.4 },
  { id: 'contact', mood: 0.22 },
]

/** Award-stage keyframes per section — camera + reel language. */
export type StageBeat = {
  camX: number
  camY: number
  camZ: number
  lookX: number
  lookY: number
  lookZ: number
  reelX: number
  reelY: number
  reelZ: number
  reelRotX: number
  reelRotZ: number
  spin: number
  frameSpread: number
  rim: number
}

export const STAGE_BEATS: Record<AtmosphereSectionId, StageBeat> = {
  about: {
    camX: 0.2,
    camY: 0.08,
    camZ: 5.6,
    lookX: 1.35,
    lookY: 0,
    lookZ: 0,
    reelX: 1.45,
    reelY: 0.08,
    reelZ: 0.15,
    reelRotX: 0.22,
    reelRotZ: -0.25,
    spin: 0.22,
    frameSpread: 0.78,
    rim: 0.7,
  },
  reels: {
    camX: 0.4,
    camY: 0.14,
    camZ: 4.1,
    lookX: 1.05,
    lookY: 0.05,
    lookZ: 0,
    reelX: 1.05,
    reelY: 0.12,
    reelZ: 0.35,
    reelRotX: 0.4,
    reelRotZ: -0.08,
    spin: 0.7,
    frameSpread: 1.05,
    rim: 1.05,
  },
  featured: {
    camX: -0.2,
    camY: 0.25,
    camZ: 5.1,
    lookX: 1.2,
    lookY: -0.05,
    lookZ: 0,
    reelX: 1.35,
    reelY: -0.15,
    reelZ: -0.15,
    reelRotX: -0.28,
    reelRotZ: 0.35,
    spin: 0.32,
    frameSpread: 1.15,
    rim: 1,
  },
  contact: {
    camX: 0.05,
    camY: 0.0,
    camZ: 7.4,
    lookX: 1.0,
    lookY: 0,
    lookZ: 0,
    reelX: 1.7,
    reelY: 0.0,
    reelZ: -0.4,
    reelRotX: 0.08,
    reelRotZ: -0.35,
    spin: 0.08,
    frameSpread: 0.55,
    rim: 0.35,
  },
}

export function moodForSectionId(id: string): number {
  return ATMOSPHERE_SECTIONS.find((s) => s.id === id)?.mood ?? 0.35
}

export function stageBeatForId(id: string): StageBeat {
  if (id in STAGE_BEATS) return STAGE_BEATS[id as AtmosphereSectionId]
  return STAGE_BEATS.about
}

export function frameCountForViewport(width: number): number {
  return width < 700 ? 8 : 14
}
