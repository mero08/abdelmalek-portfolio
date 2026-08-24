import { afterEach, describe, expect, it, vi } from 'vitest'
import { prefersReducedMotion } from './reducedMotion'

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads matchMedia', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    )
    expect(prefersReducedMotion()).toBe(true)
  })
})
