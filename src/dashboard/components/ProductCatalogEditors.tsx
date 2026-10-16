import { useId, useRef, useState, type FormEvent } from 'react'
import { createBrand, updateBrand, type BrandDetail } from '../../api/brands'
import {
  createCategory,
  updateCategory,
} from '../../api/categories'
import { createColor, updateColor, type ColorDetail } from '../../api/colors'
import {
  createDiameter,
  updateDiameter,
  type DiameterDetail,
} from '../../api/diameters'
import {
  createManufacturerCountry,
  updateManufacturerCountry,
  type ManufacturerCountryDetail,
} from '../../api/manufacturerCountries'
import { createPower, updatePower, type PowerDetail } from '../../api/powers'
import { createSize, updateSize, type SizeDetail } from '../../api/sizes'
import {
  ApiError,
  type CategoryDetail,
  type LanguageCode,
  type TranslationInput,
} from '../../api/types'
import { CatalogFormModal } from './CatalogFormModal'

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'az', label: 'Azərbaycan' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
]

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/

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

function namesToTranslations(names: NameMap): TranslationInput[] {
  return LANGUAGES.map(({ code }) => ({
    languageCode: code,
    name: names[code].trim(),
  })).filter((item) => item.name.length > 0)
}

function normalizeHexInput(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}

function FormAlert({
  error,
  fieldErrors,
}: {
  error: string | null
  fieldErrors: Record<string, string[]>
}) {
  if (!error) return null
  return (
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
  )
}

function TranslationFields({
  idPrefix,
  names,
  onChange,
}: {
  idPrefix: string
  names: NameMap
  onChange: (code: LanguageCode, value: string) => void
}) {
  return (
    <div className="dash-form__langs">
      {LANGUAGES.map(({ code, label }) => (
        <div key={code} className="dash-field">
          <label className="dash-field__label" htmlFor={`${idPrefix}-${code}`}>
            {label}
            {code === 'az' ? ' *' : ''}
          </label>
          <input
            id={`${idPrefix}-${code}`}
            className="dash-input"
            type="text"
            maxLength={200}
            value={names[code]}
            onChange={(ev) => onChange(code, ev.target.value)}
            required={code === 'az'}
          />
        </div>
      ))}
    </div>
  )
}

export type CatalogEditorState =
  | { type: 'brand'; mode: 'create' }
  | { type: 'brand'; mode: 'edit'; item: BrandDetail }
  | { type: 'country'; mode: 'create' }
  | { type: 'country'; mode: 'edit'; item: ManufacturerCountryDetail }
  | { type: 'size'; mode: 'create' }
  | { type: 'size'; mode: 'edit'; item: SizeDetail }
  | { type: 'diameter'; mode: 'create' }
  | { type: 'diameter'; mode: 'edit'; item: DiameterDetail }
  | { type: 'power'; mode: 'create' }
  | { type: 'power'; mode: 'edit'; item: PowerDetail }
  | { type: 'color'; mode: 'create' }
  | { type: 'color'; mode: 'edit'; item: ColorDetail }
  | { type: 'category'; mode: 'create' }
  | { type: 'category'; mode: 'edit'; item: CategoryDetail }
  | { type: 'subcategory'; mode: 'create'; category: CategoryDetail }
  | {
      type: 'subcategory'
      mode: 'edit'
      category: CategoryDetail
      subId: number
    }

export type CatalogSave =
  | { type: 'brand'; mode: 'create' | 'edit'; item: BrandDetail }
  | {
      type: 'country'
      mode: 'create' | 'edit'
      item: ManufacturerCountryDetail
    }
  | { type: 'size'; mode: 'create' | 'edit'; item: SizeDetail }
  | { type: 'diameter'; mode: 'create' | 'edit'; item: DiameterDetail }
  | { type: 'power'; mode: 'create' | 'edit'; item: PowerDetail }
  | { type: 'color'; mode: 'create' | 'edit'; item: ColorDetail }
  | {
      type: 'category'
      mode: 'create' | 'edit'
      item: CategoryDetail
      selectSubId?: number
    }

