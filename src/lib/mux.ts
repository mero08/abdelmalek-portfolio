/** 9:16 frame for vertical reels. */
const REEL_THUMB_W = 360
const REEL_THUMB_H = 640

/** Mux thumbnail URL — always use the video frame, not a separate stock image. */
export function muxThumbnailUrl(
  playbackId: string,
  options?: { time?: number; width?: number; height?: number },
): string {
  const width = options?.width ?? REEL_THUMB_W
  const height = options?.height ?? REEL_THUMB_H
  const time = options?.time ?? 1
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    fit_mode: 'smartcrop',
    time: String(time),
  })
  return `https://image.mux.com/${playbackId}/thumbnail.webp?${params.toString()}`
}

/** HLS master playlist — warm this to start playback faster. */
export function muxStreamUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`
}

const warmedStreams = new Set<string>()

/** Prefetch a Mux HLS playlist (and optional poster) without playing. */
export function warmMuxPlayback(
  playbackId: string,
  options?: { poster?: string },
): void {
  if (typeof window === 'undefined' || !playbackId) return
  if (warmedStreams.has(playbackId)) return
  warmedStreams.add(playbackId)

  // Fire-and-forget playlist warm so the first play has CDN cache heat
  void fetch(muxStreamUrl(playbackId), {
    mode: 'cors',
    credentials: 'omit',
    cache: 'force-cache',
  }).catch(() => {
    warmedStreams.delete(playbackId)
  })

  if (options?.poster) {
    const img = new Image()
    img.decoding = 'async'
    img.src = options.poster
  }
}
