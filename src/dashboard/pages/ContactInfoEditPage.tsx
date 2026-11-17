import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getContactInfoById, updateContactInfo } from '../../api/contactInfo'
import { ApiError } from '../../api/types'
import { toastUpdated } from '../toast'

export function ContactInfoEditPage() {
  const { id } = useParams()
  const contactId = Number(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [phone1, setPhone1] = useState('')
  const [phone2, setPhone2] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (!Number.isInteger(contactId) || contactId < 1) {
      setError('Əlaqə məlumatı tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      try {
        const data = await getContactInfoById(contactId)
        if (!active) return
        setPhone1(data.phone1)
        setPhone2(data.phone2 ?? '')
        setInstagramUrl(data.instagramUrl)
        setFacebookUrl(data.facebookUrl)
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Əlaqə məlumatı yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [contactId])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!phone1.trim()) {
      setError('Telefon 1 mütləqdir.')
      return
    }
    if (!instagramUrl.trim() || !facebookUrl.trim()) {
      setError('Instagram və Facebook linkləri mütləqdir.')
      return
    }

    setSubmitting(true)
    try {
      await updateContactInfo(contactId, {
        phone1: phone1.trim(),
        phone2: phone2.trim() || null,
        instagramUrl: instagramUrl.trim(),
        facebookUrl: facebookUrl.trim(),
      })
      navigate('/dashboard/contact-info', {
        replace: true,
        state: { toast: toastUpdated('Əlaqə məlumatı') },
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
          <p className="dash-page__eyebrow">Əlaqə məlumatları</p>
          <h1 className="dash-page__title">Düzəliş et</h1>
        </div>
        <Link to="/dashboard/contact-info" className="dash-btn dash-btn--ghost">
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
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Telefonlar</h2>
          </div>
          <div className="dash-form__grid">
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="ci-edit-phone1">
                Telefon 1 *
              </label>
              <input
                id="ci-edit-phone1"
                className="dash-input"
                type="text"
                maxLength={40}
                value={phone1}
                onChange={(ev) => setPhone1(ev.target.value)}
                required
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="ci-edit-phone2">
                Telefon 2
              </label>
              <input
                id="ci-edit-phone2"
                className="dash-input"
                type="text"
                maxLength={40}
                value={phone2}
                onChange={(ev) => setPhone2(ev.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Sosial linklər</h2>
          </div>
          <div className="dash-form__grid">
            <div className="dash-field dash-field--span-2">
              <label className="dash-field__label" htmlFor="ci-edit-instagram">
                Instagram *
              </label>
              <input
                id="ci-edit-instagram"
                className="dash-input"
                type="url"
                maxLength={500}
                value={instagramUrl}
                onChange={(ev) => setInstagramUrl(ev.target.value)}
                required
              />
            </div>
            <div className="dash-field dash-field--span-2">
              <label className="dash-field__label" htmlFor="ci-edit-facebook">
                Facebook *
              </label>
              <input
                id="ci-edit-facebook"
                className="dash-input"
                type="url"
                maxLength={500}
                value={facebookUrl}
                onChange={(ev) => setFacebookUrl(ev.target.value)}
                required
              />
            </div>
          </div>
        </section>

        <div className="dash-form__actions">
          <button
            type="submit"
            className="dash-btn dash-btn--primary"
            disabled={submitting}
          >
            {submitting ? 'Saxlanılır…' : 'Saxla'}
          </button>
        </div>
      </form>
    </div>
  )
}
