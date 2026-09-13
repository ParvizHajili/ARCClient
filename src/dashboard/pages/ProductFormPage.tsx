import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getBrands, type BrandDetail } from '../../api/brands'
import { getCategories } from '../../api/categories'
import { getColors, type ColorDetail } from '../../api/colors'
import { getManufacturerCountries } from '../../api/manufacturerCountries'
import {
  createProduct,
  getProductById,
  updateProduct,
  type ProductDetail,
} from '../../api/products'
import { ApiError, type CategoryDetail, type LanguageCode } from '../../api/types'
import type { ManufacturerCountryDetail } from '../../api/manufacturerCountries'

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'az', label: 'Azərbaycan' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
]

type LangFields = Record<LanguageCode, { name: string; description: string }>

function emptyLangs(): LangFields {
  return {
    az: { name: '', description: '' },
    en: { name: '', description: '' },
    ru: { name: '', description: '' },
  }
}

function azName(
  translations: Array<{ languageCode: string; name: string }>,
) {
  return (
    translations.find((t) => t.languageCode === 'az')?.name ??
    translations[0]?.name ??
    '—'
  )
}

interface ExistingImage {
  id: number
  imageUrl: string
}

interface ProductFormPageProps {
  mode: 'create' | 'edit'
  productId?: number
}

