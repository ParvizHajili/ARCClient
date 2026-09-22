import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/types'
import {
  createUser,
  getPermissionModules,
  type PermissionModule,
} from '../../api/users'
import { PermissionPicker } from '../components/PermissionPicker'

export function UserCreatePage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [permissionCodes, setPermissionCodes] = useState<string[]>([])
  const [modules, setModules] = useState<PermissionModule[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await getPermissionModules()
        if (!cancelled) setModules(data)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'İcazələr yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (!cancelled) setLoadingPermissions(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (
      !userName.trim() ||
      !email.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !password
    ) {
      setError('Bütün məcburi sahələri doldurun.')
      return
    }

    setSubmitting(true)
    try {
      const created = await createUser({
        userName: userName.trim(),
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
        isActive,
        permissionCodes,
      })
      navigate('/dashboard/users', {
        replace: true,
        state: { success: `“${created.displayName}” uğurla yaradıldı.` },
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

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">Yeni istifadəçi</h1>
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
              <label className="dash-field__label" htmlFor="user-username">
                İstifadəçi adı *
              </label>
              <input
                id="user-username"
                className="dash-input"
                value={userName}
                onChange={(ev) => setUserName(ev.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="user-email">
                E-poçt *
              </label>
              <input
                id="user-email"
                className="dash-input"
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="user-firstname">
                Ad *
              </label>
              <input
                id="user-firstname"
                className="dash-input"
                value={firstName}
                onChange={(ev) => setFirstName(ev.target.value)}
                required
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="user-lastname">
                Soyad *
              </label>
              <input
                id="user-lastname"
                className="dash-input"
                value={lastName}
                onChange={(ev) => setLastName(ev.target.value)}
                required
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="user-password">
                Parol *
              </label>
              <input
                id="user-password"
                className="dash-input"
                type="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <label className="dash-check" htmlFor="user-active">
            <input
              id="user-active"
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
              İstifadəçinin edə biləcəyi əməliyyatları seçin. Məsələn, yalnız
              siyahıya baxa bilər, yaratma və düzəliş bağlı qala bilər.
            </p>
          </div>
          {loadingPermissions ? (
            <p className="dash-empty">İcazələr yüklənir…</p>
          ) : (
            <PermissionPicker
              modules={modules}
              selected={permissionCodes}
              onChange={setPermissionCodes}
            />
          )}
        </section>

        <div className="dash-form__actions">
          <button
            type="submit"
            className="dash-btn dash-btn--primary"
            disabled={submitting || loadingPermissions}
          >
            {submitting ? 'Yaradılır…' : 'İstifadəçini yarat'}
          </button>
        </div>
      </form>
    </div>
  )
}
