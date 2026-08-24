export type Lang = 'en' | 'ar'

export type LocaleString = {
  en: string
  ar: string
}

export type EmbedProvider = 'youtube' | 'vimeo'

export type SocialLink = {
  label: string
  url: string
}

export type HeroContent = {
  label: LocaleString
  lines: LocaleString[]
  accentLineIndexes: number[]
}

export type SiteContent = {
  name: string
  role: LocaleString
  hero: HeroContent
  about: LocaleString
  aboutAlt: LocaleString
  email: string
  socials: SocialLink[]
}

export type Reel = {
  id: string
  title: LocaleString
  cover: string | null
  provider: EmbedProvider
  url: string
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
