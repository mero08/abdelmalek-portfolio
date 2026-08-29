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
