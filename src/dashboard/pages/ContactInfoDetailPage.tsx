import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getContactInfoById,
  type ContactInfoDetail,
} from '../../api/contactInfo'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'

export function ContactInfoDetailPage() {
  const { id } = useParams()
  const { can } = useAuth()
  const contactId = Number(id)
  const [item, setItem] = useState<ContactInfoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        if (active) setItem(data)
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

  return (
    <div className="dash-page">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">Əlaqə məlumatları</h1>
        </div>
        <div className="dash-page__actions">
          <Link
            to="/dashboard/contact-info"
            className="dash-btn dash-btn--ghost"
          >
            Siyahıya qayıt
          </Link>
          {item && can('ContactInfo.Update') && (
            <Link
              to={`/dashboard/contact-info/${item.id}/edit`}
              className="dash-btn dash-btn--ghost"
            >
              Düzəliş et
            </Link>
          )}
        </div>
      </header>

      {error && (
        <div className="dash-alert dash-alert--error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="dash-empty">Yüklənir…</p>
      ) : item ? (
        <section className="dash-panel">
          <dl className="dash-dl">
            <div>
              <dt>Telefon 1</dt>
              <dd>{item.phone1}</dd>
            </div>
            <div>
              <dt>Telefon 2</dt>
              <dd>{item.phone2 || '—'}</dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd>
                <a href={item.instagramUrl} target="_blank" rel="noreferrer">
                  {item.instagramUrl}
                </a>
              </dd>
            </div>
            <div>
              <dt>Facebook</dt>
              <dd>
                <a href={item.facebookUrl} target="_blank" rel="noreferrer">
                  {item.facebookUrl}
                </a>
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  )
}
