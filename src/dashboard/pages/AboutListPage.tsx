import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAboutList, type AboutDetail } from '../../api/about'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { CategoryActionsMenu } from '../components/CategoryActionsMenu'
import { SuccessToast } from '../components/SuccessToast'
import { readToastFromLocationState, type DashToastPayload } from '../toast'

function titleOf(item: AboutDetail, code: string) {
  return (
    item.translations.find((t) => t.languageCode === code)?.title ??
    item.translations[0]?.title ??
    '—'
  )
}

export function AboutListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { can } = useAuth()
  const canCreate = can('About.Create')
  const canView = can('About.View')
  const canUpdate = can('About.Update')
  const [items, setItems] = useState<AboutDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<DashToastPayload | null>(null)

  useEffect(() => {
    const incoming = readToastFromLocationState(location.state)
    if (incoming) {
      setToast(incoming)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAboutList()
      setItems(result)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Haqqımızda yüklənərkən xəta baş verdi.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const hasAbout = items.length > 0
  const createDisabled = hasAbout || !canCreate

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">Haqqımızda</h1>
          <p className="dash-page__lead">
            Ana səhifədəki Haqqımızda bölməsi. Yalnız bir qeyd ola bilər.
          </p>
        </div>
        {canCreate && (
          <Link
            to="/dashboard/about/create"
            className={`dash-btn dash-btn--primary${createDisabled ? ' is-disabled' : ''}`}
            aria-disabled={createDisabled}
            tabIndex={createDisabled ? -1 : undefined}
            onClick={(event) => {
              if (createDisabled) event.preventDefault()
            }}
            title={
              hasAbout
                ? 'Haqqımızda artıq mövcuddur. Yalnız düzəliş edə bilərsiniz.'
                : undefined
            }
          >
            Yeni haqqımızda
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
            <p>Hələ Haqqımızda məzmunu yoxdur.</p>
            {canCreate && (
              <Link
                to="/dashboard/about/create"
                className="dash-btn dash-btn--ghost"
              >
                İlk məzmunu yarat
              </Link>
            )}
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Şəkil</th>
                  <th>AZ</th>
                  <th>EN</th>
                  <th>RU</th>
                  <th className="dash-table__actions-col">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="dash-table__thumb">
                        <img src={item.image} alt="" width={52} height={52} />
                      </div>
                    </td>
                    <td>
                      <span className="dash-table__name">
                        {titleOf(item, 'az')}
                      </span>
                    </td>
                    <td>{titleOf(item, 'en')}</td>
                    <td>{titleOf(item, 'ru')}</td>
                    <td className="dash-table__actions-col">
                      <CategoryActionsMenu
                        onView={
                          canView
                            ? () => navigate(`/dashboard/about/${item.id}`)
                            : undefined
                        }
                        onEdit={
                          canUpdate
                            ? () =>
                                navigate(`/dashboard/about/${item.id}/edit`)
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

      <SuccessToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
