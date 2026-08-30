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
      // Keep the counter feel for small values; drop leading zeros once large.
      if (n >= 1000) return `${n}${suffix}`
      return `${String(n).padStart(4, '0')}${suffix}`
    case 'timecode':
      return `00:${String(n).padStart(2, '0')}${suffix}`
    case 'count':
      if (n >= 100) return `${n}${suffix}`
      return `${String(n).padStart(3, '0')}${suffix}`
  }
}
