import { describe, expect, it } from 'vitest'
import { pickLocale } from './t'

describe('pickLocale', () => {
  it('returns string as-is', () => {
    expect(pickLocale('Hello', 'ar')).toBe('Hello')
  })

  it('picks requested language', () => {
    expect(pickLocale({ en: 'Editor', ar: 'مونتير' }, 'ar')).toBe('مونتير')
  })

  it('falls back to English then Arabic', () => {
    expect(pickLocale({ en: 'Editor', ar: '' }, 'ar')).toBe('Editor')
    expect(pickLocale({ en: '', ar: 'مونتير' }, 'en')).toBe('مونتير')
  })
})
