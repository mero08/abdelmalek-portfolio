import { describe, expect, it } from 'vitest'
import {
  angleForFrontIndex,
  computePhoneLayouts,
  nearestFrontIndex,
  wrapAngle,
} from './reelsOrbitLayout'

describe('reelsOrbitLayout', () => {
  const count = 10

  it('detects front slot by maximum +Z', () => {
    const angle = angleForFrontIndex(3, count)
    expect(nearestFrontIndex(angle, count)).toBe(3)
  })

  it('wraps angles to 0..360', () => {
    expect(wrapAngle(370)).toBe(10)
    expect(wrapAngle(-10)).toBe(350)
  })

  it('marks one center phone in layouts', () => {
    const layouts = computePhoneLayouts(angleForFrontIndex(0, count), count)
    expect(layouts.filter((layout) => layout.isCenter)).toHaveLength(1)
    expect(layouts.find((layout) => layout.isCenter)?.index).toBe(0)
  })
})
