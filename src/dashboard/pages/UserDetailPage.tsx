import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/types'
import { deleteUser, getUserById, type UserDetail } from '../../api/users'
import { useAuth } from '../../auth/AuthContext'
import { ConfirmModal } from '../components/ConfirmModal'

export function UserDetailPage() {
  const { id } = useParams()
  const userId = Number(id)
  const navigate = useNavigate()
  const { can, user: currentUser } = useAuth()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!Number.isFinite(userId)) {
        setError('İstifadəçi tapılmadı.')
        setLoading(false)
        return
      }
      try {
        const data = await getUserById(userId)
        if (!cancelled) setUser(data)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'İstifadəçi yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  async function confirmDelete() {
    if (!user) return
    setDeleting(true)
    try {
      await deleteUser(user.id)
      navigate('/dashboard/users', {
        replace: true,
        state: { success: `“${user.displayName}” silindi.` },
      })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'İstifadəçi silinərkən xəta baş verdi.',
      )
      setPendingDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="dash-page">
        <p className="dash-empty">Yüklənir…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="dash-page">
        <div className="dash-alert dash-alert--error" role="alert">
          {error ?? 'İstifadəçi tapılmadı.'}
        </div>
        <Link to="/dashboard/users" className="dash-btn dash-btn--ghost">
          Siyahıya qayıt
        </Link>
      </div>
    )
  }

  const isSelf = currentUser?.id === user.id
  const isSuper = user.roles.some((r) => r.toUpperCase() === 'SUPERADMIN')

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">{user.displayName}</h1>
          <p className="dash-page__lead">@{user.userName}</p>
        </div>
        <div className="dash-page__actions">
          <Link to="/dashboard/users" className="dash-btn dash-btn--ghost">
            Siyahıya qayıt
          </Link>
          {can('Users.Update') && (
            <Link
              to={`/dashboard/users/${user.id}/edit`}
              className="dash-btn dash-btn--primary"
            >
              Düzəliş et
            </Link>
          )}
          {can('Users.Delete') && !isSelf && !isSuper && (
            <button
              type="button"
              className="dash-btn dash-btn--danger"
              onClick={() => setPendingDelete(true)}
            >
              Sil
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="dash-alert dash-alert--error" role="alert">
          {error}
        </div>
      )}

      <section className="dash-panel">
        <div className="dash-panel__head">
          <h2 className="dash-panel__title">Məlumatlar</h2>
        </div>
        <dl className="dash-dl">
          <div>
            <dt>Ad</dt>
            <dd>{user.firstName}</dd>
          </div>
          <div>
            <dt>Soyad</dt>
            <dd>{user.lastName}</dd>
          </div>
          <div>
            <dt>E-poçt</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span
                className={`dash-badge${user.isActive ? ' dash-badge--success' : ' dash-badge--muted'}`}
              >
                {user.isActive ? 'Aktiv' : 'Deaktiv'}
              </span>
            </dd>
          </div>
          <div>
            <dt>Rollar</dt>
            <dd>{user.roles.length > 0 ? user.roles.join(', ') : '—'}</dd>
          </div>
          <div>
            <dt>Yaradılma</dt>
            <dd>{new Date(user.createDate).toLocaleString('az-AZ')}</dd>
          </div>
        </dl>
      </section>

      <section className="dash-panel">
        <div className="dash-panel__head">
          <h2 className="dash-panel__title">Effektive icazələr</h2>
          <p className="dash-panel__hint">
            Rol və birbaşa verilmiş icazələrin birləşməsi.
          </p>
        </div>
        {user.effectivePermissions.length === 0 ? (
          <p className="dash-empty">İcazə yoxdur.</p>
        ) : (
          <ul className="perm-chips">
            {user.effectivePermissions.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmModal
        open={pendingDelete}
        title="Silmək istədiyinizə əminsiniz?"
        message={`“${user.displayName}” istifadəçisi silinəcək.`}
        confirmLabel="Sil"
        cancelLabel="Ləğv et"
        confirming={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleting) setPendingDelete(false)
        }}
      />
    </div>
  )
}
