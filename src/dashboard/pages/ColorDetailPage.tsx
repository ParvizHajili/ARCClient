import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteColor,
  getColorById,
  type ColorDetail,
} from '../../api/colors'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { ConfirmModal } from '../components/ConfirmModal'

function nameOf(item: ColorDetail, code: string) {
  return (
    item.translations.find((t) => t.languageCode === code)?.name ?? '—'
  )
}

export function ColorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const colorId = Number(id)
  const [item, setItem] = useState<ColorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!Number.isInteger(colorId) || colorId < 1) {
      setError('Rəng tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      try {
        const data = await getColorById(colorId)
        if (active) setItem(data)
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Rəng yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [colorId])

  async function confirmDelete() {
    if (!item) return
    setDeleting(true)
    try {
      await deleteColor(item.id)
      navigate('/dashboard/colors', { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Rəng silinərkən xəta baş verdi.',
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
            {item ? nameOf(item, 'az') : 'Rəng'}
          </h1>
        </div>
        <div className="dash-page__actions">
          <Link to="/dashboard/colors" className="dash-btn dash-btn--ghost">
            Siyahıya qayıt
          </Link>
          {item && (
            <>
              {can('Colors.Update') && (
                <Link
                  to={`/dashboard/colors/${item.id}/edit`}
                  className="dash-btn dash-btn--ghost"
                >
                  Düzəliş et
                </Link>
              )}
              {can('Colors.Delete') && (
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
        <>
          <section className="dash-panel">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Rəng</h2>
            </div>
            <div className="dash-color-cell">
              <span
                className="dash-color-swatch dash-color-swatch--lg"
                style={{ backgroundColor: item.hexCode }}
                aria-hidden
              />
              <code>{item.hexCode}</code>
            </div>
          </section>

          <section className="dash-panel" style={{ marginTop: 18 }}>
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Tərcümələr</h2>
            </div>
            <div className="dash-detail__langs">
              {(['az', 'en', 'ru'] as const).map((code) => (
                <div key={code} className="dash-detail__lang">
                  <span>{code.toUpperCase()}</span>
                  <strong>{nameOf(item, code)}</strong>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <ConfirmModal
        open={deleteOpen}
        title="Silmək istədiyinizə əminsiniz?"
        message={item ? `“${nameOf(item, 'az')}” rəngi silinəcək.` : ''}
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
