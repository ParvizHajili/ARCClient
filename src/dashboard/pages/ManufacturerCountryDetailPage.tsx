import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteManufacturerCountry,
  getManufacturerCountryById,
  type ManufacturerCountryDetail,
} from '../../api/manufacturerCountries'
import { ApiError } from '../../api/types'
import { ConfirmModal } from '../components/ConfirmModal'

function nameOf(item: ManufacturerCountryDetail, code: string) {
  return (
    item.translations.find((t) => t.languageCode === code)?.name ?? '—'
  )
}

export function ManufacturerCountryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const countryId = Number(id)
  const [item, setItem] = useState<ManufacturerCountryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!Number.isInteger(countryId) || countryId < 1) {
      setError('Ölkə tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      try {
        const data = await getManufacturerCountryById(countryId)
        if (active) setItem(data)
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Ölkə yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [countryId])

  async function confirmDelete() {
    if (!item) return
    setDeleting(true)
    try {
      await deleteManufacturerCountry(item.id)
      navigate('/dashboard/manufacturer-countries', { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Ölkə silinərkən xəta baş verdi.',
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
            {item ? nameOf(item, 'az') : 'Ölkə'}
          </h1>
        </div>
        <div className="dash-page__actions">
          <Link
            to="/dashboard/manufacturer-countries"
            className="dash-btn dash-btn--ghost"
          >
            Siyahıya qayıt
          </Link>
          {item && (
            <>
              <Link
                to={`/dashboard/manufacturer-countries/${item.id}/edit`}
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
      ) : item ? (
        <section className="dash-panel">
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
      ) : null}

      <ConfirmModal
        open={deleteOpen}
        title="Silmək istədiyinizə əminsiniz?"
        message={item ? `“${nameOf(item, 'az')}” ölkəsi silinəcək.` : ''}
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
