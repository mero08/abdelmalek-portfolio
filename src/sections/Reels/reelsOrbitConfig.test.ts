import { describe, expect, it } from 'vitest'
import { REELS_ORBIT, resolveHoldMs } from './reelsOrbitConfig'

describe('reelsOrbitConfig', () => {
  it('uses a longer hold after recent user interaction', () => {
    const now = 10_000
    expect(resolveHoldMs(now - 1000, now)).toBe(REELS_ORBIT.ENGAGE_HOLD_MS)
  })

  it('returns to idle hold after engage grace expires', () => {
    const now = 100_000
    expect(resolveHoldMs(now - REELS_ORBIT.ENGAGE_GRACE_MS - 1, now)).toBe(
      REELS_ORBIT.IDLE_HOLD_MS,
    )
  })
})
