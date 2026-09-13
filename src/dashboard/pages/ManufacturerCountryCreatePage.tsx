import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createManufacturerCountry } from '../../api/manufacturerCountries'
import { ApiError, type LanguageCode } from '../../api/types'

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'az', label: 'Azərbaycan' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
]

type NameMap = Record<LanguageCode, string>

function emptyNames(): NameMap {
  return { az: '', en: '', ru: '' }
}

function namesToTranslations(names: NameMap) {
  return LANGUAGES.map(({ code }) => ({
    languageCode: code,
    name: names[code].trim(),
  })).filter((t) => t.name.length > 0)
}

export function ManufacturerCountryCreatePage() {
  const navigate = useNavigate()
  const [names, setNames] = useState<NameMap>(emptyNames)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!names.az.trim()) {
      setError('Azərbaycan dili adı mütləqdir.')
      return
    }

    setSubmitting(true)
    try {
      const created = await createManufacturerCountry({
        translations: namesToTranslations(names),
      })
      const title =
        created.translations.find((t) => t.languageCode === 'az')?.name ??
        'Ölkə'
      navigate('/dashboard/manufacturer-countries', {
        replace: true,
        state: { success: `“${title}” uğurla yaradıldı.` },
      })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.errors)
      } else {
        setError('Gözlənilməz xəta baş verdi. Serverin işlədiyini yoxlayın.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dash-page">
      <header className="dash-page__header dash-page__header--row">
        <div />
        <Link
          to="/dashboard/manufacturer-countries"
          className="dash-btn dash-btn--ghost"
        >
          Siyahıya qayıt
        </Link>
      </header>

      <form className="dash-form" onSubmit={onSubmit} noValidate>
        {error && (
          <div className="dash-alert dash-alert--error" role="alert">
            {error}
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="dash-alert__list">
                {Object.entries(fieldErrors).flatMap(([key, messages]) =>
                  messages.map((msg) => (
                    <li key={`${key}-${msg}`}>
                      <span>{key}:</span> {msg}
                    </li>
                  )),
                )}
              </ul>
            )}
          </div>
        )}

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Ölkə adı</h2>
            <p className="dash-panel__hint">
              Azərbaycan dili mütləqdir; İngilis və Rus istəyə bağlıdır.
            </p>
          </div>
          <div className="dash-form__langs">
            {LANGUAGES.map(({ code, label }) => (
              <div key={code} className="dash-field">
                <label className="dash-field__label" htmlFor={`mc-name-${code}`}>
                  {label}
                  {code === 'az' ? ' *' : ''}
                </label>
                <input
                  id={`mc-name-${code}`}
                  className="dash-input"
                  type="text"
                  maxLength={200}
                  value={names[code]}
                  onChange={(ev) =>
                    setNames((prev) => ({ ...prev, [code]: ev.target.value }))
                  }
                  required={code === 'az'}
                />
              </div>
            ))}
          </div>
        </section>

        <div className="dash-form__actions">
          <button
            type="submit"
            className="dash-btn dash-btn--primary"
            disabled={submitting}
          >
            {submitting ? 'Yaradılır…' : 'Ölkəni yarat'}
          </button>
        </div>
      </form>
    </div>
  )
}
