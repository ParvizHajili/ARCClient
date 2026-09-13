import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCategoryById, updateCategory } from '../../api/categories'
import { ApiError, type LanguageCode } from '../../api/types'

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'az', label: 'Azərbaycan' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
]

type NameMap = Record<LanguageCode, string>

interface SubCategoryDraft {
  key: string
  id?: number
  names: NameMap
}

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

export function CategoryEditPage() {
  const { id } = useParams()
  const categoryId = Number(id)
  const navigate = useNavigate()
  const imageInputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState('')
  const [names, setNames] = useState<NameMap>(emptyNames)
  const [image, setImage] = useState<File | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [subs, setSubs] = useState<SubCategoryDraft[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (!Number.isInteger(categoryId) || categoryId < 1) {
      setError('Kateqoriya tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getCategoryById(categoryId)
        if (!active) return
        setOrder(String(data.order))
        setNames(namesFromTranslations(data.translations))
        setOriginalImage(data.image)
        setPreview(data.image)
        setImage(null)
        setSubs(
          data.subCategories.map((sub) => ({
            key: crypto.randomUUID(),
            id: sub.id,
            names: namesFromTranslations(sub.translations),
          })),
        )
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Kateqoriya yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [categoryId])

  function onImageChange(file: File | null) {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setImage(file)
    setPreview(file ? URL.createObjectURL(file) : originalImage)
  }

  function updateName(code: LanguageCode, value: string) {
    setNames((prev) => ({ ...prev, [code]: value }))
  }

  function addSubCategory() {
    setSubs((prev) => [
      ...prev,
      { key: crypto.randomUUID(), names: emptyNames() },
    ])
  }

  function removeSubCategory(key: string) {
    setSubs((prev) => prev.filter((s) => s.key !== key))
  }

  function updateSubName(key: string, code: LanguageCode, value: string) {
    setSubs((prev) =>
      prev.map((s) =>
        s.key === key ? { ...s, names: { ...s.names, [code]: value } } : s,
      ),
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const orderNum = Number(order)
    if (!Number.isInteger(orderNum) || orderNum < 1) {
      setError('Sıra nömrəsi 1 və ya daha böyük olmalıdır.')
      return
    }
    if (!names.az.trim()) {
      setError('Azərbaycan dili adı mütləqdir.')
      return
    }
    const invalidSub = subs.findIndex((s) => !s.names.az.trim())
    if (invalidSub !== -1) {
      setError(`Alt kateqoriya #${invalidSub + 1} üçün Azərbaycan dili adı mütləqdir.`)
      return
    }

    setSubmitting(true)
    try {
      await updateCategory(categoryId, {
        image,
        order: orderNum,
        translations: namesToTranslations(names),
        subCategories: subs.map((s) => ({
          id: s.id,
          translations: namesToTranslations(s.names),
        })),
      })
      navigate('/dashboard/categories', { replace: true })
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

  return (
    <div className="dash-page">
      <header className="dash-page__header dash-page__header--row">
        <div />
        <Link to="/dashboard/categories" className="dash-btn dash-btn--ghost">
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
            <h2 className="dash-panel__title">Əsas məlumat</h2>
          </div>

          <div className="dash-form__grid">
            <div className="dash-field dash-field--span-2">
              <span className="dash-field__label">Şəkil</span>
              <div className="dash-image-edit">
                <div
                  className={`dash-upload${preview ? ' has-preview' : ''}`}
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                      ev.preventDefault()
                      fileRef.current?.click()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Şəkli dəyiş"
                >
                  <input
                    id={imageInputId}
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="dash-upload__input"
                    onChange={(ev) =>
                      onImageChange(ev.target.files?.[0] ?? null)
                    }
                  />
                  {preview ? (
                    <>
                      <img
                        src={preview}
                        alt="Kateqoriya önbaxışı"
                        className="dash-upload__preview"
                      />
                      <div className="dash-upload__overlay">
                        <span>Şəkli dəyiş</span>
                      </div>
                    </>
                  ) : (
                    <div className="dash-upload__placeholder">
                      <span className="dash-upload__icon" aria-hidden />
                      <p>Şəkil seçin</p>
                    </div>
                  )}
                </div>
                <div className="dash-image-edit__actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn--ghost"
                    onClick={() => fileRef.current?.click()}
                  >
                    Şəkli dəyiş
                  </button>
                  {image && (
                    <button
                      type="button"
                      className="dash-link-btn"
                      onClick={() => {
                        onImageChange(null)
                        if (fileRef.current) fileRef.current.value = ''
                      }}
                    >
                      Yeni şəkli ləğv et
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="dash-field">
              <label className="dash-field__label" htmlFor="category-order-edit">
                Sıra
              </label>
              <input
                id="category-order-edit"
                className="dash-input"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={order}
                onChange={(ev) => setOrder(ev.target.value)}
                required
              />
            </div>
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Tərcümələr</h2>
            <p className="dash-panel__hint">
              Azərbaycan dili mütləqdir; İngilis və Rus istəyə bağlıdır.
            </p>
          </div>

          <div className="dash-form__langs">
            {LANGUAGES.map(({ code, label }) => (
              <div key={code} className="dash-field">
                <label
                  className="dash-field__label"
                  htmlFor={`cat-edit-name-${code}`}
                >
                  {label}
                  {code === 'az' ? ' *' : ''}
                </label>
                <input
                  id={`cat-edit-name-${code}`}
                  className="dash-input"
                  type="text"
                  maxLength={200}
                  value={names[code]}
                  onChange={(ev) => updateName(code, ev.target.value)}
                  required={code === 'az'}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head dash-panel__head--row">
            <div>
              <h2 className="dash-panel__title">Alt kateqoriyalar</h2>
              <p className="dash-panel__hint">
                Siyahıdan çıxarılanlar silinəcək. AZ mütləq, EN/RU istəyə bağlı.
              </p>
            </div>
            <button
              type="button"
              className="dash-btn dash-btn--ghost"
              onClick={addSubCategory}
            >
              + Əlavə et
            </button>
          </div>

          {subs.length === 0 ? (
            <p className="dash-empty">Hələ alt kateqoriya yoxdur.</p>
          ) : (
            <div className="dash-subs">
              {subs.map((sub, index) => (
                <div key={sub.key} className="dash-sub">
                  <div className="dash-sub__top">
                    <span className="dash-sub__index">
                      {sub.id ? `ID ${sub.id}` : `#${index + 1} (yeni)`}
                    </span>
                    <button
                      type="button"
                      className="dash-link-btn dash-link-btn--danger"
                      onClick={() => removeSubCategory(sub.key)}
                    >
                      Sil
                    </button>
                  </div>
                  <div className="dash-form__langs">
                    {LANGUAGES.map(({ code, label }) => (
                      <div key={code} className="dash-field">
                        <label
                          className="dash-field__label"
                          htmlFor={`sub-edit-${sub.key}-${code}`}
                        >
                          {label}
                          {code === 'az' ? ' *' : ''}
                        </label>
                        <input
                          id={`sub-edit-${sub.key}-${code}`}
                          className="dash-input"
                          type="text"
                          maxLength={200}
                          value={sub.names[code]}
                          onChange={(ev) =>
                            updateSubName(sub.key, code, ev.target.value)
                          }
                          required={code === 'az'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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
