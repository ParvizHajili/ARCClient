import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { deleteCategory, getCategories } from '../../api/categories'
import { ApiError, type CategoryDetail } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { CategoryActionsMenu } from '../components/CategoryActionsMenu'
import { ConfirmModal } from '../components/ConfirmModal'
import { SuccessToast } from '../components/SuccessToast'

type SortBy = 'order' | 'az' | 'en' | 'ru' | 'id'
type SortDirection = 'asc' | 'desc'

function nameOf(category: CategoryDetail, code: string) {
  return (
    category.translations.find((t) => t.languageCode === code)?.name ??
    category.translations[0]?.name ??
    '—'
  )
}

export function CategoryListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { can } = useAuth()
  const canCreate = can('Categories.Create')
  const canView = can('Categories.View')
  const canUpdate = can('Categories.Update')
  const canDelete = can('Categories.Delete')
  const [items, setItems] = useState<CategoryDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<CategoryDetail | null>(
    null,
  )
  const [deleting, setDeleting] = useState(false)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<SortBy>('order')
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
      const result = await getCategories({
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
          : 'Kateqoriyalar yüklənərkən xəta baş verdi.',
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
      await deleteCategory(pendingDelete.id)
      setPendingDelete(null)
      await load()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Kateqoriya silinərkən xəta baş verdi.',
      )
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const deleteTitle = pendingDelete ? nameOf(pendingDelete, 'az') : ''
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">Kateqoriyalar</h1>
        </div>
        {canCreate && (
          <Link to="/dashboard/categories/create" className="dash-btn dash-btn--primary">
            Yeni kateqoriya
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
            placeholder="Axtarış (ad…)"
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
                ? 'Axtarışa uyğun kateqoriya tapılmadı.'
                : 'Hələ kateqoriya yoxdur.'}
            </p>
            {!search && canCreate && (
              <Link
                to="/dashboard/categories/create"
                className="dash-btn dash-btn--ghost"
              >
                İlk kateqoriyanı yarat
              </Link>
            )}
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Şəkil</th>
                  <th>
                    <button
                      type="button"
                      className="dash-table__sort"
                      onClick={() => toggleSort('order')}
                    >
                      Sıra{sortLabel('order')}
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="dash-table__sort"
                      onClick={() => toggleSort('az')}
                    >
                      AZ{sortLabel('az')}
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="dash-table__sort"
                      onClick={() => toggleSort('en')}
                    >
                      EN{sortLabel('en')}
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="dash-table__sort"
                      onClick={() => toggleSort('ru')}
                    >
                      RU{sortLabel('ru')}
                    </button>
                  </th>
                  <th>Alt</th>
                  <th className="dash-table__actions-col">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {items.map((category) => (
                  <tr
                    key={category.id}
                    className={
                      deleting && pendingDelete?.id === category.id
                        ? 'is-deleting'
                        : undefined
                    }
                  >
                    <td>
                      <div className="dash-table__thumb">
                        <img
                          src={category.image}
                          alt={nameOf(category, 'az')}
                        />
                      </div>
                    </td>
                    <td>
                      <span className="dash-table__order">{category.order}</span>
                    </td>
                    <td>
                      <span className="dash-table__name">
                        {nameOf(category, 'az')}
                      </span>
                    </td>
                    <td>{nameOf(category, 'en')}</td>
                    <td>{nameOf(category, 'ru')}</td>
                    <td>{category.subCategories.length}</td>
                    <td className="dash-table__actions-col">
                      <CategoryActionsMenu
                        onView={
                          canView
                            ? () =>
                                navigate(`/dashboard/categories/${category.id}`)
                            : undefined
                        }
                        onEdit={
                          canUpdate
                            ? () =>
                                navigate(
                                  `/dashboard/categories/${category.id}/edit`,
                                )
                            : undefined
                        }
                        onDelete={
                          canDelete
                            ? () => setPendingDelete(category)
                            : undefined
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
          pendingDelete
            ? `“${deleteTitle}” kateqoriyası silinəcək.`
            : ''
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
