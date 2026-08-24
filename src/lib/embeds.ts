import type { EmbedProvider } from '../content/types'

function youtubeId(url: string): string | null {
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

export function toEmbedSrc(
  provider: EmbedProvider,
  url: string,
  options?: { autoplay?: boolean },
): string | null {
  let base: string | null = null

  if (provider === 'youtube') {
    const id = youtubeId(url)
    base = id ? `https://www.youtube.com/embed/${id}` : null
  } else {
    const id = vimeoId(url)
    base = id ? `https://player.vimeo.com/video/${id}` : null
  }

  if (!base || !options?.autoplay) return base

  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}autoplay=1`
}

export function toWatchUrl(provider: EmbedProvider, url: string): string {
  if (provider === 'youtube') {
    const id = youtubeId(url)
    return id ? `https://www.youtube.com/watch?v=${id}` : url
  }
  const id = vimeoId(url)
  return id ? `https://vimeo.com/${id}` : url
}
