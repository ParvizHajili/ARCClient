import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getProductSpin,
  saveProductSpin,
  type ProductSpinImage,
} from '../../api/productSpin'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { SpinViewer } from '../components/SpinViewer'

type SavedFrame = {
  key: string
  kind: 'saved'
  id: number
  url: string
}

type NewFrame = {
  key: string
  kind: 'new'
  file: File
  url: string
}

type Frame = SavedFrame | NewFrame

function savedFrames(images: ProductSpinImage[]): Frame[] {
  return images.map((image) => ({
    key: `saved-${image.id}`,
    kind: 'saved',
    id: image.id,
    url: image.imageUrl,
  }))
}

export function ProductSpinEditPage() {
  const { id } = useParams()
  const productId = Number(id)
  const { can } = useAuth()
  const canUpdate = can('Products.Update')
  const [name, setName] = useState('')
  const [frames, setFrames] = useState<Frame[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const framesRef = useRef<Frame[]>([])
  framesRef.current = frames

  useEffect(() => {
    return () => {
      for (const frame of framesRef.current) {
        if (frame.kind === 'new') URL.revokeObjectURL(frame.url)
      }
    }
  }, [])

  useEffect(() => {
    if (!Number.isInteger(productId) || productId < 1) {
      setError('Məhsul tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const spin = await getProductSpin(productId)
        if (!active) return
        setName(spin.name)
        setFrames(savedFrames(spin.images))
      } catch (err) {
        if (!active) return
        setError(
          err instanceof ApiError
            ? err.message
            : '360 şəkillər yüklənərkən xəta baş verdi.',
        )
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [productId])

  const previewUrls = useMemo(() => frames.map((frame) => frame.url), [frames])

  function addFiles(list: FileList | null) {
    const files = Array.from(list ?? [])
    if (files.length === 0) return
    setSaved(false)
    setFrames((current) => [
      ...current,
      ...files.map((file, index) => ({
        key: `new-${file.name}-${file.lastModified}-${index}-${current.length}`,
        kind: 'new' as const,
        file,
        url: URL.createObjectURL(file),
      })),
    ])
  }

  function removeFrame(key: string) {
    setSaved(false)
    setFrames((current) => {
      const frame = current.find((item) => item.key === key)
      if (frame?.kind === 'new') URL.revokeObjectURL(frame.url)
      return current.filter((item) => item.key !== key)
    })
  }

  function moveFrame(index: number, direction: -1 | 1) {
    const next = index + direction
    if (next < 0 || next >= frames.length) return
    setSaved(false)
    setFrames((current) => {
      const copy = [...current]
      const [item] = copy.splice(index, 1)
      copy.splice(next, 0, item)
      return copy
    })
  }

  async function save() {
    if (!canUpdate) return
    setSaving(true)
    setError(null)
    setSaved(false)
    const images: File[] = []
    const keys = frames.map((frame) => {
      if (frame.kind === 'saved') return `e:${frame.id}`
      const index = images.length
      images.push(frame.file)
      return `n:${index}`
    })
    try {
      const spin = await saveProductSpin(productId, keys, images)
      setName(spin.name)
      setFrames(savedFrames(spin.images))
      setSaved(true)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : '360 şəkillər saxlanarkən xəta baş verdi.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">{name || '360 şəkil'}</h1>
        </div>
        <Link to="/dashboard/products/spin" className="dash-btn dash-btn--ghost">
          Siyahıya qayıt
        </Link>
      </header>

      {error && (
        <div className="dash-alert dash-alert--error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="dash-empty">Yüklənir…</p>
      ) : (
        <section className="dash-panel">
          <div className="dash-spin-preview">
            <SpinViewer urls={previewUrls} />
          </div>

          <div className="dash-image-thumbs dash-spin-frames">
            {frames.map((frame, index) => (
              <div key={frame.key} className="dash-spin-frame">
                <img src={frame.url} alt="" />
                <span className="dash-spin-frame__index">{index + 1}</span>
                {canUpdate && (
                  <div className="dash-spin-frame__actions">
                    <button
                      type="button"
                      onClick={() => moveFrame(index, -1)}
                      disabled={index === 0}
                      aria-label="Əvvələ"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFrame(index, 1)}
                      disabled={index === frames.length - 1}
                      aria-label="Sonra"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFrame(frame.key)}
                      aria-label="Sil"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {canUpdate && (
            <div className="dash-spin-actions">
              <label className="dash-btn dash-btn--ghost dash-file-btn">
                Şəkil əlavə et
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(ev) => {
                    addFiles(ev.target.files)
                    ev.target.value = ''
                  }}
                />
              </label>
              <button
                type="button"
                className="dash-btn dash-btn--primary"
                disabled={saving}
                onClick={() => void save()}
              >
                {saving ? 'Saxlanılır…' : 'Saxla'}
              </button>
              {saved && <span className="dash-panel__hint">Saxlanıldı.</span>}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
