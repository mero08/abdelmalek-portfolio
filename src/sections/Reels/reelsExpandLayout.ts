import type { CSSProperties } from 'react'
import { REELS_EXPAND } from './reelsExpandConfig'

export type ExpandRect = {
  left: number
  top: number
  width: number
  height: number
}

export function targetExpandRect(
  viewportWidth: number,
  viewportHeight: number,
): ExpandRect {
  const pad = REELS_EXPAND.VIEWPORT_EDGE_PAD
  const maxHeight = viewportHeight - pad * 2

  let height = Math.min(viewportHeight * REELS_EXPAND.VIEWPORT_HEIGHT_RATIO, REELS_EXPAND.MAX_HEIGHT)
  if (height > maxHeight) height = maxHeight

  let width = (height * 9) / 16
  const maxWidth = viewportWidth - pad * 2
  if (width > maxWidth) {
    width = maxWidth
    height = (width * 16) / 9
  }

  let top = (viewportHeight - height) / 2 + REELS_EXPAND.VERTICAL_OFFSET
  if (top + height > viewportHeight - pad) top = viewportHeight - pad - height
  if (top < pad) top = pad

  let left = (viewportWidth - width) / 2
  if (left < pad) left = pad
  if (left + width > viewportWidth - pad) left = viewportWidth - pad - width

  return { left, top, width, height }
}

export function rectToShellStyle(rect: ExpandRect): CSSProperties {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  }
}
