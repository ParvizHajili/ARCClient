import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/types'
import {
  getPermissionModules,
  getUserById,
  updateUser,
  type PermissionModule,
} from '../../api/users'
import { PermissionPicker } from '../components/PermissionPicker'

export function UserEditPage() {
  const { id } = useParams()
  const userId = Number(id)
  const navigate = useNavigate()

  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [permissionCodes, setPermissionCodes] = useState<string[]>([])
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [modules, setModules] = useState<PermissionModule[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!Number.isFinite(userId)) {
        setError('İstifadəçi tapılmadı.')
        setLoading(false)
        return
      }

      try {
        const [user, permissionModules] = await Promise.all([
          getUserById(userId),
          getPermissionModules(),
        ])
        if (cancelled) return

        setUserName(user.userName)
        setEmail(user.email)
        setFirstName(user.firstName)
        setLastName(user.lastName)
        setIsActive(user.isActive)
        setPermissionCodes(user.permissionCodes)
        setIsSuperAdmin(
          user.roles.some((r) => r.toUpperCase() === 'SUPERADMIN'),
        )
        setModules(permissionModules)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Məlumatlar yüklənərkən xəta baş verdi.',
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!email.trim() || !firstName.trim() || !lastName.trim()) {
      setError('Ad, soyad və e-poçt mütləqdir.')
      return
    }

    setSubmitting(true)
    try {
      const updated = await updateUser(userId, {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isActive,
        password: password.trim() || null,
        permissionCodes: isSuperAdmin ? [] : permissionCodes,
      })
      navigate('/dashboard/users', {
        replace: true,
        state: { success: `“${updated.displayName}” yeniləndi.` },
      })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.errors)
      } else {
        setError('Gözlənilməz xəta baş verdi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="dash-page">
        <p className="dash-empty">Yüklənir…</p>
      </div>
    )
  }

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">İstifadəçini düzəlt</h1>
          <p className="dash-page__lead">{userName}</p>
        </div>
        <Link to="/dashboard/users" className="dash-btn dash-btn--ghost">
          Siyahıya qayıt
        </Link>
      </header>

      <form className="dash-form" onSubmit={onSubmit} noValidate>
        {error && (
          <div className="dash-alert dash-alert--error" role="alert">
            {error}
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="dash-alert__list">
                {Object.entries(fieldErrors).flatMap(([, messages]) =>
                  messages.map((msg) => <li key={msg}>{msg}</li>),
                )}
              </ul>
            )}
          </div>
        )}

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Hesab məlumatları</h2>
          </div>
          <div className="dash-form__grid">
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="edit-username">
                İstifadəçi adı
              </label>
              <input
                id="edit-username"
                className="dash-input"
                value={userName}
                disabled
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="edit-email">
                E-poçt *
              </label>
              <input
                id="edit-email"
                className="dash-input"
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="edit-firstname">
                Ad *
              </label>
              <input
                id="edit-firstname"
                className="dash-input"
                value={firstName}
                onChange={(ev) => setFirstName(ev.target.value)}
                required
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="edit-lastname">
                Soyad *
              </label>
              <input
                id="edit-lastname"
                className="dash-input"
                value={lastName}
                onChange={(ev) => setLastName(ev.target.value)}
                required
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="edit-password">
                Yeni parol
              </label>
              <input
                id="edit-password"
                className="dash-input"
                type="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                autoComplete="new-password"
                placeholder="Boş saxlasanız dəyişməz"
              />
            </div>
          </div>

          <label className="dash-check" htmlFor="edit-active">
            <input
              id="edit-active"
              type="checkbox"
              checked={isActive}
              onChange={(ev) => setIsActive(ev.target.checked)}
            />
            <span>Hesab aktiv olsun</span>
          </label>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">İcazələr</h2>
            <p className="dash-panel__hint">
              {isSuperAdmin
                ? 'SUPERADMIN bütün icazələrə malikdir; fərdi seçim tətbiq olunmur.'
                : 'İstədiyiniz əməliyyat icazələrini seçin və ya çıxarın.'}
            </p>
          </div>
          <PermissionPicker
            modules={modules}
            selected={
              isSuperAdmin
                ? modules.flatMap((m) => m.permissions.map((p) => p.code))
                : permissionCodes
            }
            disabled={isSuperAdmin}
            onChange={setPermissionCodes}
          />
        </section>

        <div className="dash-form__actions">
          <button
            type="submit"
            className="dash-btn dash-btn--primary"
            disabled={submitting}
          >
            {submitting ? 'Saxlanılır…' : 'Yadda saxla'}
          </button>
        </div>
      </form>
    </div>
  )
}
