import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createColor } from '../../api/colors'
import { ApiError, type LanguageCode } from '../../api/types'

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'az', label: 'Azərbaycan' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
]

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/

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

function normalizeHexInput(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}

export function ColorCreatePage() {
  const navigate = useNavigate()
  const [names, setNames] = useState<NameMap>(emptyNames)
  const [hexCode, setHexCode] = useState('#000000')
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

    const hex = normalizeHexInput(hexCode).toUpperCase()
    if (!HEX_PATTERN.test(hex)) {
      setError('Rəng kodu #RRGGBB formatında olmalıdır (məs: #FF5733).')
      return
    }

    setSubmitting(true)
    try {
      const created = await createColor({
        hexCode: hex,
        translations: namesToTranslations(names),
      })
      const title =
        created.translations.find((t) => t.languageCode === 'az')?.name ??
        'Rəng'
      navigate('/dashboard/colors', {
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

  const pickerValue = HEX_PATTERN.test(hexCode) ? hexCode : '#000000'

  return (
    <div className="dash-page">
      <header className="dash-page__header dash-page__header--row">
        <div />
        <Link to="/dashboard/colors" className="dash-btn dash-btn--ghost">
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
            <h2 className="dash-panel__title">Rəng seçimi</h2>
            <p className="dash-panel__hint">
              Paletdən seçin və ya #RRGGBB kodunu yazın.
            </p>
          </div>
          <div className="dash-color-picker">
            <label className="dash-color-picker__swatch-wrap" htmlFor="color-picker">
              <span className="visually-hidden">Rəng paleti</span>
              <input
                id="color-picker"
                className="dash-color-picker__input"
                type="color"
                value={pickerValue}
                onChange={(ev) => setHexCode(ev.target.value.toUpperCase())}
              />
            </label>
            <div className="dash-field dash-color-picker__hex">
              <label className="dash-field__label" htmlFor="color-hex">
                Rəng kodu *
              </label>
              <input
                id="color-hex"
                className="dash-input"
                type="text"
                maxLength={7}
                value={hexCode}
                onChange={(ev) => setHexCode(normalizeHexInput(ev.target.value))}
                placeholder="#FF5733"
                required
              />
            </div>
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Rəng adı</h2>
            <p className="dash-panel__hint">
              Azərbaycan dili mütləqdir; İngilis və Rus istəyə bağlıdır.
            </p>
          </div>
          <div className="dash-form__langs">
            {LANGUAGES.map(({ code, label }) => (
              <div key={code} className="dash-field">
                <label
                  className="dash-field__label"
                  htmlFor={`color-name-${code}`}
                >
                  {label}
                  {code === 'az' ? ' *' : ''}
                </label>
                <input
                  id={`color-name-${code}`}
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
            {submitting ? 'Yaradılır…' : 'Rəngi yarat'}
          </button>
        </div>
      </form>
    </div>
  )
}
