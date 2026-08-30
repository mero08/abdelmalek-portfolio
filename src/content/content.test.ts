import { describe, expect, it } from 'vitest'

describe('content modules', () => {
  it('exposes site identity and contact', async () => {
    const { site } = await import('./site')
    expect(site.name).toBe('Abdelmalek Marwan')
    expect(site.email).toContain('@')
    expect(site.phone).toMatch(/^\+20/)
    expect(site.phoneE164).toBe('+201154085914')
    expect(site.email).toBe('abdelmalekmarawan123@gmail.com')
    expect(site.socials.some((s) => s.id === 'whatsapp' && s.url.includes('201154085914'))).toBe(
      true,
    )
    expect(
      site.socials.some(
        (s) => s.id === 'instagram' && s.url.includes('abdelmalek.marawan'),
      ),
    ).toBe(true)
    expect(site.role.en.length).toBeGreaterThan(0)
    expect(site.role.ar.length).toBeGreaterThan(0)
    expect(site.socials.length).toBeGreaterThan(0)
  })

  it('finds films by slug and adjacent order', async () => {
    const { films, getFilmBySlug, getAdjacentFilms } = await import('./films')
    expect(films.length).toBeGreaterThan(0)
    const first = [...films].sort((a, b) => a.sortOrder - b.sortOrder)[0]
    expect(getFilmBySlug(first.slug)).toEqual(first)
    expect(getFilmBySlug('does-not-exist')).toBeUndefined()
    const { next } = getAdjacentFilms(first.slug)
    if (films.length > 1) {
      const ordered = [...films].sort((a, b) => a.sortOrder - b.sortOrder)
      expect(next?.slug).toBe(ordered[1].slug)
    }
  })

  it('exposes reels as an array', async () => {
    const { reels, DEFAULT_MUX_PLAYBACK_ID } = await import('./reels')
    expect(Array.isArray(reels)).toBe(true)
    expect(reels.length).toBe(10)
    expect(reels.slice(0, 3).map((reel) => reel.muxPlaybackId)).toEqual([
      'nwvaBievnXVHuFoVTnyxHVBpGtwnB28LeIqbhyOeSPA',
      '3zrLkV02tEIjLPkKFpOz6E003ichN1WDjgv3HEHLLTeuU',
      'iy8vqcttdrCtWbCxS3hUoyidhSMLKnmb2Tv01NzDto3w',
    ])
    expect(
      reels.slice(3).every((reel) => reel.muxPlaybackId === DEFAULT_MUX_PLAYBACK_ID),
    ).toBe(true)
    for (const reel of reels) {
      expect(reel.muxPlaybackId.length).toBeGreaterThan(0)
      expect(reel.cover).toContain('image.mux.com')
      expect(reel.cover).toContain(reel.muxPlaybackId)
    }
  })

  it('exposes placeholder hero lines and about alt', async () => {
    const { site } = await import('./site')
    expect(site.hero.lines.length).toBeGreaterThan(1)
    expect(site.hero.accentLineIndexes.length).toBeGreaterThan(0)
    expect(site.aboutAlt.en.length).toBeGreaterThan(0)
    expect(site.aboutAlt.ar.length).toBeGreaterThan(0)
    expect(site.aboutStats.length).toBe(3)
  })
})
