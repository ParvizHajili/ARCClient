import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDiameterById, updateDiameter } from '../../api/diameters'
import { ApiError } from '../../api/types'

export function DiameterEditPage() {
  const { id } = useParams()
  const diameterId = Number(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (!Number.isInteger(diameterId) || diameterId < 1) {
      setError('Diametr tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      try {
        const item = await getDiameterById(diameterId)
        if (active) setValue(String(item.value))
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
  }, [diameterId])

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
      await updateDiameter(diameterId, { value: number })
      navigate('/dashboard/diameters', { replace: true })
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

  if (loading) {
    return (
      <div className="dash-page">
        <p className="dash-empty">Yüklənir…</p>
      </div>
    )
  }

  return (
    <div className="dash-page">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">Diametri düzəliş et</h1>
        </div>
        <Link to="/dashboard/diameters" className="dash-btn dash-btn--ghost">
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
            <label className="dash-field__label" htmlFor="diameter-value">
              Dəyər *
            </label>
            <input
              id="diameter-value"
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
            {submitting ? 'Saxlanılır…' : 'Dəyişiklikləri saxla'}
          </button>
        </div>
      </form>
    </div>
  )
}
