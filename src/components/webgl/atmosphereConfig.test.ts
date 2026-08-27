import { describe, expect, it } from 'vitest'
import {
  ATMOSPHERE_SECTIONS,
  STAGE_BEATS,
  moodForSectionId,
  stageBeatForId,
} from './atmosphereConfig'

describe('atmosphereConfig', () => {
  it('maps home content sections to moods', () => {
    expect(ATMOSPHERE_SECTIONS.map((s) => s.id)).toEqual([
      'about',
      'reels',
      'featured',
      'contact',
    ])
    expect(moodForSectionId('about')).toBeGreaterThan(moodForSectionId('contact'))
    expect(moodForSectionId('about')).toBeGreaterThan(moodForSectionId('featured'))
    expect(moodForSectionId('featured')).toBeGreaterThan(moodForSectionId('contact'))
  })

  it('defines distinct stage beats for each section', () => {
    expect(stageBeatForId('reels').spin).toBeGreaterThan(stageBeatForId('contact').spin)
    expect(stageBeatForId('featured').rim).toBeGreaterThan(stageBeatForId('about').rim)
    expect(STAGE_BEATS.about.camZ).not.toBe(STAGE_BEATS.contact.camZ)
  })
})
