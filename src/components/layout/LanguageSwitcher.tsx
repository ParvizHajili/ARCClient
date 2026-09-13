import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import type { Language } from '../../i18n/translations'

const LANGS: Language[] = ['az', 'en', 'ru']

export function LanguageSwitcher() {
  const { lang, setLanguage, t } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className="navbar-arc__language language-switcher dropdown-arc dropdown-arc--align-right"
    >
      <button
        className="dropdown-arc__toggle language-switcher__toggle"
        type="button"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls="languageMenu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="dropdown-arc__current language-switcher__current">
          {lang.toUpperCase()}
        </span>
        <svg
          className="dropdown-arc__icon language-switcher__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="2 4 6 8 10 4"></polyline>
        </svg>
      </button>
      <ul
        className={`dropdown-arc__menu language-switcher__menu${open ? ' is-open' : ''}`}
        id="languageMenu"
        role="listbox"
      >
        {LANGS.map((optionLang) => {
          const isActive = optionLang === lang
          return (
            <li key={optionLang} role="presentation">
              <button
                type="button"
                className={`dropdown-arc__option language-switcher__option${isActive ? ' is-active' : ''}`}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setLanguage(optionLang)
                  setOpen(false)
                }}
              >
                {t(`lang.${optionLang}`)}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