interface ProductCatalogEditorsProps {
  editor: CatalogEditorState | null
  onClose: () => void
  onSaved: (result: CatalogSave) => void
}

function applyApiError(
  err: unknown,
  setError: (value: string) => void,
  setFieldErrors: (value: Record<string, string[]>) => void,
) {
  if (err instanceof ApiError) {
    setError(err.message)
    setFieldErrors(err.errors)
    return
  }
  setError('Gözlənilməz xəta baş verdi. Serverin işlədiyini yoxlayın.')
}

function TranslationEntityEditor({
  title,
  submitLabel,
  initial,
  onClose,
  save,
}: {
  title: string
  submitLabel: string
  initial: NameMap
  onClose: () => void
  save: (translations: TranslationInput[]) => Promise<void>
}) {
  const [names, setNames] = useState<NameMap>(initial)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    if (!names.az.trim()) {
      setError('Azərbaycan dili adı mütləqdir.')
      return
    }
    setSubmitting(true)
    try {
      await save(namesToTranslations(names))
    } catch (err) {
      applyApiError(err, setError, setFieldErrors)
      setSubmitting(false)
    }
  }

  return (
    <CatalogFormModal title={title} submitting={submitting} onClose={onClose}>
      <form className="dash-modal__fields" onSubmit={onSubmit} noValidate>
        <FormAlert error={error} fieldErrors={fieldErrors} />
        <p className="dash-panel__hint">
          Azərbaycan dili mütləqdir; İngilis və Rus istəyə bağlıdır.
        </p>
        <TranslationFields
          idPrefix="lookup-name"
          names={names}
          onChange={(code, value) =>
            setNames((prev) => ({ ...prev, [code]: value }))
          }
        />
        <div className="dash-form__actions">
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            disabled={submitting}
            onClick={onClose}
          >
            Ləğv et
          </button>
          <button
            type="submit"
            className="dash-btn dash-btn--primary"
            disabled={submitting}
          >
            {submitting ? 'Saxlanılır…' : submitLabel}
          </button>
        </div>
      </form>
    </CatalogFormModal>
  )
}

function ValueEntityEditor({
  title,
  submitLabel,
  initial,
  onClose,
  save,
}: {
  title: string
  submitLabel: string
  initial: string
  onClose: () => void
  save: (value: number) => Promise<void>
}) {
  const [value, setValue] = useState(initial)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    const number = Number(value.replace(',', '.'))
    if (!Number.isFinite(number) || number <= 0) {
      setError('Dəyər müsbət rəqəm olmalıdır.')
      return
    }
    setSubmitting(true)
    try {
      await save(number)
    } catch (err) {
      applyApiError(err, setError, setFieldErrors)
      setSubmitting(false)
    }
  }

  return (
    <CatalogFormModal title={title} submitting={submitting} onClose={onClose}>
      <form className="dash-modal__fields" onSubmit={onSubmit} noValidate>
        <FormAlert error={error} fieldErrors={fieldErrors} />
        <div className="dash-field">
          <label className="dash-field__label" htmlFor="lookup-value">
            Dəyər *
          </label>
          <input
            id="lookup-value"
            className="dash-input"
            type="number"
            min="0.001"
            step="any"
            value={value}
            onChange={(ev) => setValue(ev.target.value)}
            required
          />
        </div>
        <div className="dash-form__actions">
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            disabled={submitting}
            onClick={onClose}
          >
            Ləğv et
          </button>
          <button
            type="submit"
            className="dash-btn dash-btn--primary"
            disabled={submitting}
          >
            {submitting ? 'Saxlanılır…' : submitLabel}
          </button>
        </div>
      </form>
    </CatalogFormModal>
  )
}

