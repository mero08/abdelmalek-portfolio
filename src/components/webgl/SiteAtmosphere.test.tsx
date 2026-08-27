import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SiteAtmosphere } from './SiteAtmosphere'

vi.mock('./useWebglEnabled', () => ({
  useWebglEnabled: () => false,
}))

describe('SiteAtmosphere', () => {
  it('renders CSS fallback when WebGL is disabled', () => {
    render(<SiteAtmosphere />)
    const root = screen.getByTestId('site-atmosphere')
    expect(root).toHaveAttribute('data-mode', 'fallback')
  })
})
