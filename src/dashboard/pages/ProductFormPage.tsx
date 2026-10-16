import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteBrand, getBrands, type BrandDetail } from '../../api/brands'
import { deleteSize, getSizes, type SizeDetail } from '../../api/sizes'
import { deleteDiameter, getDiameters, type DiameterDetail } from '../../api/diameters'
import { deletePower, getPowers, type PowerDetail } from '../../api/powers'
import { deleteCategory, getCategories, updateCategory } from '../../api/categories'
import { deleteColor, getColors, type ColorDetail } from '../../api/colors'
import {
  deleteManufacturerCountry,
  getManufacturerCountries,
} from '../../api/manufacturerCountries'
import {
  createProduct,
  getProductById,
  updateProduct,
  type ProductDetail,
} from '../../api/products'
import { ApiError, type CategoryDetail, type LanguageCode } from '../../api/types'
import type { ManufacturerCountryDetail } from '../../api/manufacturerCountries'
import { useAuth } from '../../auth/AuthContext'
import { ConfirmModal } from '../components/ConfirmModal'
import { LookupActions, LookupSection } from '../components/LookupActions'
import {
  ProductCatalogEditors,
  type CatalogEditorState,
  type CatalogSave,
} from '../components/ProductCatalogEditors'

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

function byAzName<
  T extends { translations: Array<{ languageCode: string; name: string }> },
>(items: T[]) {
  return [...items].sort((a, b) =>
    azName(a.translations).localeCompare(azName(b.translations), 'az'),
  )
}

function byValue<T extends { value: number }>(items: T[]) {
  return [...items].sort((a, b) => a.value - b.value)
}

function byCategoryOrder(items: CategoryDetail[]) {
  return [...items].sort(
    (a, b) =>
      a.order - b.order ||
      azName(a.translations).localeCompare(azName(b.translations), 'az'),
  )
}

function upsertById<T extends { id: number }>(
  items: T[],
  item: T,
  mode: 'create' | 'edit',
) {
  return mode === 'create'
    ? [...items, item]
    : items.map((current) => (current.id === item.id ? item : current))
}

type PendingCatalogDelete =
  | { kind: 'brand'; id: number; title: string }
  | { kind: 'size'; id: number; title: string }
  | { kind: 'diameter'; id: number; title: string }
  | { kind: 'power'; id: number; title: string }
  | { kind: 'country'; id: number; title: string }
  | { kind: 'color'; id: number; title: string }
  | { kind: 'category'; id: number; title: string }
  | {
      kind: 'subcategory'
      categoryId: number
      subId: number
      title: string
    }

function deleteMessage(item: PendingCatalogDelete | null) {
  if (!item) return ''
  switch (item.kind) {
    case 'brand':
      return `“${item.title}” markası silinəcək.`
    case 'size':
      return `“${item.title}” ölçüsü silinəcək.`
    case 'diameter':
      return `“${item.title}” diametri silinəcək.`
    case 'power':
      return `“${item.title}” gücü silinəcək.`
    case 'country':
      return `“${item.title}” ölkəsi silinəcək.`
    case 'color':
      return `“${item.title}” rəngi silinəcək.`
    case 'category':
      return `“${item.title}” kateqoriyası silinəcək.`
    case 'subcategory':
      return `“${item.title}” alt kateqoriyası silinəcək.`
  }
}

function selectCreated(
  id: number,
  setter: Dispatch<SetStateAction<number[]>>,
) {
  setter((prev) => (prev.includes(id) ? prev : [...prev, id]))
}

interface ExistingImage {
  id: number
  imageUrl: string
}

interface ExistingVideo {
  id: number
  videoUrl: string
}

const MAX_VIDEO_BYTES = 25 * 1024 * 1024

interface ProductFormPageProps {
  mode: 'create' | 'edit'
  productId?: number
}

