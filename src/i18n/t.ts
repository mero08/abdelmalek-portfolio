import type { Lang, LocaleString } from '../content/types'

export function pickLocale(value: string | LocaleString, lang: Lang): string {
  if (typeof value === 'string') return value
  const primary = value[lang]?.trim()
  if (primary) return primary
  const en = value.en?.trim()
  if (en) return en
  return value.ar?.trim() ?? ''
}