function ColorEditor({
  color,
  onClose,
  onSaved,
}: {
  color: ColorDetail | null
  onClose: () => void
  onSaved: (result: CatalogSave) => void
}) {
  const [names, setNames] = useState<NameMap>(
    color ? namesFromTranslations(color.translations) : emptyNames(),
  )
  const [hexCode, setHexCode] = useState(color?.hexCode ?? '#000000')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const pickerValue = HEX_PATTERN.test(hexCode) ? hexCode : '#000000'

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
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
      const payload = {
        hexCode: hex,
        translations: namesToTranslations(names),
      }
      const item = color
        ? await updateColor(color.id, payload)
        : await createColor(payload)
      onSaved({ type: 'color', mode: color ? 'edit' : 'create', item })
    } catch (err) {
      applyApiError(err, setError, setFieldErrors)
      setSubmitting(false)
    }
  }

  return (
    <CatalogFormModal
      title={color ? 'Rəngi düzəliş et' : 'Yeni rəng'}
      submitting={submitting}
      onClose={onClose}
    >
      <form className="dash-modal__fields" onSubmit={onSubmit} noValidate>
        <FormAlert error={error} fieldErrors={fieldErrors} />
        <div className="dash-color-picker">
          <label className="dash-color-picker__swatch-wrap" htmlFor="lookup-color-picker">
            <span className="visually-hidden">Rəng paleti</span>
            <input
              id="lookup-color-picker"
              className="dash-color-picker__input"
              type="color"
              value={pickerValue}
              onChange={(ev) => setHexCode(ev.target.value.toUpperCase())}
            />
          </label>
          <div className="dash-field dash-color-picker__hex">
            <label className="dash-field__label" htmlFor="lookup-color-hex">
              Rəng kodu *
            </label>
            <input
              id="lookup-color-hex"
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
        <p className="dash-panel__hint">
          Azərbaycan dili mütləqdir; İngilis və Rus istəyə bağlıdır.
        </p>
        <TranslationFields
          idPrefix="lookup-color"
          names={names}
          onChange={(code, value) =>
            setNames((prev) => ({ ...prev, [code]: value }))
          }
        />
        <div className="dash-form__actions">
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            disabled={submitting}
            onClick={onClose}
          >
            Ləğv et
          </button>
          <button
            type="submit"
            className="dash-btn dash-btn--primary"
            disabled={submitting}
          >
            {submitting ? 'Saxlanılır…' : color ? 'Dəyişiklikləri saxla' : 'Rəngi yarat'}
          </button>
        </div>
      </form>
    </CatalogFormModal>
  )
}

