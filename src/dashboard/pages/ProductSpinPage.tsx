import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, type ProductListItem } from '../../api/products'
import { ApiError } from '../../api/types'

export function ProductSpinPage() {
  const [items, setItems] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getProducts({
        page,
        pageSize,
        search: search || undefined,
        searchNameOnly: true,
        sortBy: 'az',
      })
      setItems(result.items)
      setTotalCount(result.totalCount)
      setTotalPages(result.totalPages)
      if (result.totalPages > 0 && page > result.totalPages) {
        setPage(result.totalPages)
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Məhsullar yüklənərkən xəta baş verdi.',
      )
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    void load()
  }, [load])

  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header">
        <h1 className="dash-page__title">360 şəkil</h1>
      </header>

      {error && (
        <div className="dash-alert dash-alert--error" role="alert">
          {error}
        </div>
      )}

      <div className="dash-toolbar">
        <label className="dash-toolbar__search">
          <span className="visually-hidden">Axtarış</span>
          <input
            className="dash-input"
            type="search"
            placeholder="Məhsulun adı…"
            value={searchInput}
            onChange={(ev) => setSearchInput(ev.target.value)}
          />
        </label>
        <label className="dash-toolbar__size">
          <span>Səhifə</span>
          <select
            className="dash-input dash-input--select"
            value={pageSize}
            onChange={(ev) => {
              setPageSize(Number(ev.target.value))
              setPage(1)
            }}
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="dash-panel dash-panel--table">
        {loading ? (
          <p className="dash-empty">Yüklənir…</p>
        ) : items.length === 0 ? (
          <p className="dash-empty">
            {search ? 'Axtarışa uyğun məhsul tapılmadı.' : 'Hələ məhsul yoxdur.'}
          </p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Ad</th>
                  <th className="dash-table__spin-col">360</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="dash-table__name">{item.name}</span>
                    </td>
                    <td className="dash-table__spin-col">
                      <Link
                        to={`/dashboard/products/${item.id}/spin`}
                        className="dash-btn dash-btn--ghost"
                      >
                        360 əlavə et
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {totalCount > 0 && (
        <div className="dash-pagination">
          <p className="dash-pagination__meta">
            {from}–{to} / {totalCount}
          </p>
          <div className="dash-pagination__controls">
            <button
              type="button"
              className="dash-btn dash-btn--ghost"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Əvvəlki
            </button>
            <span className="dash-pagination__page">
              {page} / {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              className="dash-btn dash-btn--ghost"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Növbəti
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
