import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [userNameOrEmail, setUserNameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fromState = (location.state as { from?: string } | null)?.from
  const fromQuery = new URLSearchParams(location.search).get('from')
  const redirectTo =
    (fromState && fromState.startsWith('/dashboard')
      ? fromState
      : null) ??
    (fromQuery && fromQuery.startsWith('/dashboard')
      ? fromQuery
      : null) ??
    '/dashboard'

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!userNameOrEmail.trim() || !password) {
      setError('İstifadəçi adı və parol mütləqdir.')
      return
    }

    setSubmitting(true)
    try {
      await login(userNameOrEmail.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Giriş uğursuz oldu. Yenidən cəhd edin.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login">
      <div className="login__backdrop" aria-hidden />
      <div className="login__card">
        <div className="login__brand">
          <p className="login__logo">ARC</p>
        </div>

        <header className="login__header">
          <h1 className="login__title">Daxil olun</h1>
          <p className="login__lead">
            İdarə panelinə keçmək üçün hesab məlumatlarınızı daxil edin.
          </p>
        </header>

        <form className="login__form" onSubmit={onSubmit} noValidate>
          {error && (
            <div className="dash-alert dash-alert--error" role="alert">
              {error}
            </div>
          )}

          <div className="dash-field">
            <label className="dash-field__label" htmlFor="login-user">
              İstifadəçi adı və ya e-poçt
            </label>
            <input
              id="login-user"
              className="dash-input"
              type="text"
              autoComplete="username"
              value={userNameOrEmail}
              onChange={(ev) => setUserNameOrEmail(ev.target.value)}
              required
            />
          </div>

          <div className="dash-field">
            <label className="dash-field__label" htmlFor="login-password">
              Parol
            </label>
            <input
              id="login-password"
              className="dash-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="dash-btn dash-btn--primary login__submit"
            disabled={submitting}
          >
            {submitting ? 'Yoxlanılır…' : 'Daxil ol'}
          </button>
        </form>

        <a href="/" className="login__back">
          Sayta qayıt
        </a>
      </div>
    </div>
  )
}
