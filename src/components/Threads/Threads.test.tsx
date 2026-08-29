import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const useWebglEnabled = vi.fn(() => true)

vi.mock('../webgl/useWebglEnabled', () => ({
  useWebglEnabled: () => useWebglEnabled(),
}))

vi.mock('ogl', () => {
  class FakeRenderer {
    gl = null
    dpr = 1
    setSize() {}
    render() {}
  }
  return {
    Renderer: FakeRenderer,
    Program: class {
      uniforms = {}
      remove() {}
    },
    Mesh: class {},
    Triangle: class {
      remove() {}
    },
    Color: class {
      r = 0
      g = 0
      b = 0
      constructor(...args: number[]) {
        ;[this.r, this.g, this.b] = args
      }
    },
  }
})

import { Threads } from './Threads'

describe('Threads', () => {
  it('renders a fixed background shell with mouse interaction off', () => {
    useWebglEnabled.mockReturnValue(true)
    render(<Threads />)
    const root = screen.getByTestId('threads-bg')
    expect(root).toHaveAttribute('aria-hidden', 'true')
    expect(root).toHaveAttribute('data-mouse', 'off')
  })

  it('marks hide-over-hero when asked to stay clear of the hero', () => {
    useWebglEnabled.mockReturnValue(true)
    render(<Threads hideOverHero />)
    expect(screen.getByTestId('threads-bg')).toHaveAttribute(
      'data-hide-over-hero',
      'true',
    )
  })

  it('renders nothing when WebGL / motion is disabled', () => {
    useWebglEnabled.mockReturnValue(false)
    const { container } = render(<Threads />)
    expect(container.querySelector('[data-testid="threads-bg"]')).toBeNull()
  })
})
