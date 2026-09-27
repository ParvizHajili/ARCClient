import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteDiameter,
  getDiameterById,
  type DiameterDetail,
} from '../../api/diameters'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { ConfirmModal } from '../components/ConfirmModal'

export function DiameterDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const sizeId = Number(id)
  const [item, setItem] = useState<DiameterDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!Number.isInteger(sizeId) || sizeId < 1) {
      setError('Diametr tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      try {
        const data = await getDiameterById(sizeId)
        if (active) setItem(data)
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Diametr yüklənərkən xəta baş verdi.',
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
      await deleteDiameter(item.id)
      navigate('/dashboard/diameters', { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Diametr silinərkən xəta baş verdi.',
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
            {item ? String(item.value) : 'Diametr'}
          </h1>
        </div>
        <div className="dash-page__actions">
          <Link to="/dashboard/diameters" className="dash-btn dash-btn--ghost">
            Siyahıya qayıt
          </Link>
          {item && (
            <>
              {can('Diameters.Update') && (
                <Link
                  to={`/dashboard/diameters/${item.id}/edit`}
                  className="dash-btn dash-btn--ghost"
                >
                  Düzəliş et
                </Link>
              )}
              {can('Diameters.Delete') && (
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
        message={item ? `“${item.value}” diametri silinəcək.` : ''}
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
