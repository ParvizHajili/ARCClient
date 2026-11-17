import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getContactInquiry,
  setInquiryContacted,
  type ContactInquiry,
} from '../../api/contact'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { SuccessToast } from '../components/SuccessToast'
import { toastUpdated, type DashToastPayload } from '../toast'

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
  const { can } = useAuth()
  const canUpdate = can('Inquiries.Update')
  const inquiryId = Number(id)
  const [item, setItem] = useState<ContactInquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingContacted, setSavingContacted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<DashToastPayload | null>(null)

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
        // GET detalda avtomatik oxunmuş işarələnir
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

  async function onContactedChange(checked: boolean) {
    if (!item || !canUpdate) return
    setSavingContacted(true)
    setError(null)
    try {
      const updated = await setInquiryContacted(item.id, checked)
      setItem(updated)
      setToast(
        toastUpdated(
          checked
            ? `${item.name} — əlaqə saxlanıldı`
            : `${item.name} — əlaqə gözləyir`,
        ),
      )
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Status yenilənərkən xəta baş verdi.',
      )
    } finally {
      setSavingContacted(false)
    }
  }

  return (
    <div className="dash-page">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">{item?.name ?? 'Müraciət'}</h1>
          {item ? (
            <p className="dash-page__lead">
              {item.isContacted
                ? 'Əlaqə saxlanılıb'
                : item.isRead
                  ? 'Oxunub — əlaqə gözləyir'
                  : 'Yeni / oxunmayıb'}
            </p>
          ) : null}
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
          <>
            <section className="dash-panel">
              <div className="dash-panel__head">
                <h2 className="dash-panel__title">Müraciət</h2>
                <div className="dash-inquiry-status-row">
                  <span
                    className={[
                      'dash-inquiry-badge',
                      item.isContacted
                        ? 'dash-inquiry-badge--contacted'
                        : item.isRead
                          ? 'dash-inquiry-badge--read'
                          : 'dash-inquiry-badge--unread',
                    ].join(' ')}
                  >
                    {item.isContacted
                      ? 'Əlaqə saxlanıldı'
                      : item.isRead
                        ? 'Oxunub'
                        : 'Oxunmayıb'}
                  </span>
                </div>
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
                {item.readAt ? (
                  <div>
                    <dt>Oxunma vaxtı</dt>
                    <dd>{formatDate(item.readAt)}</dd>
                  </div>
                ) : null}
                {item.contactedAt ? (
                  <div>
                    <dt>Əlaqə vaxtı</dt>
                    <dd>{formatDate(item.contactedAt)}</dd>
                  </div>
                ) : null}
                <div className="dash-inquiry__message-field">
                  <dt>Mesaj</dt>
                  <dd>
                    <p className="dash-inquiry__message">{item.message}</p>
                  </dd>
                </div>
              </dl>
            </section>

            <section className="dash-panel">
              <div className="dash-panel__head">
                <h2 className="dash-panel__title">Əlaqə statusu</h2>
              </div>
              <label className="dash-inquiry-check">
                <input
                  type="checkbox"
                  checked={item.isContacted}
                  disabled={!canUpdate || savingContacted}
                  onChange={(event) =>
                    void onContactedChange(event.target.checked)
                  }
                />
                <span>
                  <strong>Əlaqə saxlanıldı</strong>
                  <span className="dash-inquiry-check__hint">
                    {canUpdate
                      ? 'Müştəri ilə əlaqə saxlanılandan sonra işarələyin.'
                      : 'Bu statusu dəyişmək üçün Inquiries.Update icazəsi lazımdır.'}
                  </span>
                </span>
              </label>
            </section>
          </>
        )
      )}

      <SuccessToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
