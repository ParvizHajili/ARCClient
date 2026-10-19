import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getContactInquiries, type ContactInquiry } from '../../api/contact'
import { ApiError } from '../../api/types'

type SortBy = 'date' | 'name'
type SortDirection = 'asc' | 'desc'

function previewMessage(message: string) {
  const chars = Array.from(message)
  if (chars.length <= 10) return message
  return `${chars.slice(0, 10).join('')}…`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('az-AZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function InquiryListPage() {
  const [items, setItems] = useState<ContactInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
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
      const result = await getContactInquiries({
        page,
        pageSize,
        search: search || undefined,
        sortBy,
        sortDirection,
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
          : 'Müraciətlər yüklənərkən xəta baş verdi.',
      )
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, sortBy, sortDirection])

  useEffect(() => {
    void load()
  }, [load])

  function toggleSort(column: SortBy) {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDirection(column === 'date' ? 'desc' : 'asc')
    }
    setPage(1)
  }

  function sortLabel(column: SortBy) {
    if (sortBy !== column) return ''
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header">
        <h1 className="dash-page__title">Gələn müraciətlər</h1>
        <p className="dash-page__lead">
          Ana səhifədəki əlaqə formasından göndərilən müraciətlər.
        </p>
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
            placeholder="Axtarış (ad, telefon, email, mesaj…)"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </label>
        <label className="dash-toolbar__size">
          <span>Səhifə</span>
          <select
            className="dash-input dash-input--select"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
            }}
          >
            {[5, 10, 20, 50].map((size) => (
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
            {search ? 'Axtarışa uyğun müraciət tapılmadı.' : 'Hələ müraciət yoxdur.'}
          </p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="dash-table__sort"
                      onClick={() => toggleSort('date')}
                    >
                      Tarix{sortLabel('date')}
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="dash-table__sort"
                      onClick={() => toggleSort('name')}
                    >
                      Ad{sortLabel('name')}
                    </button>
                  </th>
                  <th>Telefon</th>
                  <th>Email</th>
                  <th>Mesaj</th>
                  <th className="dash-table__actions-col"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.createDate)}</td>
                    <td>{item.name}</td>
                    <td>{item.phone || '—'}</td>
                    <td>{item.email || '—'}</td>
                    <td className="dash-table__message">
                      <Link
                        to={`/dashboard/inquiries/${item.id}`}
                        className="dash-table__message-link"
                      >
                        {previewMessage(item.message)}
                      </Link>
                    </td>
                    <td className="dash-table__actions-col">
                      <Link
                        to={`/dashboard/inquiries/${item.id}`}
                        className="dash-table__view"
                      >
                        Bax
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
