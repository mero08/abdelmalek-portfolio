import type { EmbedProvider } from '../content/types'

export function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.replace('/', '') || null
    }
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v')
    }
  } catch {
    return null
  }
  return null
}

function vimeoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('vimeo.com')) return null
    const parts = u.pathname.split('/').filter(Boolean)
    const id = parts.find((p) => /^\d+$/.test(p))
    return id ?? null
  } catch {
    return null
  }
}

export type YoutubeThumbnailQuality = 'maxresdefault' | 'hqdefault'

export function youtubeThumbnail(id: string, quality: YoutubeThumbnailQuality = 'maxresdefault') {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`
}

export function resolveFilmCover(film: {
  cover: string | null
  provider: EmbedProvider
  url: string
}): string | null {
  if (film.cover) return film.cover
  if (film.provider !== 'youtube') return null
  const id = extractYoutubeId(film.url)
  return id ? youtubeThumbnail(id) : null
}

function buildYoutubeEmbed(id: string, autoplay: boolean): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
  })
  if (typeof window !== 'undefined' && window.location.origin) {
    params.set('origin', window.location.origin)
  }
  if (autoplay) params.set('autoplay', '1')
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}

export function toEmbedSrc(
  provider: EmbedProvider,
  url: string,
  options?: { autoplay?: boolean },
): string | null {
  if (provider === 'youtube') {
    const id = extractYoutubeId(url)
    if (!id) return null
    return buildYoutubeEmbed(id, options?.autoplay ?? false)
  }

  const id = vimeoId(url)
  const base = id ? `https://player.vimeo.com/video/${id}` : null
  if (!base || !options?.autoplay) return base

  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}autoplay=1`
}

export function toWatchUrl(provider: EmbedProvider, url: string): string {
  if (provider === 'youtube') {
    const id = extractYoutubeId(url)
    return id ? `https://www.youtube.com/watch?v=${id}` : url
  }
  const id = vimeoId(url)
  return id ? `https://vimeo.com/${id}` : url
}
