import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deletePower,
  getPowerById,
  type PowerDetail,
} from '../../api/powers'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { ConfirmModal } from '../components/ConfirmModal'

export function PowerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const sizeId = Number(id)
  const [item, setItem] = useState<PowerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!Number.isInteger(sizeId) || sizeId < 1) {
      setError('Güc tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      try {
        const data = await getPowerById(sizeId)
        if (active) setItem(data)
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Güc yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [sizeId])

  async function confirmDelete() {
    if (!item) return
    setDeleting(true)
    try {
      await deletePower(item.id)
      navigate('/dashboard/powers', { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Güc silinərkən xəta baş verdi.',
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
          <h1 className="dash-page__title">
            {item ? String(item.value) : 'Güc (amper)'}
          </h1>
        </div>
        <div className="dash-page__actions">
          <Link to="/dashboard/powers" className="dash-btn dash-btn--ghost">
            Siyahıya qayıt
          </Link>
          {item && (
            <>
              {can('Powers.Update') && (
                <Link
                  to={`/dashboard/powers/${item.id}/edit`}
                  className="dash-btn dash-btn--ghost"
                >
                  Düzəliş et
                </Link>
              )}
              {can('Powers.Delete') && (
                <button
                  type="button"
                  className="dash-btn dash-btn--danger"
                  onClick={() => setDeleteOpen(true)}
                >
                  Sil
                </button>
              )}
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
      ) : item ? (
        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Dəyər</h2>
          </div>
          <p>{item.value}</p>
        </section>
      ) : null}

      <ConfirmModal
        open={deleteOpen}
        title="Silmək istədiyinizə əminsiniz?"
        message={item ? `“${item.value}” gücü silinəcək.` : ''}
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
