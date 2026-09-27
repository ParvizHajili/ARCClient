import { useEffect, useState, type FormEvent } from 'react'
import { getHeroVideo, saveHeroVideo } from '../../api/heroVideo'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'

export function HeroVideoPage() {
  const { can } = useAuth()
  const canUpdate = can('HeroVideo.Update')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const data = await getHeroVideo()
        if (active) setVideoUrl(data.videoUrl)
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Video yüklənərkən xəta baş verdi.',
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

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!file || !canUpdate) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const data = await saveHeroVideo(file)
      setVideoUrl(data.videoUrl)
      setFile(null)
      setSaved(true)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Video saxlanarkən xəta baş verdi.',
      )
    } finally {
      setSaving(false)
    }
  }

  const shownUrl = previewUrl ?? videoUrl

  return (
    <div className="dash-page">
      <header className="dash-page__header">
        <h1 className="dash-page__title">Ana video</h1>
        <p className="dash-page__lead">
          Navbarın altındakı hissə üçün bir video. Qısa olsun, səhifədə fasiləsiz təkrarlanır.
        </p>
      </header>

      {error && (
        <div className="dash-alert dash-alert--error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="dash-empty">Yüklənir…</p>
      ) : (
        <form className="dash-form" onSubmit={(event) => void onSubmit(event)}>
          <section className="dash-panel">
            {shownUrl ? (
              <video
                key={shownUrl}
                className="dash-hero-video"
                src={shownUrl}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <p className="dash-empty">Hələ video yoxdur.</p>
            )}

            {canUpdate && (
              <div className="dash-spin-actions">
                <label className="dash-btn dash-btn--ghost dash-file-btn">
                  {videoUrl ? 'Videonu dəyiş' : 'Video yüklə'}
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    hidden
                    onChange={(event) => {
                      setFile(event.target.files?.[0] ?? null)
                      setSaved(false)
                      event.target.value = ''
                    }}
                  />
                </label>
                <button
                  type="submit"
                  className="dash-btn dash-btn--primary"
                  disabled={!file || saving}
                >
                  {saving ? 'Yüklənir…' : 'Saxla'}
                </button>
                {saved && <span className="dash-panel__hint">Saxlanıldı.</span>}
              </div>
            )}
          </section>
        </form>
      )}
    </div>
  )
}
