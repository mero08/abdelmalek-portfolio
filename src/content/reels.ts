import { muxThumbnailUrl } from '../lib/mux'
import type { Reel } from './types'

/** Default Mux playback ID — replace per reel below when assets are ready. */
export const DEFAULT_MUX_PLAYBACK_ID =
  'A0054bey153tzYeOiExyLf02Bv029McbShKIGPP9NRgGT4'

const TITLES: Reel['title'][] = [
  { en: 'Night Cut', ar: 'قطع ليلي' },
  { en: 'Brand Pulse', ar: 'نبض العلامة' },
  { en: 'City Pace', ar: 'إيقاع المدينة' },
  { en: 'Soft Focus', ar: 'تركيز ناعم' },
  { en: 'Hard Cut', ar: 'قطع حاد' },
  { en: 'Warm Tone', ar: 'درجة دافئة' },
  { en: 'Cold Open', ar: 'افتتاحية باردة' },
  { en: 'Beat Drop', ar: 'هبوط الإيقاع' },
  { en: 'Quiet Frame', ar: 'إطار هادئ' },
  { en: 'Final Mark', ar: 'العلامة الأخيرة' },
]

function buildReel(title: Reel['title'], index: number, muxPlaybackId: string): Reel {
  return {
    id: `reel-${String(index + 1).padStart(2, '0')}`,
    title,
    muxPlaybackId,
    cover: muxThumbnailUrl(muxPlaybackId),
  }
}

/** Replace muxPlaybackId per entry when your Mux assets are ready. */
export const reels: Reel[] = TITLES.map((title, index) =>
  buildReel(title, index, DEFAULT_MUX_PLAYBACK_ID),
)
