import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  getContactInfoList,
  type ContactInfoDetail,
} from '../../api/contactInfo'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { CategoryActionsMenu } from '../components/CategoryActionsMenu'
import { SuccessToast } from '../components/SuccessToast'

export function ContactInfoListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { can } = useAuth()
  const canCreate = can('ContactInfo.Create')
  const canView = can('ContactInfo.View')
  const canUpdate = can('ContactInfo.Update')
  const [items, setItems] = useState<ContactInfoDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const state = location.state as { success?: string } | null
    if (state?.success) {
      setSuccess(state.success)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await getContactInfoList())
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Əlaqə məlumatları yüklənərkən xəta baş verdi.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const hasItem = items.length > 0
  const createDisabled = hasItem || !canCreate

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">Əlaqə məlumatları</h1>
          <p className="dash-page__lead">
            Telefon, Instagram və Facebook. Dilə görə dəyişmir. Yalnız bir qeyd
            ola bilər.
          </p>
        </div>
        {canCreate && (
          <Link
            to="/dashboard/contact-info/create"
            className={`dash-btn dash-btn--primary${createDisabled ? ' is-disabled' : ''}`}
            aria-disabled={createDisabled}
            tabIndex={createDisabled ? -1 : undefined}
            onClick={(event) => {
              if (createDisabled) event.preventDefault()
            }}
            title={
              hasItem
                ? 'Əlaqə məlumatı artıq mövcuddur. Yalnız düzəliş edə bilərsiniz.'
                : undefined
            }
          >
            Yeni əlaqə məlumatı
          </Link>
        )}
      </header>

      {error && (
        <div className="dash-alert dash-alert--error" role="alert">
          {error}
        </div>
      )}

      <section className="dash-panel dash-panel--table">
        {loading ? (
          <p className="dash-empty">Yüklənir…</p>
        ) : items.length === 0 ? (
          <div className="dash-empty dash-empty--stack">
            <p>Hələ əlaqə məlumatı yoxdur.</p>
            {canCreate && (
              <Link
                to="/dashboard/contact-info/create"
                className="dash-btn dash-btn--ghost"
              >
                İlk məlumatı yarat
              </Link>
            )}
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Telefon 1</th>
                  <th>Telefon 2</th>
                  <th>Instagram</th>
                  <th>Facebook</th>
                  <th className="dash-table__actions-col">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="dash-table__name">{item.phone1}</span>
                    </td>
                    <td>{item.phone2 || '—'}</td>
                    <td className="dash-table__truncate">{item.instagramUrl}</td>
                    <td className="dash-table__truncate">{item.facebookUrl}</td>
                    <td className="dash-table__actions-col">
                      <CategoryActionsMenu
                        onView={
                          canView
                            ? () =>
                                navigate(`/dashboard/contact-info/${item.id}`)
                            : undefined
                        }
                        onEdit={
                          canUpdate
                            ? () =>
                                navigate(
                                  `/dashboard/contact-info/${item.id}/edit`,
                                )
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

      <SuccessToast message={success} onDismiss={() => setSuccess(null)} />
    </div>
  )
}
