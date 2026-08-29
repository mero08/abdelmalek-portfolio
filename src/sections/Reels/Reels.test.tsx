import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { Reels } from './Reels'

vi.mock('@mux/mux-player-react', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="reels-focus-mux">{title}</div>
  ),
}))

vi.mock('../../lib/reducedMotion', () => ({
  prefersReducedMotion: () => true,
}))

vi.mock('../../content/reels', () => ({
  reels: [
    {
      id: 'reel-01',
      title: { en: 'Night Cut', ar: 'قطع ليلي' },
      cover: 'https://example.com/cover.jpg',
      muxPlaybackId: 'test-playback-id',
    },
  ],
}))

describe('Reels', () => {
  it('renders heading and fallback player when reduced motion', () => {
    render(
      <LocaleProvider>
        <Reels />
      </LocaleProvider>,
    )
    expect(screen.getByRole('heading', { name: 'Reels' })).toBeInTheDocument()
    expect(screen.getByTestId('reels-fallback-player')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Night Cut/i })).toBeInTheDocument()
  })
})
