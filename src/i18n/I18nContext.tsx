import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_LANG,
  STORAGE_KEY,
  SUPPORTED_LANGS,
  translations,
  type Language,
} from './translations'

type I18nContextValue = {
  lang: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function isSupported(lang: string | null): lang is Language {
  return SUPPORTED_LANGS.includes(lang as Language)
}

function getNestedValue(object: unknown, keyPath: string): string | null {
  const value = keyPath.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return null
  }, object)

  return typeof value === 'string' ? value : null
}

function getStoredLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isSupported(stored) ? stored : DEFAULT_LANG
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => getStoredLanguage())

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLanguage = useCallback((next: Language) => {
    if (!isSupported(next)) return
    setLang(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const t = useCallback(
    (key: string) => {
      const dictionary = translations[lang]
      const value = getNestedValue(dictionary, key)
      return value ?? key
    },
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLanguage, t }),
    [lang, setLanguage, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