export function ProductFormPage({ mode, productId }: ProductFormPageProps) {
  const navigate = useNavigate()
  const [bootLoading, setBootLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const [categories, setCategories] = useState<CategoryDetail[]>([])
  const [brands, setBrands] = useState<BrandDetail[]>([])
  const [countries, setCountries] = useState<ManufacturerCountryDetail[]>([])
  const [colors, setColors] = useState<ColorDetail[]>([])

  const [code, setCode] = useState('')
  const [size, setSize] = useState('')
  const [diameter, setDiameter] = useState('')
  const [powerAmperes, setPowerAmperes] = useState('')
  const [hasWarranty, setHasWarranty] = useState(false)
  const [isMadeToOrder, setIsMadeToOrder] = useState(false)
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [subCategoryId, setSubCategoryId] = useState<number | ''>('')
  const [brandIds, setBrandIds] = useState<number[]>([])
  const [countryIds, setCountryIds] = useState<number[]>([])
  const [colorIds, setColorIds] = useState<number[]>([])
  const [langs, setLangs] = useState<LangFields>(emptyLangs)
  const [newFilesByColor, setNewFilesByColor] = useState<Record<number, File[]>>(
    {},
  )
  const [existingByColor, setExistingByColor] = useState<
    Record<number, ExistingImage[]>
  >({})

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId],
  )

  useEffect(() => {
    let active = true
    void (async () => {
      setBootLoading(true)
      setError(null)
      try {
        const [catRes, brandRes, countryRes, colorRes] = await Promise.all([
          getCategories({ page: 1, pageSize: 100, sortBy: 'az' }),
          getBrands({ page: 1, pageSize: 100, sortBy: 'az' }),
          getManufacturerCountries({ page: 1, pageSize: 100, sortBy: 'az' }),
          getColors({ page: 1, pageSize: 100, sortBy: 'az' }),
        ])
        if (!active) return
        setCategories(catRes.items)
        setBrands(brandRes.items)
        setCountries(countryRes.items)
        setColors(colorRes.items)

        if (mode === 'edit' && productId) {
          const product = await getProductById(productId)
          if (!active) return
          applyProduct(product)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Məlumatlar yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setBootLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [mode, productId])

  function applyProduct(product: ProductDetail) {
    setCode(product.code)
    setSize(product.size)
    setDiameter(product.diameter)
    setPowerAmperes(String(product.powerAmperes))
    setHasWarranty(product.hasWarranty)
    setIsMadeToOrder(product.isMadeToOrder)
    setCategoryId(product.categoryId)
    setSubCategoryId(product.subCategoryId ?? '')
    setBrandIds(product.brands.map((b) => b.id))
    setCountryIds(product.manufacturerCountries.map((c) => c.id))
    setColorIds(product.colors.map((c) => c.colorId))

    const nextLangs = emptyLangs()
    for (const t of product.translations) {
      const code = t.languageCode as LanguageCode
      if (code in nextLangs) {
        nextLangs[code] = { name: t.name, description: t.description }
      }
    }
    setLangs(nextLangs)

    const existing: Record<number, ExistingImage[]> = {}
    for (const color of product.colors) {
      existing[color.colorId] = color.images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
      }))
    }
    setExistingByColor(existing)
    setNewFilesByColor({})
  }

  function toggleId(
    list: number[],
    id: number,
    setter: (next: number[]) => void,
  ) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  function toggleColor(id: number) {
    if (colorIds.includes(id)) {
      setColorIds((prev) => prev.filter((x) => x !== id))
      setNewFilesByColor((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setExistingByColor((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } else {
      setColorIds((prev) => [...prev, id])
    }
  }

  function removeExistingImage(colorId: number, imageId: number) {
    setExistingByColor((prev) => ({
      ...prev,
      [colorId]: (prev[colorId] ?? []).filter((img) => img.id !== imageId),
    }))
  }

  function onFilesSelected(colorId: number, fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList)
    setNewFilesByColor((prev) => ({
      ...prev,
      [colorId]: [...(prev[colorId] ?? []), ...files],
    }))
  }

  function removeNewFile(colorId: number, index: number) {
    setNewFilesByColor((prev) => ({
      ...prev,
      [colorId]: (prev[colorId] ?? []).filter((_, i) => i !== index),
    }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!langs.az.name.trim() || !langs.az.description.trim()) {
      setError('Azərbaycan dili adı və təsviri mütləqdir.')
      return
    }
    if (!categoryId) {
      setError('Kateqoriya seçilməlidir.')
      return
    }
    if (brandIds.length === 0) {
      setError('Ən azı bir marka seçilməlidir.')
      return
    }
    if (countryIds.length === 0) {
      setError('Ən azı bir istehsalçı ölkə seçilməlidir.')
      return
    }
    if (colorIds.length === 0) {
      setError('Ən azı bir rəng seçilməlidir.')
      return
    }

    const power = Number(powerAmperes.replace(',', '.'))
    if (!Number.isFinite(power) || power <= 0) {
      setError('Güc (amper) müsbət rəqəm olmalıdır.')
      return
    }

    for (const colorId of colorIds) {
      const existingCount = (existingByColor[colorId] ?? []).length
      const newCount = (newFilesByColor[colorId] ?? []).length
      if (existingCount + newCount < 1) {
        setError('Hər seçilmiş rəng üçün ən azı bir şəkil lazımdır.')
        return
      }
    }

    const images: File[] = []
    const imageColorIds: number[] = []
    for (const colorId of colorIds) {
      for (const file of newFilesByColor[colorId] ?? []) {
        images.push(file)
        imageColorIds.push(colorId)
      }
    }

    const translations = LANGUAGES.map(({ code }) => ({
      languageCode: code,
      name: langs[code].name.trim(),
      description: langs[code].description.trim(),
    })).filter((t) => t.name.length > 0)

    const keepImageIds = colorIds.flatMap((colorId) =>
      (existingByColor[colorId] ?? []).map((img) => img.id),
    )

    setSubmitting(true)
    try {
      const payload = {
        code: code.trim(),
        size: size.trim(),
        diameter: diameter.trim(),
        hasWarranty,
        isMadeToOrder,
        powerAmperes: power,
        categoryId: Number(categoryId),
        subCategoryId: subCategoryId === '' ? null : Number(subCategoryId),
        translations,
        brandIds,
        manufacturerCountryIds: countryIds,
        colorIds,
        images,
        imageColorIds,
        keepImageIds,
      }

      if (mode === 'create') {
        const created = await createProduct(payload)
        const title =
          created.translations.find((t) => t.languageCode === 'az')?.name ??
          'Məhsul'
        navigate('/dashboard/products', {
          replace: true,
          state: { success: `“${title}” uğurla yaradıldı.` },
        })
      } else if (productId) {
        await updateProduct(productId, payload)
        navigate('/dashboard/products', { replace: true })
      }
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

  if (bootLoading) {
    return (
      <div className="dash-page">
        <p className="dash-empty">Yüklənir…</p>
      </div>
    )
  }

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">
            {mode === 'create' ? 'Yeni məhsul' : 'Məhsulu düzəliş et'}
          </h1>
        </div>
        <Link to="/dashboard/products" className="dash-btn dash-btn--ghost">
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
            <h2 className="dash-panel__title">Kateqoriya</h2>
          </div>
          <div className="dash-form__grid">
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="product-category">
                Kateqoriya *
              </label>
              <select
                id="product-category"
                className="dash-input dash-input--select"
                value={categoryId}
                onChange={(ev) => {
                  const next = ev.target.value ? Number(ev.target.value) : ''
                  setCategoryId(next)
                  setSubCategoryId('')
                }}
                required
              >
                <option value="">Seçin…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {azName(c.translations)}
                  </option>
                ))}
              </select>
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="product-sub">
                Alt kateqoriya
              </label>
              <select
                id="product-sub"
                className="dash-input dash-input--select"
                value={subCategoryId}
                onChange={(ev) =>
                  setSubCategoryId(
                    ev.target.value ? Number(ev.target.value) : '',
                  )
                }
                disabled={!selectedCategory}
              >
                <option value="">Yoxdur</option>
                {(selectedCategory?.subCategories ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {azName(s.translations)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Əsas məlumat</h2>
          </div>
          <div className="dash-form__grid dash-form__grid--4">
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="product-code">
                Kod *
              </label>
              <input
                id="product-code"
                className="dash-input"
                value={code}
                onChange={(ev) => setCode(ev.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="product-size">
                Ölçü *
              </label>
              <input
                id="product-size"
                className="dash-input"
                value={size}
                onChange={(ev) => setSize(ev.target.value)}
                required
                maxLength={200}
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="product-diameter">
                Diametr *
              </label>
              <input
                id="product-diameter"
                className="dash-input"
                value={diameter}
                onChange={(ev) => setDiameter(ev.target.value)}
                required
                maxLength={200}
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="product-power">
                Güc (amper) *
              </label>
              <input
                id="product-power"
                className="dash-input"
                type="number"
                min="0.001"
                step="any"
                value={powerAmperes}
                onChange={(ev) => setPowerAmperes(ev.target.value)}
                required
              />
            </div>
          </div>
          <div className="dash-check-row">
            <label className="dash-check">
              <input
                type="checkbox"
                checked={hasWarranty}
                onChange={(ev) => setHasWarranty(ev.target.checked)}
              />
              <span>Qarantiya</span>
            </label>
            <label className="dash-check">
              <input
                type="checkbox"
                checked={isMadeToOrder}
                onChange={(ev) => setIsMadeToOrder(ev.target.checked)}
              />
              <span>Sifarişlə</span>
            </label>
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Markalar *</h2>
            <p className="dash-panel__hint">Yalnız Azərbaycan adları göstərilir.</p>
          </div>
          <div className="dash-check-grid">
            {brands.map((b) => (
              <label key={b.id} className="dash-check">
                <input
                  type="checkbox"
                  checked={brandIds.includes(b.id)}
                  onChange={() => toggleId(brandIds, b.id, setBrandIds)}
                />
                <span>{azName(b.translations)}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">İstehsalçı ölkələr *</h2>
            <p className="dash-panel__hint">Yalnız Azərbaycan adları göstərilir.</p>
          </div>
          <div className="dash-check-grid">
            {countries.map((c) => (
              <label key={c.id} className="dash-check">
                <input
                  type="checkbox"
                  checked={countryIds.includes(c.id)}
                  onChange={() => toggleId(countryIds, c.id, setCountryIds)}
                />
                <span>{azName(c.translations)}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Rənglər və şəkillər *</h2>
            <p className="dash-panel__hint">
              Rəng seçin və hər rəng üçün şəkil yükləyin.
            </p>
          </div>
          <div className="dash-color-options">
            {colors.map((c) => {
              const selected = colorIds.includes(c.id)
              return (
                <div key={c.id} className="dash-color-option">
                  <label className="dash-check">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleColor(c.id)}
                    />
                    <span
                      className="dash-color-swatch"
                      style={{ backgroundColor: c.hexCode }}
                      aria-hidden
                    />
                    <span>{azName(c.translations)}</span>
                  </label>

                  {selected && (
                    <div className="dash-color-option__images">
                      <div className="dash-image-thumbs">
                        {(existingByColor[c.id] ?? []).map((img) => (
                          <div key={img.id} className="dash-image-thumb">
                            <img src={img.imageUrl} alt="" />
                            <button
                              type="button"
                              className="dash-image-thumb__remove"
                              onClick={() => removeExistingImage(c.id, img.id)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {(newFilesByColor[c.id] ?? []).map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="dash-image-thumb"
                          >
                            <img src={URL.createObjectURL(file)} alt="" />
                            <button
                              type="button"
                              className="dash-image-thumb__remove"
                              onClick={() => removeNewFile(c.id, index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <label className="dash-btn dash-btn--ghost dash-file-btn">
                        Şəkil əlavə et
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={(ev) => {
                            onFilesSelected(c.id, ev.target.files)
                            ev.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )
            })}
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
              <div key={code} className="dash-lang-block">
                <h3 className="dash-lang-block__title">
                  {label}
                  {code === 'az' ? ' *' : ''}
                </h3>
                <div className="dash-field">
                  <label
                    className="dash-field__label"
                    htmlFor={`product-name-${code}`}
                  >
                    Ad
                  </label>
                  <input
                    id={`product-name-${code}`}
                    className="dash-input"
                    value={langs[code].name}
                    onChange={(ev) =>
                      setLangs((prev) => ({
                        ...prev,
                        [code]: { ...prev[code], name: ev.target.value },
                      }))
                    }
                    required={code === 'az'}
                    maxLength={300}
                  />
                </div>
                <div className="dash-field">
                  <label
                    className="dash-field__label"
                    htmlFor={`product-desc-${code}`}
                  >
                    Təsvir
                  </label>
                  <textarea
                    id={`product-desc-${code}`}
                    className="dash-input dash-input--textarea"
                    rows={4}
                    value={langs[code].description}
                    onChange={(ev) =>
                      setLangs((prev) => ({
                        ...prev,
                        [code]: {
                          ...prev[code],
                          description: ev.target.value,
                        },
                      }))
                    }
                    required={code === 'az'}
                    maxLength={4000}
                  />
                </div>
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
            {submitting
              ? 'Saxlanılır…'
              : mode === 'create'
                ? 'Məhsulu yarat'
                : 'Dəyişiklikləri saxla'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function ProductCreatePage() {
  return <ProductFormPage mode="create" />
}

export function ProductEditPage() {
  const { id } = useParams()
  const productId = Number(id)
  if (!Number.isInteger(productId) || productId < 1) {
    return (
      <div className="dash-page">
        <p className="dash-empty">Məhsul tapılmadı.</p>
      </div>
    )
  }
  return <ProductFormPage mode="edit" productId={productId} />
}
