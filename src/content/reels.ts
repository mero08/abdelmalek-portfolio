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

/** Distinct Mux assets for the first three slots; rest keep the default. */
const PLAYBACK_IDS: string[] = [
  'nwvaBievnXVHuFoVTnyxHVBpGtwnB28LeIqbhyOeSPA',
  '3zrLkV02tEIjLPkKFpOz6E003ichN1WDjgv3HEHLLTeuU',
  'iy8vqcttdrCtWbCxS3hUoyidhSMLKnmb2Tv01NzDto3w',
  'VynN8WiEgLGFVXSGhN4KUJxeFTJP6CK00qX1pedEROWU',
  'EnXr02kFXSZXruG01zzwcz01ipWfvHlxd6lCMgEpNJ02wVE',
  'vqadoyP3SyMEpvSKyJcvrCehhmQioCQrses4pmzz9UM',
  DEFAULT_MUX_PLAYBACK_ID,
  DEFAULT_MUX_PLAYBACK_ID,
  DEFAULT_MUX_PLAYBACK_ID,
  DEFAULT_MUX_PLAYBACK_ID,
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
  buildReel(title, index, PLAYBACK_IDS[index] ?? DEFAULT_MUX_PLAYBACK_ID),
)
