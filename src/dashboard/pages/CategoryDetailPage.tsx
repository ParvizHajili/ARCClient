import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteCategory, getCategoryById } from '../../api/categories'
import { ApiError, type CategoryDetail } from '../../api/types'
import { ConfirmModal } from '../components/ConfirmModal'

function nameOf(category: CategoryDetail, code: string) {
  return (
    category.translations.find((t) => t.languageCode === code)?.name ?? '—'
  )
}

export function CategoryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const categoryId = Number(id)

  const [category, setCategory] = useState<CategoryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
        if (active) setCategory(data)
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

  async function confirmDelete() {
    if (!category) return

    setDeleting(true)
    setError(null)
    try {
      await deleteCategory(category.id)
      navigate('/dashboard/categories', { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Kateqoriya silinərkən xəta baş verdi.',
      )
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="dash-page">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <p className="dash-page__eyebrow">Kateqoriyalar</p>
          <h1 className="dash-page__title">
            {category ? nameOf(category, 'az') : 'Kateqoriya'}
          </h1>
          <p className="dash-page__lead">Kateqoriya məlumatlarına baxış.</p>
        </div>
        <div className="dash-page__actions">
          <Link to="/dashboard/categories" className="dash-btn dash-btn--ghost">
            Siyahıya qayıt
          </Link>
          {category && (
            <>
              <Link
                to={`/dashboard/categories/${category.id}/edit`}
                className="dash-btn dash-btn--ghost"
              >
                Düzəliş et
              </Link>
              <button
                type="button"
                className="dash-btn dash-btn--danger"
                onClick={() => setDeleteOpen(true)}
              >
                Sil
              </button>
            </>
          )}
        </div>
      </header>

      {error && (
        <div className="dash-alert dash-alert--error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="dash-empty">Yüklənir…</p>
      ) : category ? (
        <div className="dash-detail">
          <section className="dash-panel">
            <div className="dash-detail__hero">
              <img
                src={category.image}
                alt={nameOf(category, 'az')}
                className="dash-detail__image"
              />
              <div className="dash-detail__meta">
                <div className="dash-detail__stat">
                  <span>ID</span>
                  <strong>{category.id}</strong>
                </div>
                <div className="dash-detail__stat">
                  <span>Sıra</span>
                  <strong>{category.order}</strong>
                </div>
                <div className="dash-detail__stat">
                  <span>Alt kateqoriya</span>
                  <strong>{category.subCategories.length}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="dash-panel">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Tərcümələr</h2>
            </div>
            <div className="dash-detail__langs">
              {(['az', 'en', 'ru'] as const).map((code) => (
                <div key={code} className="dash-detail__lang">
                  <span>{code.toUpperCase()}</span>
                  <strong>{nameOf(category, code)}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="dash-panel">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Alt kateqoriyalar</h2>
            </div>
            {category.subCategories.length === 0 ? (
              <p className="dash-empty">Alt kateqoriya yoxdur.</p>
            ) : (
              <ul className="dash-detail__subs">
                {category.subCategories.map((sub) => (
                  <li key={sub.id}>
                    <span className="dash-detail__sub-id">#{sub.id}</span>
                    <div>
                      {(['az', 'en', 'ru'] as const).map((code) => (
                        <p key={code}>
                          <em>{code.toUpperCase()}</em>{' '}
                          {sub.translations.find((t) => t.languageCode === code)
                            ?.name ?? '—'}
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      <ConfirmModal
        open={deleteOpen}
        title="Silmək istədiyinizə əminsiniz?"
        message={
          category
            ? `“${nameOf(category, 'az')}” kateqoriyası silinəcək.`
            : ''
        }
        confirmLabel="Sil"
        cancelLabel="Ləğv et"
        confirming={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleting) setDeleteOpen(false)
        }}
      />
    </div>
  )
}
