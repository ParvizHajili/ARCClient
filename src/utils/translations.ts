import type { LanguageCode } from '../api/types'

export const DEFAULT_LANGUAGE: LanguageCode = 'az'

type NamedTranslation = {
  languageCode: string
  name: string
}

type RichTranslation = NamedTranslation & {
  description?: string
}

/** Preferred lang → az → first available. */
export function normalizeLanguageCode(lang?: string | null): LanguageCode {
  const code = (lang ?? DEFAULT_LANGUAGE).trim().toLowerCase()
  return code === 'az' || code === 'en' || code === 'ru' ? code : DEFAULT_LANGUAGE
}

export function resolveTranslatedName(
  translations: NamedTranslation[] | null | undefined,
  preferredLanguage?: string | null,
): string {
  if (!translations?.length) return ''

  const preferred = normalizeLanguageCode(preferredLanguage)
  const active = translations
    .map((item) => ({
      languageCode: (item.languageCode ?? '').trim().toLowerCase(),
      name: (item.name ?? '').trim(),
    }))
    .filter((item) => item.languageCode && item.name)

  if (!active.length) return ''

  return (
    active.find((item) => item.languageCode === preferred)?.name ??
    active.find((item) => item.languageCode === DEFAULT_LANGUAGE)?.name ??
    active[0].name
  )
}

export function resolveTranslation<T extends RichTranslation>(
  translations: T[] | null | undefined,
  preferredLanguage?: string | null,
): T | null {
  if (!translations?.length) return null

  const preferred = normalizeLanguageCode(preferredLanguage)
  const active = translations.filter(
    (item) => (item.languageCode ?? '').trim() && (item.name ?? '').trim(),
  )

  if (!active.length) return null

  return (
    active.find(
      (item) => item.languageCode.trim().toLowerCase() === preferred,
    ) ??
    active.find(
      (item) => item.languageCode.trim().toLowerCase() === DEFAULT_LANGUAGE,
    ) ??
    active[0]
  )
}
