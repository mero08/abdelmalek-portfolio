import { describe, expect, it } from 'vitest'
import { resolveFilmCover, toEmbedSrc, toWatchUrl, youtubeThumbnail } from './embeds'

describe('embeds', () => {
  it('builds youtube embed and watch urls', () => {
    const embed = toEmbedSrc('youtube', 'https://www.youtube.com/watch?v=abc123XYZ_-')
    expect(embed).toContain('https://www.youtube-nocookie.com/embed/abc123XYZ_-')
    expect(embed).toContain('rel=0')
    expect(embed).toContain('modestbranding=1')
    expect(embed).toContain('playsinline=1')
    expect(embed).toContain('enablejsapi=1')
    expect(toEmbedSrc('youtube', 'https://youtu.be/abc123XYZ_-')).toContain(
      'https://www.youtube-nocookie.com/embed/abc123XYZ_-',
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
    const embed = toEmbedSrc('youtube', 'https://www.youtube.com/watch?v=abc123XYZ_-', {
      autoplay: true,
    })
    expect(embed).toContain('autoplay=1')
    expect(embed).toContain('https://www.youtube-nocookie.com/embed/abc123XYZ_-')
    expect(toEmbedSrc('vimeo', 'https://vimeo.com/347119375', { autoplay: true })).toBe(
      'https://player.vimeo.com/video/347119375?autoplay=1',
    )
  })

  it('builds youtube thumbnail urls and resolves film cover', () => {
    expect(youtubeThumbnail('abc123XYZ_-')).toBe(
      'https://i.ytimg.com/vi/abc123XYZ_-/maxresdefault.jpg',
    )
    expect(
      resolveFilmCover({
        cover: null,
        provider: 'youtube',
        url: 'https://www.youtube.com/watch?v=045VJIe1fnU',
      }),
    ).toBe('https://i.ytimg.com/vi/045VJIe1fnU/maxresdefault.jpg')
  })
})
