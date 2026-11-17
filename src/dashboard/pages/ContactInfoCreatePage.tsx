import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createContactInfo } from '../../api/contactInfo'
import { ApiError } from '../../api/types'
import { toastCreated } from '../toast'

export function ContactInfoCreatePage() {
  const navigate = useNavigate()
  const [phone1, setPhone1] = useState('')
  const [phone2, setPhone2] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

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
      await createContactInfo({
        phone1: phone1.trim(),
        phone2: phone2.trim() || null,
        instagramUrl: instagramUrl.trim(),
        facebookUrl: facebookUrl.trim(),
      })
      navigate('/dashboard/contact-info', {
        replace: true,
        state: { toast: toastCreated('Əlaqə məlumatı') },
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
          <p className="dash-page__eyebrow">Əlaqə məlumatları</p>
          <h1 className="dash-page__title">Yeni məlumat</h1>
          <p className="dash-page__lead">
            1 və ya 2 telefon, Instagram və Facebook linki.
          </p>
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
            <p className="dash-panel__hint">
              Telefon 1 mütləqdir. Telefon 2 istəyə bağlıdır.
            </p>
          </div>
          <div className="dash-form__grid">
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="ci-phone1">
                Telefon 1 *
              </label>
              <input
                id="ci-phone1"
                className="dash-input"
                type="text"
                maxLength={40}
                placeholder="+994 50 123 45 67"
                value={phone1}
                onChange={(ev) => setPhone1(ev.target.value)}
                required
              />
            </div>
            <div className="dash-field">
              <label className="dash-field__label" htmlFor="ci-phone2">
                Telefon 2
              </label>
              <input
                id="ci-phone2"
                className="dash-input"
                type="text"
                maxLength={40}
                placeholder="+994 70 123 45 67"
                value={phone2}
                onChange={(ev) => setPhone2(ev.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head">
            <h2 className="dash-panel__title">Sosial linklər</h2>
            <p className="dash-panel__hint">
              Tam URL yazın (https://…).
            </p>
          </div>
          <div className="dash-form__grid">
            <div className="dash-field dash-field--span-2">
              <label className="dash-field__label" htmlFor="ci-instagram">
                Instagram *
              </label>
              <input
                id="ci-instagram"
                className="dash-input"
                type="url"
                maxLength={500}
                placeholder="https://instagram.com/..."
                value={instagramUrl}
                onChange={(ev) => setInstagramUrl(ev.target.value)}
                required
              />
            </div>
            <div className="dash-field dash-field--span-2">
              <label className="dash-field__label" htmlFor="ci-facebook">
                Facebook *
              </label>
              <input
                id="ci-facebook"
                className="dash-input"
                type="url"
                maxLength={500}
                placeholder="https://facebook.com/..."
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
            {submitting ? 'Yaradılır…' : 'Yarat'}
          </button>
        </div>
      </form>
    </div>
  )
}
