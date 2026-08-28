import { describe, expect, it } from 'vitest'
import { ATMOSPHERE_SECTIONS, moodForSectionId } from './atmosphereConfig'

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
})
