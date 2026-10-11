import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  getHomeProducts,
  MAX_HOME_PRODUCTS,
  searchHomeProductOptions,
  setHomeProducts,
  type HomeProduct,
  type HomeProductOption,
} from '../../api/products'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'

export function HomeProductsPage() {
  const { can } = useAuth()
  const canUpdate = can('Products.Update')
  const [items, setItems] = useState<HomeProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [open, setOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<HomeProductOption[]>([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [pickerError, setPickerError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await getHomeProducts())
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Ana səhifə məhsulları yüklənərkən xəta baş verdi.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!open) return
    let active = true
    setOptionsLoading(true)
    void searchHomeProductOptions(search)
      .then((result) => {
        if (active) setOptions(result)
      })
      .catch((err) => {
        if (!active) return
        setPickerError(
          err instanceof ApiError ? err.message : 'Məhsullar yüklənərkən xəta baş verdi.',
        )
      })
      .finally(() => {
        if (active) setOptionsLoading(false)
      })
    return () => {
      active = false
    }
  }, [open, search])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, saving])

  function openPicker() {
    setSelectedIds(items.map((item) => item.id))
    setSearchInput('')
    setSearch('')
    setPickerError(null)
    setOpen(true)
  }

  function toggleProduct(id: number) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        setPickerError(null)
        return current.filter((item) => item !== id)
      }
      if (current.length >= MAX_HOME_PRODUCTS) {
        setPickerError('Ən çox 8 məhsul seçilə bilər.')
        return current
      }
      setPickerError(null)
      return [...current, id]
    })
  }

  async function save() {
    if (selectedIds.length > MAX_HOME_PRODUCTS) {
      setPickerError('Ən çox 8 məhsul seçilə bilər.')
      return
    }

    setSaving(true)
    setPickerError(null)
    try {
      const saved = await setHomeProducts(selectedIds)
      setItems(saved)
      setOpen(false)
    } catch (err) {
      setPickerError(
        err instanceof ApiError
          ? err.message
          : 'Seçim yadda saxlanılarkən xəta baş verdi.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">Ana səhifə məhsulları</h1>
          <p className="dash-page__lead">
            Seçilmiş: {items.length} / {MAX_HOME_PRODUCTS}
          </p>
        </div>
        {canUpdate ? (
          <button type="button" className="dash-btn dash-btn--primary" onClick={openPicker}>
            Məhsul artır
          </button>
        ) : null}
      </header>

      {error ? (
        <div className="dash-alert dash-alert--error" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="dash-empty">Yüklənir…</p>
      ) : items.length === 0 ? (
        <p className="dash-empty">Ana səhifə üçün məhsul seçilməyib.</p>
      ) : (
        <section className="dash-panel dash-panel--table">
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>Kod</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name || '—'}</td>
                    <td>{item.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {open
        ? createPortal(
            <div className="dash-modal" role="presentation">
              <button
                type="button"
                className="dash-modal__backdrop"
                aria-label="Bağla"
                onClick={() => {
                  if (!saving) setOpen(false)
                }}
              />
              <div
                className="dash-modal__dialog dash-modal__dialog--picker"
                role="dialog"
                aria-modal="true"
                aria-labelledby="homeProductsTitle"
              >
                <h2 className="dash-modal__title" id="homeProductsTitle">
                  Məhsul seç
                </h2>
                <p className="dash-modal__message">
                  Ən çox {MAX_HOME_PRODUCTS} məhsul. Seçilib: {selectedIds.length} /{' '}
                  {MAX_HOME_PRODUCTS}
                </p>
                <input
                  className="dash-input"
                  type="search"
                  placeholder="Ada görə axtar"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
                {pickerError ? (
                  <p className="dash-home-picker__error" role="alert">
                    {pickerError}
                  </p>
                ) : null}
                <div className="dash-home-picker__list">
                  {optionsLoading ? (
                    <p className="dash-empty">Yüklənir…</p>
                  ) : options.length === 0 ? (
                    <p className="dash-empty">Məhsul tapılmadı.</p>
                  ) : (
                    options.map((option) => {
                      const checked = selectedIds.includes(option.id)
                      const locked =
                        !checked && selectedIds.length >= MAX_HOME_PRODUCTS
                      return (
                        <label
                          key={option.id}
                          className={`dash-check dash-home-picker__row${locked ? ' is-locked' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={locked || saving}
                            onChange={() => toggleProduct(option.id)}
                          />
                          <span>{option.name || '—'}</span>
                        </label>
                      )
                    })
                  )}
                </div>
                <div className="dash-modal__actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn--ghost"
                    disabled={saving}
                    onClick={() => setOpen(false)}
                  >
                    Ləğv et
                  </button>
                  <button
                    type="button"
                    className="dash-btn dash-btn--primary"
                    disabled={saving}
                    onClick={() => void save()}
                  >
                    {saving ? 'Saxlanılır…' : 'Yadda saxla'}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
