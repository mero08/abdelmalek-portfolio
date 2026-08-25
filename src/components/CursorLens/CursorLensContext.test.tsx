import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { CursorLensProvider, useCursorEngine } from './CursorLensContext'

function Probe() {
  const { enabled } = useCursorEngine()
  return <div data-testid="en">{enabled ? 'yes' : 'no'}</div>
}

describe('CursorLensProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? true : false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
      onchange: null,
    }))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('disables engine when prefers-reduced-motion', () => {
    render(
      <CursorLensProvider>
        <Probe />
      </CursorLensProvider>,
    )
    expect(screen.getByTestId('en')).toHaveTextContent('no')
  })
})
