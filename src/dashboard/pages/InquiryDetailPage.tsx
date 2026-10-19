import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getContactInquiry, type ContactInquiry } from '../../api/contact'
import { ApiError } from '../../api/types'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('az-AZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function InquiryDetailPage() {
  const { id } = useParams()
  const inquiryId = Number(id)
  const [item, setItem] = useState<ContactInquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isInteger(inquiryId) || inquiryId < 1) {
      setError('Müraciət tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      try {
        const data = await getContactInquiry(inquiryId)
        if (active) setItem(data)
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Müraciət yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [inquiryId])

  return (
    <div className="dash-page">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">{item?.name ?? 'Müraciət'}</h1>
        </div>
        <div className="dash-page__actions">
          <Link to="/dashboard/inquiries" className="dash-btn dash-btn--ghost">
            Siyahıya qayıt
          </Link>
        </div>
      </header>

      {error && (
        <div className="dash-alert dash-alert--error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="dash-empty">Yüklənir…</p>
      ) : (
        item && (
          <section className="dash-panel">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Müraciət</h2>
            </div>
            <dl className="dash-dl">
              <div>
                <dt>Tarix</dt>
                <dd>{formatDate(item.createDate)}</dd>
              </div>
              <div>
                <dt>Ad</dt>
                <dd>{item.name}</dd>
              </div>
              <div>
                <dt>Telefon</dt>
                <dd>{item.phone || '—'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{item.email || '—'}</dd>
              </div>
              <div className="dash-inquiry__message-field">
                <dt>Mesaj</dt>
                <dd>
                  <p className="dash-inquiry__message">{item.message}</p>
                </dd>
              </div>
            </dl>
          </section>
        )
      )}
    </div>
  )
}
