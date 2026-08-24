import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { VideoPlayer } from './VideoPlayer'

describe('VideoPlayer', () => {
  it('shows cover and loads embed on click', async () => {
    const user = userEvent.setup()
    render(
      <VideoPlayer
        provider="youtube"
        url="https://www.youtube.com/watch?v=abc123XYZ_-"
        cover={null}
        title="Test Reel"
      />,
    )
    expect(screen.getByRole('button', { name: /play test reel/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /play test reel/i }))
    expect(screen.getByTitle('Test Reel')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/abc123XYZ_-?autoplay=1',
    )
    expect(screen.getByRole('link', { name: /open video/i })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=abc123XYZ_-',
    )
  })

  it('shows unavailable state for bad urls', async () => {
    const user = userEvent.setup()
    render(
      <VideoPlayer
        provider="youtube"
        url="https://example.com/nope"
        cover={null}
        title="Broken"
      />,
    )
    await user.click(screen.getByRole('button', { name: /play broken/i }))
    const overlay = screen.getByText(/video unavailable/i).parentElement!
    expect(within(overlay).getByRole('link', { name: /open video/i })).toHaveAttribute(
      'href',
      'https://example.com/nope',
    )
  })
})