export function ProductFormPage({ mode, productId }: ProductFormPageProps) {
  const navigate = useNavigate()
  const { can } = useAuth()
  const [bootLoading, setBootLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const [categories, setCategories] = useState<CategoryDetail[]>([])
  const [brands, setBrands] = useState<BrandDetail[]>([])
  const [sizes, setSizes] = useState<SizeDetail[]>([])
  const [diameters, setDiameters] = useState<DiameterDetail[]>([])
  const [powers, setPowers] = useState<PowerDetail[]>([])
  const [countries, setCountries] = useState<ManufacturerCountryDetail[]>([])
  const [colors, setColors] = useState<ColorDetail[]>([])

  const [code, setCode] = useState('')
  const [hasWarranty, setHasWarranty] = useState(false)
  const [isMadeToOrder, setIsMadeToOrder] = useState(false)
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [subCategoryId, setSubCategoryId] = useState<number | ''>('')
  const [brandIds, setBrandIds] = useState<number[]>([])
  const [sizeIds, setSizeIds] = useState<number[]>([])
  const [diameterIds, setDiameterIds] = useState<number[]>([])
  const [powerIds, setPowerIds] = useState<number[]>([])
  const [countryIds, setCountryIds] = useState<number[]>([])
  const [colorIds, setColorIds] = useState<number[]>([])
  const [langs, setLangs] = useState<LangFields>(emptyLangs)
  const [newFilesByColor, setNewFilesByColor] = useState<Record<number, File[]>>(
    {},
  )
  const [existingByColor, setExistingByColor] = useState<
    Record<number, ExistingImage[]>
  >({})
  const [existingProductImages, setExistingProductImages] = useState<
    ExistingImage[]
  >([])
  const [newProductFiles, setNewProductFiles] = useState<File[]>([])
  const [existingVideo, setExistingVideo] = useState<ExistingVideo | null>(null)
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [editor, setEditor] = useState<CatalogEditorState | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingCatalogDelete | null>(
    null,
  )
  const [deletingCatalog, setDeletingCatalog] = useState(false)

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
        const [catRes, brandRes, sizeRes, diameterRes, powerRes, countryRes, colorRes] =
          await Promise.all([
          getCategories({ page: 1, pageSize: 100, sortBy: 'az' }),
          getBrands({ page: 1, pageSize: 100, sortBy: 'az' }),
          getSizes({ page: 1, pageSize: 100, sortBy: 'value' }),
          getDiameters({ page: 1, pageSize: 100, sortBy: 'value' }),
          getPowers({ page: 1, pageSize: 100, sortBy: 'value' }),
          getManufacturerCountries({ page: 1, pageSize: 100, sortBy: 'az' }),
          getColors({ page: 1, pageSize: 100, sortBy: 'az' }),
        ])
        if (!active) return
        setCategories(catRes.items)
        setBrands(brandRes.items)
        setSizes(sizeRes.items)
        setDiameters(diameterRes.items)
        setPowers(powerRes.items)
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
    setHasWarranty(product.hasWarranty)
    setIsMadeToOrder(product.isMadeToOrder)
    setCategoryId(product.categoryId)
    setSubCategoryId(product.subCategoryId ?? '')
    setBrandIds(product.brands.map((b) => b.id))
    setSizeIds(product.sizes.map((s) => s.id))
    setDiameterIds(product.diameters.map((d) => d.id))
    setPowerIds(product.powers.map((p) => p.id))
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
    setExistingProductImages(
      product.images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
      })),
    )
    setNewProductFiles([])
    const firstVideo = [...(product.videos ?? [])].sort((a, b) => a.order - b.order)[0]
    setExistingVideo(
      firstVideo ? { id: firstVideo.id, videoUrl: firstVideo.videoUrl } : null,
    )
    setNewVideoFile(null)
  }

  useEffect(() => {
    if (!newVideoFile) {
      setVideoPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(newVideoFile)
    setVideoPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [newVideoFile])

  function pickVideo(file: File | null) {
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setError('Yalnız video fayl yüklənə bilər.')
      return
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError('Video 25 MB-dan böyük ola bilməz.')
      return
    }
    setError(null)
    setExistingVideo(null)
    setNewVideoFile(file)
  }

  function toggleId(
    list: number[],
    id: number,
    setter: (next: number[]) => void,
  ) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  function unselectColor(id: number) {
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
  }

  function toggleColor(id: number) {
    if (colorIds.includes(id)) {
      unselectColor(id)
    } else {
      setColorIds((prev) => [...prev, id])
    }
  }

  function handleCatalogSaved(result: CatalogSave) {
    setEditor(null)
    switch (result.type) {
      case 'brand':
        setBrands((prev) => byAzName(upsertById(prev, result.item, result.mode)))
        if (result.mode === 'create') selectCreated(result.item.id, setBrandIds)
        break
      case 'country':
        setCountries((prev) =>
          byAzName(upsertById(prev, result.item, result.mode)),
        )
        if (result.mode === 'create') selectCreated(result.item.id, setCountryIds)
        break
      case 'size':
        setSizes((prev) => byValue(upsertById(prev, result.item, result.mode)))
        if (result.mode === 'create') selectCreated(result.item.id, setSizeIds)
        break
      case 'diameter':
        setDiameters((prev) =>
          byValue(upsertById(prev, result.item, result.mode)),
        )
        if (result.mode === 'create') selectCreated(result.item.id, setDiameterIds)
        break
      case 'power':
        setPowers((prev) => byValue(upsertById(prev, result.item, result.mode)))
        if (result.mode === 'create') selectCreated(result.item.id, setPowerIds)
        break
      case 'color':
        setColors((prev) => byAzName(upsertById(prev, result.item, result.mode)))
        if (result.mode === 'create') selectCreated(result.item.id, setColorIds)
        break
      case 'category':
        setCategories((prev) =>
          byCategoryOrder(upsertById(prev, result.item, result.mode)),
        )
        if (result.mode === 'create') {
          setCategoryId(result.item.id)
          setSubCategoryId('')
          break
        }
        if (categoryId === result.item.id) {
          if (result.selectSubId) {
            setSubCategoryId(result.selectSubId)
          } else {
            setSubCategoryId((prev) =>
              result.item.subCategories.some((sub) => sub.id === prev)
                ? prev
                : '',
            )
          }
        }
        break
    }
  }

  async function confirmCatalogDelete() {
    const target = pendingDelete
    if (!target) return
    setDeletingCatalog(true)
    setError(null)
    try {
      switch (target.kind) {
        case 'brand':
          await deleteBrand(target.id)
          setBrands((prev) => prev.filter((item) => item.id !== target.id))
          setBrandIds((prev) => prev.filter((id) => id !== target.id))
          break
        case 'size':
          await deleteSize(target.id)
          setSizes((prev) => prev.filter((item) => item.id !== target.id))
          setSizeIds((prev) => prev.filter((id) => id !== target.id))
          break
        case 'diameter':
          await deleteDiameter(target.id)
          setDiameters((prev) => prev.filter((item) => item.id !== target.id))
          setDiameterIds((prev) => prev.filter((id) => id !== target.id))
          break
        case 'power':
          await deletePower(target.id)
          setPowers((prev) => prev.filter((item) => item.id !== target.id))
          setPowerIds((prev) => prev.filter((id) => id !== target.id))
          break
        case 'country':
          await deleteManufacturerCountry(target.id)
          setCountries((prev) => prev.filter((item) => item.id !== target.id))
          setCountryIds((prev) => prev.filter((id) => id !== target.id))
          break
        case 'color':
          await deleteColor(target.id)
          setColors((prev) => prev.filter((item) => item.id !== target.id))
          unselectColor(target.id)
          break
        case 'category':
          await deleteCategory(target.id)
          setCategories((prev) => prev.filter((item) => item.id !== target.id))
          if (categoryId === target.id) {
            setCategoryId('')
            setSubCategoryId('')
          }
          break
        case 'subcategory': {
          const category = categories.find((item) => item.id === target.categoryId)
          if (!category) break
          const updated = await updateCategory(category.id, {
            order: category.order,
            translations: category.translations,
            subCategories: category.subCategories
              .filter((sub) => sub.id !== target.subId)
              .map((sub) => ({
                id: sub.id,
                translations: sub.translations,
              })),
          })
          setCategories((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
          )
          if (subCategoryId === target.subId) setSubCategoryId('')
          break
        }
      }
      setPendingDelete(null)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Silinərkən xəta baş verdi.',
      )
      setPendingDelete(null)
    } finally {
      setDeletingCatalog(false)
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
    if (sizeIds.length === 0) {
      setError('Ən azı bir ölçü seçilməlidir.')
      return
    }
    if (diameterIds.length === 0) {
      setError('Ən azı bir diametr seçilməlidir.')
      return
    }
    if (powerIds.length === 0) {
      setError('Ən azı bir güc seçilməlidir.')
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
    if (existingProductImages.length + newProductFiles.length < 1) {
      setError('Ən azı bir məhsul şəkli lazımdır.')
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
        hasWarranty,
        isMadeToOrder,
        categoryId: Number(categoryId),
        subCategoryId: subCategoryId === '' ? null : Number(subCategoryId),
        translations,
        brandIds,
        sizeIds,
        diameterIds,
        powerIds,
        manufacturerCountryIds: countryIds,
        colorIds,
        images,
        imageColorIds,
        keepImageIds,
        productImages: newProductFiles,
        keepProductImageIds: existingProductImages.map((img) => img.id),
        videos: newVideoFile ? [newVideoFile] : [],
        keepVideoIds: existingVideo ? [existingVideo.id] : [],
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

  const shownVideoUrl = videoPreviewUrl ?? existingVideo?.videoUrl ?? null

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
          <div className="dash-form__grid dash-form__grid--2">
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="product-category">
                Kateqoriya *
              </label>
              <div className="dash-lookup-select">
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
                <LookupActions
                  canUpdate={can('Categories.Update')}
                  canDelete={can('Categories.Delete')}
                  updateDisabled={categoryId === ''}
                  deleteDisabled={categoryId === ''}
                  onEdit={() => {
                    const category = categories.find((c) => c.id === categoryId)
                    if (!category) return
                    setEditor({ type: 'category', mode: 'edit', item: category })
                  }}
                  onDelete={() => {
                    const category = categories.find((c) => c.id === categoryId)
                    if (!category) return
                    setPendingDelete({
                      kind: 'category',
                      id: category.id,
                      title: azName(category.translations),
                    })
                  }}
                />
                {can('Categories.Create') && (
                  <button
                    type="button"
                    className="dash-btn dash-btn--ghost dash-btn--compact"
                    onClick={() => setEditor({ type: 'category', mode: 'create' })}
                  >
                    Yeni
                  </button>
                )}
              </div>
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="product-sub">
                Alt kateqoriya
              </label>
              <div className="dash-lookup-select">
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
                <LookupActions
                  canUpdate={can('Categories.Update')}
                  canDelete={can('Categories.Update')}
                  updateDisabled={!selectedCategory || subCategoryId === ''}
                  deleteDisabled={!selectedCategory || subCategoryId === ''}
                  onEdit={() => {
                    if (!selectedCategory || subCategoryId === '') return
                    setEditor({
                      type: 'subcategory',
                      mode: 'edit',
                      category: selectedCategory,
                      subId: Number(subCategoryId),
                    })
                  }}
                  onDelete={() => {
                    if (!selectedCategory || subCategoryId === '') return
                    const sub = selectedCategory.subCategories.find(
                      (item) => item.id === subCategoryId,
                    )
                    if (!sub) return
                    setPendingDelete({
                      kind: 'subcategory',
                      categoryId: selectedCategory.id,
                      subId: sub.id,
                      title: azName(sub.translations),
                    })
                  }}
                />
                {can('Categories.Update') && (
                  <button
                    type="button"
                    className="dash-btn dash-btn--ghost dash-btn--compact"
                    disabled={!selectedCategory}
                    onClick={() => {
                      if (!selectedCategory) return
                      setEditor({
                        type: 'subcategory',
                        mode: 'create',
                        category: selectedCategory,
                      })
                    }}
                  >
                    Yeni
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Əsas məlumat</h2>
          </div>
          <div className="dash-form__grid">
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

        <LookupSection
          title="Markalar *"
          hint="Yalnız Azərbaycan adları göstərilir."
          canCreate={can('Brands.Create')}
          onCreate={() => setEditor({ type: 'brand', mode: 'create' })}
        >
          {brands.map((b) => (
            <div key={b.id} className="dash-lookup-row">
              <label className="dash-check">
                <input
                  type="checkbox"
                  checked={brandIds.includes(b.id)}
                  onChange={() => toggleId(brandIds, b.id, setBrandIds)}
                />
                <span>{azName(b.translations)}</span>
              </label>
              <LookupActions
                canUpdate={can('Brands.Update')}
                canDelete={can('Brands.Delete')}
                onEdit={() =>
                  setEditor({ type: 'brand', mode: 'edit', item: b })
                }
                onDelete={() =>
                  setPendingDelete({
                    kind: 'brand',
                    id: b.id,
                    title: azName(b.translations),
                  })
                }
              />
            </div>
          ))}
        </LookupSection>

        <LookupSection
          title="Ölçülər *"
          canCreate={can('Sizes.Create')}
          onCreate={() => setEditor({ type: 'size', mode: 'create' })}
        >
          {sizes.map((s) => (
            <div key={s.id} className="dash-lookup-row">
              <label className="dash-check">
                <input
                  type="checkbox"
                  checked={sizeIds.includes(s.id)}
                  onChange={() => toggleId(sizeIds, s.id, setSizeIds)}
                />
                <span>{s.value}</span>
              </label>
              <LookupActions
                canUpdate={can('Sizes.Update')}
                canDelete={can('Sizes.Delete')}
                onEdit={() => setEditor({ type: 'size', mode: 'edit', item: s })}
                onDelete={() =>
                  setPendingDelete({
                    kind: 'size',
                    id: s.id,
                    title: String(s.value),
                  })
                }
              />
            </div>
          ))}
        </LookupSection>

        <LookupSection
          title="Diametrlər *"
          canCreate={can('Diameters.Create')}
          onCreate={() => setEditor({ type: 'diameter', mode: 'create' })}
        >
          {diameters.map((d) => (
            <div key={d.id} className="dash-lookup-row">
              <label className="dash-check">
                <input
                  type="checkbox"
                  checked={diameterIds.includes(d.id)}
                  onChange={() => toggleId(diameterIds, d.id, setDiameterIds)}
                />
                <span>{d.value}</span>
              </label>
              <LookupActions
                canUpdate={can('Diameters.Update')}
                canDelete={can('Diameters.Delete')}
                onEdit={() =>
                  setEditor({ type: 'diameter', mode: 'edit', item: d })
                }
                onDelete={() =>
                  setPendingDelete({
                    kind: 'diameter',
                    id: d.id,
                    title: String(d.value),
                  })
                }
              />
            </div>
          ))}
        </LookupSection>

        <LookupSection
          title="Güc (amper) *"
          canCreate={can('Powers.Create')}
          onCreate={() => setEditor({ type: 'power', mode: 'create' })}
        >
          {powers.map((p) => (
            <div key={p.id} className="dash-lookup-row">
              <label className="dash-check">
                <input
                  type="checkbox"
                  checked={powerIds.includes(p.id)}
                  onChange={() => toggleId(powerIds, p.id, setPowerIds)}
                />
                <span>{p.value}</span>
              </label>
              <LookupActions
                canUpdate={can('Powers.Update')}
                canDelete={can('Powers.Delete')}
                onEdit={() => setEditor({ type: 'power', mode: 'edit', item: p })}
                onDelete={() =>
                  setPendingDelete({
                    kind: 'power',
                    id: p.id,
                    title: String(p.value),
                  })
                }
              />
            </div>
          ))}
        </LookupSection>

        <LookupSection
          title="İstehsalçı ölkələr *"
          hint="Yalnız Azərbaycan adları göstərilir."
          canCreate={can('ManufacturerCountries.Create')}
          onCreate={() => setEditor({ type: 'country', mode: 'create' })}
        >
          {countries.map((c) => (
            <div key={c.id} className="dash-lookup-row">
              <label className="dash-check">
                <input
                  type="checkbox"
                  checked={countryIds.includes(c.id)}
                  onChange={() => toggleId(countryIds, c.id, setCountryIds)}
                />
                <span>{azName(c.translations)}</span>
              </label>
              <LookupActions
                canUpdate={can('ManufacturerCountries.Update')}
                canDelete={can('ManufacturerCountries.Delete')}
                onEdit={() =>
                  setEditor({ type: 'country', mode: 'edit', item: c })
                }
                onDelete={() =>
                  setPendingDelete({
                    kind: 'country',
                    id: c.id,
                    title: azName(c.translations),
                  })
                }
              />
            </div>
          ))}
        </LookupSection>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Şəkillər *</h2>
            <p className="dash-panel__hint">
              Rəngdən asılı olmayan şəkillər. Bir neçə şəkil yükləyə bilərsiniz.
            </p>
          </div>
          <div className="dash-color-option__images">
            <div className="dash-image-thumbs">
              {existingProductImages.map((img) => (
                <div key={img.id} className="dash-image-thumb">
                  <img src={img.imageUrl} alt="" />
                  <button
                    type="button"
                    className="dash-image-thumb__remove"
                    onClick={() =>
                      setExistingProductImages((prev) =>
                        prev.filter((item) => item.id !== img.id),
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              {newProductFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="dash-image-thumb">
                  <img src={URL.createObjectURL(file)} alt="" />
                  <button
                    type="button"
                    className="dash-image-thumb__remove"
                    onClick={() =>
                      setNewProductFiles((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
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
                  const files = Array.from(ev.target.files ?? [])
                  if (files.length > 0) {
                    setNewProductFiles((prev) => [...prev, ...files])
                  }
                  ev.target.value = ''
                }}
              />
            </label>
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">360 video</h2>
            <p className="dash-panel__hint">
              Məcburi deyil. Hələlik hər məhsul üçün bir video.
            </p>
          </div>
          {shownVideoUrl ? (
            <video
              key={shownVideoUrl}
              className="dash-hero-video"
              src={shownVideoUrl}
              muted
              loop
              playsInline
              controls
            />
          ) : (
            <p className="dash-empty">360 video yoxdur.</p>
          )}
          <div className="dash-media-actions">
            <label className="dash-btn dash-btn--ghost dash-file-btn">
              {shownVideoUrl ? 'Videonu dəyiş' : 'Video yüklə'}
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                hidden
                onChange={(event) => {
                  pickVideo(event.target.files?.[0] ?? null)
                  event.target.value = ''
                }}
              />
            </label>
            {shownVideoUrl ? (
              <button
                type="button"
                className="dash-btn dash-btn--ghost"
                onClick={() => {
                  setExistingVideo(null)
                  setNewVideoFile(null)
                }}
              >
                Videonu sil
              </button>
            ) : null}
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head dash-panel__head--row">
            <div>
              <h2 className="dash-panel__title">Rənglər və şəkillər *</h2>
              <p className="dash-panel__hint">
                Rəng seçin və hər rəng üçün şəkil yükləyin.
              </p>
            </div>
            {can('Colors.Create') && (
              <button
                type="button"
                className="dash-btn dash-btn--ghost dash-btn--compact"
                onClick={() => setEditor({ type: 'color', mode: 'create' })}
              >
                Yeni əlavə et
              </button>
            )}
          </div>
          <div className="dash-color-options">
            {colors.map((c) => {
              const selected = colorIds.includes(c.id)
              return (
                <div key={c.id} className="dash-color-option">
                  <div className="dash-lookup-row">
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
                    <LookupActions
                      canUpdate={can('Colors.Update')}
                      canDelete={can('Colors.Delete')}
                      onEdit={() =>
                        setEditor({ type: 'color', mode: 'edit', item: c })
                      }
                      onDelete={() =>
                        setPendingDelete({
                          kind: 'color',
                          id: c.id,
                          title: azName(c.translations),
                        })
                      }
                    />
                  </div>

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

      <ProductCatalogEditors
        editor={editor}
        onClose={() => setEditor(null)}
        onSaved={handleCatalogSaved}
      />
      <ConfirmModal
        open={pendingDelete !== null}
        title="Silmək istədiyinizə əminsiniz?"
        message={deleteMessage(pendingDelete)}
        confirming={deletingCatalog}
        onConfirm={() => void confirmCatalogDelete()}
        onCancel={() => {
          if (!deletingCatalog) setPendingDelete(null)
        }}
      />
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
