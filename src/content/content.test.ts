import { describe, expect, it } from 'vitest'

describe('content modules', () => {
  it('exposes site identity and contact', async () => {
    const { site } = await import('./site')
    expect(site.name).toBe('Abdelmalek Marwan')
    expect(site.email).toContain('@')
    expect(site.phone).toMatch(/^\+20/)
    expect(site.phoneE164).toBe('+201025735207')
    expect(site.socials.some((s) => s.id === 'whatsapp' && s.url.includes('201025735207'))).toBe(
      true,
    )
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
    const { reels } = await import('./reels')
    expect(Array.isArray(reels)).toBe(true)
    expect(reels.length).toBe(10)
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
