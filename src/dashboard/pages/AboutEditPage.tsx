import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getAboutById, updateAbout } from '../../api/about'
import { ApiError, type LanguageCode } from '../../api/types'

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'az', label: 'Azərbaycan' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
]

const IMAGE_HINT = 'Tövsiyə olunan ölçü: 1200 × 960 px (5:4)'

type TextMap = Record<LanguageCode, string>

function emptyMap(): TextMap {
  return { az: '', en: '', ru: '' }
}

function fromTranslations(
  translations: Array<{
    languageCode: string
    title: string
    description: string
  }>,
): { titles: TextMap; descriptions: TextMap } {
  const titles = emptyMap()
  const descriptions = emptyMap()
  for (const item of translations) {
    const code = item.languageCode as LanguageCode
    if (code in titles) {
      titles[code] = item.title
      descriptions[code] = item.description
    }
  }
  return { titles, descriptions }
}

function toTranslations(titles: TextMap, descriptions: TextMap) {
  return LANGUAGES.map(({ code }) => ({
    languageCode: code,
    title: titles[code].trim(),
    description: descriptions[code].trim(),
  })).filter((t) => t.title.length > 0 || t.description.length > 0)
}

export function AboutEditPage() {
  const { id } = useParams()
  const aboutId = Number(id)
  const navigate = useNavigate()
  const imageInputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [titles, setTitles] = useState<TextMap>(emptyMap)
  const [descriptions, setDescriptions] = useState<TextMap>(emptyMap)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (!Number.isInteger(aboutId) || aboutId < 1) {
      setError('Haqqımızda tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      try {
        const data = await getAboutById(aboutId)
        if (!active) return
        const mapped = fromTranslations(data.translations)
        setTitles(mapped.titles)
        setDescriptions(mapped.descriptions)
        setExistingImage(data.image)
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Haqqımızda yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [aboutId])

  function onImageChange(file: File | null) {
    if (preview) URL.revokeObjectURL(preview)
    setImage(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!titles.az.trim()) {
      setError('Azərbaycan dili başlığı mütləqdir.')
      return
    }
    if (!descriptions.az.trim()) {
      setError('Azərbaycan dili mətni mütləqdir.')
      return
    }

    setSubmitting(true)
    try {
      await updateAbout(aboutId, {
        image,
        translations: toTranslations(titles, descriptions),
      })
      navigate('/dashboard/about', {
        replace: true,
        state: { success: 'Haqqımızda uğurla yeniləndi.' },
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

  const shownImage = preview ?? existingImage

  if (loading) {
    return (
      <div className="dash-page">
        <p className="dash-empty">Yüklənir…</p>
      </div>
    )
  }

  return (
    <div className="dash-page">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <p className="dash-page__eyebrow">Haqqımızda</p>
          <h1 className="dash-page__title">Düzəliş et</h1>
        </div>
        <Link to="/dashboard/about" className="dash-btn dash-btn--ghost">
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
            <h2 className="dash-panel__title">Şəkil</h2>
            <p className="dash-panel__hint">{IMAGE_HINT}</p>
          </div>

          <div
            className={`dash-upload${shownImage ? ' has-preview' : ''}`}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault()
                fileRef.current?.click()
              }
            }}
            role="button"
            tabIndex={0}
          >
            <input
              id={imageInputId}
              ref={fileRef}
              type="file"
              accept="image/*"
              className="dash-upload__input"
              onChange={(ev) => onImageChange(ev.target.files?.[0] ?? null)}
            />
            {shownImage ? (
              <>
                <img
                  src={shownImage}
                  alt="Haqqımızda önbaxışı"
                  className="dash-upload__preview"
                />
                <div className="dash-upload__overlay">
                  <span>Şəkili dəyiş</span>
                </div>
              </>
            ) : (
              <div className="dash-upload__placeholder">
                <span className="dash-upload__icon" aria-hidden />
                <p>Şəkili seçin</p>
                <span>{IMAGE_HINT}</span>
              </div>
            )}
          </div>
          {image && (
            <button
              type="button"
              className="dash-link-btn"
              onClick={() => {
                onImageChange(null)
                if (fileRef.current) fileRef.current.value = ''
              }}
            >
              Yeni şəkili ləğv et
            </button>
          )}
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Başlıq və mətn</h2>
            <p className="dash-panel__hint">
              Azərbaycan dili mütləqdir; İngilis və Rus istəyə bağlıdır.
            </p>
          </div>
          <div className="dash-form__langs">
            {LANGUAGES.map(({ code, label }) => (
              <div key={code} className="dash-field">
                <label
                  className="dash-field__label"
                  htmlFor={`about-edit-title-${code}`}
                >
                  {label} — Başlıq{code === 'az' ? ' *' : ''}
                </label>
                <textarea
                  id={`about-edit-title-${code}`}
                  className="dash-input dash-input--textarea"
                  rows={2}
                  maxLength={300}
                  value={titles[code]}
                  onChange={(ev) =>
                    setTitles((prev) => ({ ...prev, [code]: ev.target.value }))
                  }
                  required={code === 'az'}
                />
                <label
                  className="dash-field__label"
                  htmlFor={`about-edit-desc-${code}`}
                  style={{ marginTop: '0.75rem' }}
                >
                  {label} — Mətn{code === 'az' ? ' *' : ''}
                </label>
                <textarea
                  id={`about-edit-desc-${code}`}
                  className="dash-input dash-input--textarea"
                  rows={5}
                  maxLength={4000}
                  value={descriptions[code]}
                  onChange={(ev) =>
                    setDescriptions((prev) => ({
                      ...prev,
                      [code]: ev.target.value,
                    }))
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
            {submitting ? 'Saxlanılır…' : 'Saxla'}
          </button>
        </div>
      </form>
    </div>
  )
}
