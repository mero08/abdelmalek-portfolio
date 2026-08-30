import { describe, expect, it } from 'vitest'
import { formatStatValue } from './formatStatValue'

describe('formatStatValue', () => {
  it('pads small frame counts like an edit counter', () => {
    expect(formatStatValue(120, 'frames', '+')).toBe('0120+')
  })

  it('drops leading zeros for large frame counts', () => {
    expect(formatStatValue(1000, 'frames', '+')).toBe('1000+')
  })

  it('formats years as timecode', () => {
    expect(formatStatValue(7, 'timecode')).toBe('00:07')
  })

  it('pads small client counts', () => {
    expect(formatStatValue(34, 'count', '+')).toBe('034+')
  })

  it('drops leading zeros for larger client counts', () => {
    expect(formatStatValue(50, 'count', '+')).toBe('050+')
    expect(formatStatValue(120, 'count', '+')).toBe('120+')
  })
})
