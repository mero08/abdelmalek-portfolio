import { describe, expect, it } from 'vitest'
import { toEmbedSrc, toWatchUrl } from './embeds'

describe('embeds', () => {
  it('builds youtube embed and watch urls', () => {
    expect(toEmbedSrc('youtube', 'https://www.youtube.com/watch?v=abc123XYZ_-')).toBe(
      'https://www.youtube.com/embed/abc123XYZ_-',
    )
    expect(toEmbedSrc('youtube', 'https://youtu.be/abc123XYZ_-')).toBe(
      'https://www.youtube.com/embed/abc123XYZ_-',
    )
    expect(toWatchUrl('youtube', 'https://youtu.be/abc123XYZ_-')).toBe(
      'https://www.youtube.com/watch?v=abc123XYZ_-',
    )
  })

  it('builds vimeo embed and watch urls', () => {
    expect(toEmbedSrc('vimeo', 'https://vimeo.com/347119375')).toBe(
      'https://player.vimeo.com/video/347119375',
    )
    expect(toWatchUrl('vimeo', 'https://vimeo.com/347119375')).toBe(
      'https://vimeo.com/347119375',
    )
  })

  it('returns null for invalid urls', () => {
    expect(toEmbedSrc('youtube', 'https://example.com')).toBeNull()
  })

  it('appends autoplay when requested', () => {
    expect(
      toEmbedSrc('youtube', 'https://www.youtube.com/watch?v=abc123XYZ_-', { autoplay: true }),
    ).toBe('https://www.youtube.com/embed/abc123XYZ_-?autoplay=1')
    expect(toEmbedSrc('vimeo', 'https://vimeo.com/347119375', { autoplay: true })).toBe(
      'https://player.vimeo.com/video/347119375?autoplay=1',
    )
  })
})
