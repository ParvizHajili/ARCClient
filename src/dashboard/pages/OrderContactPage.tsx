import { useEffect, useState, type FormEvent } from 'react'
import {
  getOrderContact,
  saveOrderContact,
} from '../../api/orderContact'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { SuccessToast } from '../components/SuccessToast'
import { toastUpdated, type DashToastPayload } from '../toast'

export function OrderContactPage() {
  const { can } = useAuth()
  const canUpdate = can('OrderContact.Update')
  const [whatsAppNumber, setWhatsAppNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [toast, setToast] = useState<DashToastPayload | null>(null)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const data = await getOrderContact()
        if (!active) return
        setWhatsAppNumber(data.whatsAppNumber ?? '')
        setPhoneNumber(data.phoneNumber ?? '')
        setEmail(data.email ?? '')
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Sifariş əlaqə məlumatları yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canUpdate) return
    setSaving(true)
    setError(null)
    setFieldErrors({})
    setToast(null)
    try {
      const data = await saveOrderContact({
        whatsAppNumber: whatsAppNumber.trim() || null,
        phoneNumber: phoneNumber.trim() || null,
        email: email.trim() || null,
      })
      setWhatsAppNumber(data.whatsAppNumber ?? '')
      setPhoneNumber(data.phoneNumber ?? '')
      setEmail(data.email ?? '')
      setToast(toastUpdated('Sifariş əlaqə məlumatları'))
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.errors)
      } else {
        setError('Saxlanarkən xəta baş verdi.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dash-page">
      <header className="dash-page__header">
        <h1 className="dash-page__title">Sifariş üçün əlaqə məlumatları</h1>
        <p className="dash-page__lead">
          Məhsul səhifəsində görünən WhatsApp, zəng və email. Yalnız doldurulan
          kanallar göstərilir — hamısı istəyə bağlıdır.
        </p>
      </header>

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

      {loading ? (
        <p className="dash-empty">Yüklənir…</p>
      ) : (
        <form className="dash-form" onSubmit={(e) => void onSubmit(e)} noValidate>
          <section className="dash-panel">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Kanallar</h2>
            </div>
            <div className="dash-form__grid">
              <div className="dash-field">
                <label className="dash-field__label" htmlFor="order-wa">
                  WhatsApp nömrəsi
                </label>
                <input
                  id="order-wa"
                  className="dash-input"
                  type="text"
                  maxLength={40}
                  placeholder="+994 70 xxx-xx-xx"
                  value={whatsAppNumber}
                  disabled={!canUpdate}
                  onChange={(ev) => setWhatsAppNumber(ev.target.value)}
                />
              </div>
              <div className="dash-field">
                <label className="dash-field__label" htmlFor="order-phone">
                  Zəng nömrəsi
                </label>
                <input
                  id="order-phone"
                  className="dash-input"
                  type="text"
                  maxLength={40}
                  placeholder="+994 70 xxx-xx-xx"
                  value={phoneNumber}
                  disabled={!canUpdate}
                  onChange={(ev) => setPhoneNumber(ev.target.value)}
                />
              </div>
              <div className="dash-field dash-field--span-2">
                <label className="dash-field__label" htmlFor="order-email">
                  Email
                </label>
                <input
                  id="order-email"
                  className="dash-input"
                  type="email"
                  maxLength={200}
                  placeholder="info@example.com"
                  value={email}
                  disabled={!canUpdate}
                  onChange={(ev) => setEmail(ev.target.value)}
                />
              </div>
            </div>
          </section>

          {canUpdate && (
            <div className="dash-form__actions">
              <button
                type="submit"
                className="dash-btn dash-btn--primary"
                disabled={saving}
              >
                {saving ? 'Saxlanılır…' : 'Saxla'}
              </button>
            </div>
          )}
        </form>
      )}

      <SuccessToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
