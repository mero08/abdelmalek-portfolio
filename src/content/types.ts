export type Lang = 'en' | 'ar'

export type LocaleString = {
  en: string
  ar: string
}

export type EmbedProvider = 'youtube' | 'vimeo'

export type SocialId = 'instagram' | 'facebook' | 'whatsapp'

export type SocialLink = {
  id: SocialId
  label: string
  url: string
}

export type HeroContent = {
  label: LocaleString
  lines: LocaleString[]
  altLines: LocaleString[]
  accentLineIndexes: number[]
  altAccentLineIndexes: number[]
}

export type AboutStatFormat = 'frames' | 'timecode' | 'count'

export type AboutStat = {
  id: string
  value: number
  suffix?: string
  format: AboutStatFormat
  label: LocaleString
  detail?: LocaleString
}

export type SiteContent = {
  name: string
  role: LocaleString
  hero: HeroContent
  about: LocaleString
  aboutAlt: LocaleString
  aboutStats: AboutStat[]
  email: string
  /** Display form, e.g. +20 1025735207 */
  phone: string
  /** Digits for tel: and wa.me, e.g. +201025735207 */
  phoneE164: string
  socials: SocialLink[]
}

export type Reel = {
  id: string
  title: LocaleString
  /** Mux video thumbnail (frame from muxPlaybackId) for orbiters + player poster */
  cover: string
  /** Mux playback ID — swap per reel in reels.ts */
  muxPlaybackId: string
}

export type Film = {
  slug: string
  title: LocaleString
  hook: LocaleString
  story: LocaleString
  role?: LocaleString
  cover: string | null
  stills: string[]
  provider: EmbedProvider
  url: string
  sortOrder: number
}