function CategoryEditor({
  category,
  onClose,
  onSaved,
}: {
  category: CategoryDetail | null
  onClose: () => void
  onSaved: (result: CatalogSave) => void
}) {
  const imageInputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [order, setOrder] = useState(category ? String(category.order) : '')
  const [names, setNames] = useState<NameMap>(
    category ? namesFromTranslations(category.translations) : emptyNames(),
  )
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(category?.image ?? null)
  const [subs, setSubs] = useState<SubCategoryDraft[]>(
    category
      ? category.subCategories.map((sub) => ({
          key: crypto.randomUUID(),
          id: sub.id,
          names: namesFromTranslations(sub.translations),
        }))
      : [],
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  function onImageChange(file: File | null) {
    setPreview((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current)
      return file ? URL.createObjectURL(file) : (category?.image ?? null)
    })
    setImage(file)
  }

  function addSubCategory() {
    setSubs((prev) => [
      ...prev,
      { key: crypto.randomUUID(), names: emptyNames() },
    ])
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    const orderNum = Number(order)
    if (!category && !image) {
      setError('Kateqoriya şəkli mütləqdir.')
      return
    }
    if (!Number.isInteger(orderNum) || orderNum < 1) {
      setError('Sıra nömrəsi 1 və ya daha böyük olmalıdır.')
      return
    }
    if (!names.az.trim()) {
      setError('Azərbaycan dili adı mütləqdir.')
      return
    }
    const invalidSub = subs.findIndex((sub) => !sub.names.az.trim())
    if (invalidSub !== -1) {
      setError(
        `Alt kateqoriya #${invalidSub + 1} üçün Azərbaycan dili adı mütləqdir.`,
      )
      return
    }

    const subCategories = subs.map((sub) => ({
      id: sub.id,
      translations: namesToTranslations(sub.names),
    }))

    setSubmitting(true)
    try {
      const item = category
        ? await updateCategory(category.id, {
            image,
            order: orderNum,
            translations: namesToTranslations(names),
            subCategories,
          })
        : await createCategory({
            image: image!,
            order: orderNum,
            translations: namesToTranslations(names),
            subCategories,
          })
      onSaved({
        type: 'category',
        mode: category ? 'edit' : 'create',
        item,
      })
    } catch (err) {
      applyApiError(err, setError, setFieldErrors)
      setSubmitting(false)
    }
  }

  return (
    <CatalogFormModal
      title={category ? 'Kateqoriyanı düzəliş et' : 'Yeni kateqoriya'}
      submitting={submitting}
      wide
      onClose={onClose}
    >
      <form className="dash-modal__fields" onSubmit={onSubmit} noValidate>
        <FormAlert error={error} fieldErrors={fieldErrors} />
        <div className="dash-field">
          <label className="dash-field__label" htmlFor={imageInputId}>
            Şəkil{category ? '' : ' *'}
          </label>
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
          >
            <input
              id={imageInputId}
              ref={fileRef}
              type="file"
              accept="image/*"
              className="dash-upload__input"
              onChange={(ev) => onImageChange(ev.target.files?.[0] ?? null)}
            />
            {preview ? (
              <img
                src={preview}
                alt="Kateqoriya önbaxışı"
                className="dash-upload__preview"
              />
            ) : (
              <div className="dash-upload__placeholder">
                <span className="dash-upload__icon" aria-hidden />
                <p>Şəkili seçin</p>
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
              Yeni şəkili sil
            </button>
          )}
        </div>
        <div className="dash-field">
          <label className="dash-field__label" htmlFor="lookup-category-order">
            Sıra *
          </label>
          <input
            id="lookup-category-order"
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
        <div>
          <p className="dash-panel__hint">
            Azərbaycan dili mütləqdir; İngilis və Rus istəyə bağlıdır.
          </p>
          <TranslationFields
            idPrefix="lookup-category"
            names={names}
            onChange={(code, value) =>
              setNames((prev) => ({ ...prev, [code]: value }))
            }
          />
        </div>
        <div>
          <div className="dash-panel__head dash-panel__head--row">
            <div>
              <h3 className="dash-panel__title">Alt kateqoriyalar</h3>
              <p className="dash-panel__hint">
                İstəyə bağlı — hər biri üçün AZ mütləq, EN/RU istəyə bağlı.
              </p>
            </div>
            <button
              type="button"
              className="dash-btn dash-btn--ghost dash-btn--compact"
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
                    <span className="dash-sub__index">#{index + 1}</span>
                    <button
                      type="button"
                      className="dash-link-btn dash-link-btn--danger"
                      onClick={() =>
                        setSubs((prev) => prev.filter((item) => item.key !== sub.key))
                      }
                    >
                      Sil
                    </button>
                  </div>
                  <TranslationFields
                    idPrefix={`lookup-sub-${sub.key}`}
                    names={sub.names}
                    onChange={(code, value) =>
                      setSubs((prev) =>
                        prev.map((item) =>
                          item.key === sub.key
                            ? {
                                ...item,
                                names: { ...item.names, [code]: value },
                              }
                            : item,
                        ),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="dash-form__actions">
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            disabled={submitting}
            onClick={onClose}
          >
            Ləğv et
          </button>
          <button
            type="submit"
            className="dash-btn dash-btn--primary"
            disabled={submitting}
          >
            {submitting
              ? 'Saxlanılır…'
              : category
                ? 'Dəyişiklikləri saxla'
                : 'Kateqoriyanı yarat'}
          </button>
        </div>
      </form>
    </CatalogFormModal>
  )
}

function SubCategoryEditor({
  category,
  subId,
  onClose,
  onSaved,
}: {
  category: CategoryDetail
  subId: number | null
  onClose: () => void
  onSaved: (result: CatalogSave) => void
}) {
  const existing = category.subCategories.find((sub) => sub.id === subId)
  const [names, setNames] = useState<NameMap>(
    existing ? namesFromTranslations(existing.translations) : emptyNames(),
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    if (!names.az.trim()) {
      setError('Azərbaycan dili adı mütləqdir.')
      return
    }
    if (subId !== null && !existing) {
      setError('Alt kateqoriya tapılmadı.')
      return
    }

    const subCategories: Array<{
      id?: number
      translations: TranslationInput[]
    }> = category.subCategories.map((sub) => ({
      id: sub.id,
      translations:
        sub.id === subId ? namesToTranslations(names) : sub.translations,
    }))
    if (subId === null) {
      subCategories.push({ translations: namesToTranslations(names) })
    }

    setSubmitting(true)
    try {
      const item = await updateCategory(category.id, {
        order: category.order,
        translations: category.translations,
        subCategories,
      })
      const previousIds = new Set(category.subCategories.map((sub) => sub.id))
      const created = item.subCategories.find((sub) => !previousIds.has(sub.id))
      onSaved({
        type: 'category',
        mode: 'edit',
        item,
        selectSubId: subId === null ? created?.id : subId,
      })
    } catch (err) {
      applyApiError(err, setError, setFieldErrors)
      setSubmitting(false)
    }
  }

  return (
    <CatalogFormModal
      title={subId === null ? 'Yeni alt kateqoriya' : 'Alt kateqoriyanı düzəliş et'}
      submitting={submitting}
      onClose={onClose}
    >
      <form className="dash-modal__fields" onSubmit={onSubmit} noValidate>
        <FormAlert error={error} fieldErrors={fieldErrors} />
        <p className="dash-panel__hint">
          Azərbaycan dili mütləqdir; İngilis və Rus istəyə bağlıdır.
        </p>
        <TranslationFields
          idPrefix="lookup-subcategory"
          names={names}
          onChange={(code, value) =>
            setNames((prev) => ({ ...prev, [code]: value }))
          }
        />
        <div className="dash-form__actions">
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            disabled={submitting}
            onClick={onClose}
          >
            Ləğv et
          </button>
          <button
            type="submit"
            className="dash-btn dash-btn--primary"
            disabled={submitting}
          >
            {submitting
              ? 'Saxlanılır…'
              : subId === null
                ? 'Alt kateqoriyanı yarat'
                : 'Dəyişiklikləri saxla'}
          </button>
        </div>
      </form>
    </CatalogFormModal>
  )
}

export function ProductCatalogEditors({
  editor,
  onClose,
  onSaved,
}: ProductCatalogEditorsProps) {
  if (!editor) return null

  if (editor.type === 'brand') {
    const item = editor.mode === 'edit' ? editor.item : null
    return (
      <TranslationEntityEditor
        key={item ? `brand-${item.id}` : 'brand-new'}
        title={item ? 'Markanı düzəliş et' : 'Yeni marka'}
        submitLabel={item ? 'Dəyişiklikləri saxla' : 'Markanı yarat'}
        initial={item ? namesFromTranslations(item.translations) : emptyNames()}
        onClose={onClose}
        save={async (translations) => {
          const saved = item
            ? await updateBrand(item.id, { translations })
            : await createBrand({ translations })
          onSaved({ type: 'brand', mode: item ? 'edit' : 'create', item: saved })
        }}
      />
    )
  }

  if (editor.type === 'country') {
    const item = editor.mode === 'edit' ? editor.item : null
    return (
      <TranslationEntityEditor
        key={item ? `country-${item.id}` : 'country-new'}
        title={item ? 'Ölkəni düzəliş et' : 'Yeni istehsalçı ölkə'}
        submitLabel={item ? 'Dəyişiklikləri saxla' : 'Ölkəni yarat'}
        initial={item ? namesFromTranslations(item.translations) : emptyNames()}
        onClose={onClose}
        save={async (translations) => {
          const saved = item
            ? await updateManufacturerCountry(item.id, { translations })
            : await createManufacturerCountry({ translations })
          onSaved({
            type: 'country',
            mode: item ? 'edit' : 'create',
            item: saved,
          })
        }}
      />
    )
  }

  if (editor.type === 'size') {
    const item = editor.mode === 'edit' ? editor.item : null
    return (
      <ValueEntityEditor
        key={item ? `size-${item.id}` : 'size-new'}
        title={item ? 'Ölçünü düzəliş et' : 'Yeni ölçü'}
        submitLabel={item ? 'Dəyişiklikləri saxla' : 'Ölçünü yarat'}
        initial={item ? String(item.value) : ''}
        onClose={onClose}
        save={async (value) => {
          const saved = item
            ? await updateSize(item.id, { value })
            : await createSize({ value })
          onSaved({ type: 'size', mode: item ? 'edit' : 'create', item: saved })
        }}
      />
    )
  }

  if (editor.type === 'diameter') {
    const item = editor.mode === 'edit' ? editor.item : null
    return (
      <ValueEntityEditor
        key={item ? `diameter-${item.id}` : 'diameter-new'}
        title={item ? 'Diametri düzəliş et' : 'Yeni diametr'}
        submitLabel={item ? 'Dəyişiklikləri saxla' : 'Diametri yarat'}
        initial={item ? String(item.value) : ''}
        onClose={onClose}
        save={async (value) => {
          const saved = item
            ? await updateDiameter(item.id, { value })
            : await createDiameter({ value })
          onSaved({
            type: 'diameter',
            mode: item ? 'edit' : 'create',
            item: saved,
          })
        }}
      />
    )
  }

  if (editor.type === 'power') {
    const item = editor.mode === 'edit' ? editor.item : null
    return (
      <ValueEntityEditor
        key={item ? `power-${item.id}` : 'power-new'}
        title={item ? 'Gücü düzəliş et' : 'Yeni güc'}
        submitLabel={item ? 'Dəyişiklikləri saxla' : 'Gücü yarat'}
        initial={item ? String(item.value) : ''}
        onClose={onClose}
        save={async (value) => {
          const saved = item
            ? await updatePower(item.id, { value })
            : await createPower({ value })
          onSaved({ type: 'power', mode: item ? 'edit' : 'create', item: saved })
        }}
      />
    )
  }

  if (editor.type === 'color') {
    const item = editor.mode === 'edit' ? editor.item : null
    return (
      <ColorEditor
        key={item ? `color-${item.id}` : 'color-new'}
        color={item}
        onClose={onClose}
        onSaved={onSaved}
      />
    )
  }

  if (editor.type === 'category') {
    const item = editor.mode === 'edit' ? editor.item : null
    return (
      <CategoryEditor
        key={item ? `category-${item.id}` : 'category-new'}
        category={item}
        onClose={onClose}
        onSaved={onSaved}
      />
    )
  }

  return (
    <SubCategoryEditor
      key={
        editor.mode === 'edit'
          ? `sub-${editor.category.id}-${editor.subId}`
          : `sub-new-${editor.category.id}`
      }
      category={editor.category}
      subId={editor.mode === 'edit' ? editor.subId : null}
      onClose={onClose}
      onSaved={onSaved}
    />
  )
}
