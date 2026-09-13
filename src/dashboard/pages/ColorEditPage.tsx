import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getColorById, updateColor } from '../../api/colors'
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

function namesFromTranslations(
  translations: Array<{ languageCode: string; name: string }>,
): NameMap {
  const names = emptyNames()
  for (const item of translations) {
    const code = item.languageCode as LanguageCode
    if (code in names) names[code] = item.name
  }
  return names
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

export function ColorEditPage() {
  const { id } = useParams()
  const colorId = Number(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [names, setNames] = useState<NameMap>(emptyNames)
  const [hexCode, setHexCode] = useState('#000000')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (!Number.isInteger(colorId) || colorId < 1) {
      setError('Rəng tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      try {
        const data = await getColorById(colorId)
        if (active) {
          setNames(namesFromTranslations(data.translations))
          setHexCode(data.hexCode)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Rəng yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [colorId])

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
      await updateColor(colorId, {
        hexCode: hex,
        translations: namesToTranslations(names),
      })
      navigate('/dashboard/colors', { replace: true })
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

  if (loading) {
    return (
      <div className="dash-page">
        <p className="dash-empty">Yüklənir…</p>
      </div>
    )
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
            <label
              className="dash-color-picker__swatch-wrap"
              htmlFor="color-edit-picker"
            >
              <span className="visually-hidden">Rəng paleti</span>
              <input
                id="color-edit-picker"
                className="dash-color-picker__input"
                type="color"
                value={pickerValue}
                onChange={(ev) => setHexCode(ev.target.value.toUpperCase())}
              />
            </label>
            <div className="dash-field dash-color-picker__hex">
              <label className="dash-field__label" htmlFor="color-edit-hex">
                Rəng kodu *
              </label>
              <input
                id="color-edit-hex"
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
                  htmlFor={`color-edit-name-${code}`}
                >
                  {label}
                  {code === 'az' ? ' *' : ''}
                </label>
                <input
                  id={`color-edit-name-${code}`}
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
            {submitting ? 'Saxlanılır…' : 'Dəyişiklikləri saxla'}
          </button>
        </div>
      </form>
    </div>
  )
}
