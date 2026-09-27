import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  deleteSize,
  getSizes,
  type SizeDetail,
} from '../../api/sizes'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { CategoryActionsMenu } from '../components/CategoryActionsMenu'
import { ConfirmModal } from '../components/ConfirmModal'
import { SuccessToast } from '../components/SuccessToast'

type SortBy = 'value' | 'id'
type SortDirection = 'asc' | 'desc'

function formatValue(value: number) {
  return String(value)
}

export function SizeListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { can } = useAuth()
  const canCreate = can('Sizes.Create')
  const canView = can('Sizes.View')
  const canUpdate = can('Sizes.Update')
  const canDelete = can('Sizes.Delete')
  const [items, setItems] = useState<SizeDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<SizeDetail | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('value')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const state = location.state as { success?: string } | null
    if (state?.success) {
      setSuccess(state.success)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

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
      const result = await getSizes({
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
          : 'Ölçülər yüklənərkən xəta baş verdi.',
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
      setSortDirection('asc')
    }
    setPage(1)
  }

  function sortLabel(column: SortBy) {
    if (sortBy !== column) return ''
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    setError(null)
    try {
      await deleteSize(pendingDelete.id)
      setPendingDelete(null)
      await load()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Ölçü silinərkən xəta baş verdi.',
      )
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const deleteTitle = pendingDelete ? formatValue(pendingDelete.value) : ''
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">Ölçü</h1>
        </div>
        {canCreate && (
          <Link
            to="/dashboard/sizes/create"
            className="dash-btn dash-btn--primary"
          >
            Yeni ölçü
          </Link>
        )}
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
            placeholder="Axtarış (dəyər…)"
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
          <div className="dash-empty dash-empty--stack">
            <p>
              {search
                ? 'Axtarışa uyğun ölçü tapılmadı.'
                : 'Hələ ölçü yoxdur.'}
            </p>
            {!search && canCreate && (
              <Link
                to="/dashboard/sizes/create"
                className="dash-btn dash-btn--ghost"
              >
                İlk ölçünü yarat
              </Link>
            )}
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="dash-table__sort"
                      onClick={() => toggleSort('value')}
                    >
                      Dəyər{sortLabel('value')}
                    </button>
                  </th>
                  <th className="dash-table__actions-col">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={
                      deleting && pendingDelete?.id === item.id
                        ? 'is-deleting'
                        : undefined
                    }
                  >
                    <td>
                      <span className="dash-table__name">
                        {formatValue(item.value)}
                      </span>
                    </td>
                    <td className="dash-table__actions-col">
                      <CategoryActionsMenu
                        onView={
                          canView
                            ? () => navigate(`/dashboard/sizes/${item.id}`)
                            : undefined
                        }
                        onEdit={
                          canUpdate
                            ? () =>
                                navigate(`/dashboard/sizes/${item.id}/edit`)
                            : undefined
                        }
                        onDelete={
                          canDelete ? () => setPendingDelete(item) : undefined
                        }
                      />
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setPage((p) => p + 1)}
            >
              Növbəti
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="Silmək istədiyinizə əminsiniz?"
        message={
          pendingDelete ? `“${deleteTitle}” ölçüsü silinəcək.` : ''
        }
        confirmLabel="Sil"
        cancelLabel="Ləğv et"
        confirming={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleting) setPendingDelete(null)
        }}
      />

      <SuccessToast
        message={success}
        onDismiss={() => setSuccess(null)}
      />
    </div>
  )
}
