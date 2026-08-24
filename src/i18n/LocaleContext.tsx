import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Lang, LocaleString } from '../content/types'
import { pickLocale } from './t'

type LocaleContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (value: string | LocaleString) => string
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

const STORAGE_KEY = 'abdo-lang'

function detectInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'ar') return stored
  const nav = navigator.language.toLowerCase()
  if (nav.startsWith('ar')) return 'ar'
  if (nav.startsWith('en')) return 'en'
  return 'en'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang())

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const t = useCallback(
    (value: string | LocaleString) => pickLocale(value, lang),
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
