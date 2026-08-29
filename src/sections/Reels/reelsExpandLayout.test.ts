import { describe, expect, it } from 'vitest'
import { targetExpandRect } from './reelsExpandLayout'

describe('targetExpandRect', () => {
  it('returns centered 9:16 rect capped at max height', () => {
    const rect = targetExpandRect(1200, 900)
    expect(rect.height).toBe(702)
    expect(rect.width).toBeCloseTo(394.875, 3)
    expect(rect.top + rect.height).toBeLessThanOrEqual(900 - 16)
    expect(rect.left).toBeGreaterThanOrEqual(16)
  })

  it('shrinks to fit short viewports', () => {
    const rect = targetExpandRect(390, 700)
    expect(rect.height).toBeLessThanOrEqual(700 - 32)
    expect(rect.top).toBeGreaterThanOrEqual(16)
    expect(rect.top + rect.height).toBeLessThanOrEqual(700 - 16)
  })
})
