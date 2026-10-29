import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAboutById, type AboutDetail } from '../../api/about'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'

const LANG_LABELS: Record<string, string> = {
  az: 'Azərbaycan',
  en: 'English',
  ru: 'Русский',
}

export function AboutDetailPage() {
  const { id } = useParams()
  const { can } = useAuth()
  const aboutId = Number(id)
  const [item, setItem] = useState<AboutDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isInteger(aboutId) || aboutId < 1) {
      setError('Haqqımızda tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      try {
        const data = await getAboutById(aboutId)
        if (active) setItem(data)
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Haqqımızda yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [aboutId])

  const azTitle =
    item?.translations.find((t) => t.languageCode === 'az')?.title ??
    item?.translations[0]?.title ??
    'Haqqımızda'

  return (
    <div className="dash-page">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">{loading ? 'Haqqımızda' : azTitle}</h1>
        </div>
        <div className="dash-page__actions">
          <Link to="/dashboard/about" className="dash-btn dash-btn--ghost">
            Siyahıya qayıt
          </Link>
          {item && can('About.Update') && (
            <Link
              to={`/dashboard/about/${item.id}/edit`}
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
        <>
          <section className="dash-panel">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Şəkil</h2>
            </div>
            <img
              src={item.image}
              alt=""
              className="dash-about-preview"
              width={600}
              height={480}
            />
          </section>

          {item.translations.map((translation) => (
            <section key={translation.languageCode} className="dash-panel">
              <div className="dash-panel__head">
                <h2 className="dash-panel__title">
                  {LANG_LABELS[translation.languageCode] ??
                    translation.languageCode}
                </h2>
              </div>
              <dl className="dash-dl">
                <div>
                  <dt>Başlıq</dt>
                  <dd style={{ whiteSpace: 'pre-line' }}>{translation.title}</dd>
                </div>
                <div>
                  <dt>Mətn</dt>
                  <dd style={{ whiteSpace: 'pre-line' }}>
                    {translation.description || '—'}
                  </dd>
                </div>
              </dl>
            </section>
          ))}
        </>
      ) : null}
    </div>
  )
}
