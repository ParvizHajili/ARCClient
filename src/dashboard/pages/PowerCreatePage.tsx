import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createPower } from '../../api/powers'
import { ApiError } from '../../api/types'

export function PowerCreatePage() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const number = Number(value.replace(',', '.'))
    if (!Number.isFinite(number) || number <= 0) {
      setError('Dəyər müsbət rəqəm olmalıdır.')
      return
    }

    setSubmitting(true)
    try {
      const created = await createPower({ value: number })
      navigate('/dashboard/powers', {
        replace: true,
        state: { success: `“${created.value}” uğurla yaradıldı.` },
      })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.errors)
      } else {
        setError('Gözlənilməz xəta baş verdi. Serverin işlədiyini yoxlayın.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dash-page">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">Yeni güc</h1>
        </div>
        <Link to="/dashboard/powers" className="dash-btn dash-btn--ghost">
          Siyahıya qayıt
        </Link>
      </header>

      <form className="dash-form" onSubmit={onSubmit} noValidate>
        {error && (
          <div className="dash-alert dash-alert--error" role="alert">
            {error}
            {Object.keys(fieldErrors).length > 0 && (
              <ul className="dash-alert__list">
                {Object.entries(fieldErrors).flatMap(([key, messages]) =>
                  messages.map((msg) => (
                    <li key={`${key}-${msg}`}>
                      <span>{key}:</span> {msg}
                    </li>
                  )),
                )}
              </ul>
            )}
          </div>
        )}

        <section className="dash-panel">
          <div className="dash-field">
            <label className="dash-field__label" htmlFor="power-value">
              Dəyər *
            </label>
            <input
              id="power-value"
              className="dash-input"
              type="number"
              min="0.001"
              step="any"
              value={value}
              onChange={(ev) => setValue(ev.target.value)}
              required
            />
          </div>
        </section>

        <div className="dash-form__actions">
          <button
            type="submit"
            className="dash-btn dash-btn--primary"
            disabled={submitting}
          >
            {submitting ? 'Yaradılır…' : 'Gücü yarat'}
          </button>
        </div>
      </form>
    </div>
  )
}
