import type { AboutStatFormat } from '../../content/types'

/** Editor-native stat display — frame counter, timecode, or padded count. */
export function formatStatValue(
  value: number,
  format: AboutStatFormat,
  suffix = '',
): string {
  const n = Math.max(0, Math.round(value))

  switch (format) {
    case 'frames':
      return `${String(n).padStart(6, '0')}${suffix}`
    case 'timecode':
      return `00:${String(n).padStart(2, '0')}${suffix}`
    case 'count':
      return `${String(n).padStart(5, '0')}${suffix}`
  }
}
