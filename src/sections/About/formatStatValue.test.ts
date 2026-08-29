import { describe, expect, it } from 'vitest'
import { formatStatValue } from './formatStatValue'

describe('formatStatValue', () => {
  it('pads frame counts like an edit counter', () => {
    expect(formatStatValue(120, 'frames', '+')).toBe('000120+')
  })

  it('formats years as timecode', () => {
    expect(formatStatValue(7, 'timecode')).toBe('00:07')
  })

  it('pads client counts', () => {
    expect(formatStatValue(34, 'count', '+')).toBe('00034+')
  })
})
