import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  deleteProduct,
  getProductById,
  type ProductDetail,
} from '../../api/products'
import { ApiError } from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { ConfirmModal } from '../components/ConfirmModal'

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const productId = Number(id)
  const [item, setItem] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!Number.isInteger(productId) || productId < 1) {
      setError('Məhsul tapılmadı.')
      setLoading(false)
      return
    }

    let active = true
    void (async () => {
      setLoading(true)
      try {
        const data = await getProductById(productId)
        if (active) setItem(data)
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Məhsul yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [productId])

  async function confirmDelete() {
    if (!item) return
    setDeleting(true)
    try {
      await deleteProduct(item.id)
      navigate('/dashboard/products', { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Məhsul silinərkən xəta baş verdi.',
      )
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  const azName =
    item?.translations.find((t) => t.languageCode === 'az')?.name ?? 'Məhsul'

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header dash-page__header--row">
        <div>
          <h1 className="dash-page__title">{item ? azName : 'Məhsul'}</h1>
          {item && <p className="dash-page__lead">Kod: {item.code}</p>}
        </div>
        <div className="dash-page__actions">
          <Link to="/dashboard/products" className="dash-btn dash-btn--ghost">
            Siyahıya qayıt
          </Link>
          {item && (
            <>
              {can('Products.Update') && (
                <Link
                  to={`/dashboard/products/${item.id}/edit`}
                  className="dash-btn dash-btn--ghost"
                >
                  Düzəliş et
                </Link>
              )}
              {can('Products.Delete') && (
                <button
                  type="button"
                  className="dash-btn dash-btn--danger"
                  onClick={() => setDeleteOpen(true)}
                >
                  Sil
                </button>
              )}
            </>
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
        <div className="dash-form">
          <section className="dash-panel">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Əsas</h2>
            </div>
            <dl className="dash-detail-grid">
              <div>
                <dt>Kateqoriya</dt>
                <dd>
                  {item.categoryName}
                  {item.subCategoryName ? ` / ${item.subCategoryName}` : ''}
                </dd>
              </div>
              <div>
                <dt>Ölçü</dt>
                <dd>{item.size}</dd>
              </div>
              <div>
                <dt>Diametr</dt>
                <dd>{item.diameter}</dd>
              </div>
              <div>
                <dt>Güc</dt>
                <dd>{item.powerAmperes} A</dd>
              </div>
              <div>
                <dt>Qarantiya</dt>
                <dd>{item.hasWarranty ? 'Bəli' : 'Xeyr'}</dd>
              </div>
              <div>
                <dt>Sifarişlə</dt>
                <dd>{item.isMadeToOrder ? 'Bəli' : 'Xeyr'}</dd>
              </div>
            </dl>
          </section>

          <section className="dash-panel">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Markalar</h2>
            </div>
            <p>{item.brands.map((b) => b.name).join(', ') || '—'}</p>
          </section>

          <section className="dash-panel">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">İstehsalçı ölkələr</h2>
            </div>
            <p>
              {item.manufacturerCountries.map((c) => c.name).join(', ') || '—'}
            </p>
          </section>

          <section className="dash-panel">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Rənglər</h2>
            </div>
            <div className="dash-color-options">
              {item.colors.map((color) => (
                <div key={color.colorId} className="dash-color-option">
                  <div className="dash-color-cell">
                    <span
                      className="dash-color-swatch"
                      style={{ backgroundColor: color.hexCode }}
                      aria-hidden
                    />
                    <strong>{color.name}</strong>
                  </div>
                  <div className="dash-image-thumbs">
                    {color.images.map((img) => (
                      <div key={img.id} className="dash-image-thumb">
                        <img src={img.imageUrl} alt="" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="dash-panel">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Tərcümələr</h2>
            </div>
            <div className="dash-detail__langs">
              {item.translations.map((t) => (
                <div key={t.languageCode} className="dash-detail__lang">
                  <span>{t.languageCode.toUpperCase()}</span>
                  <strong>{t.name}</strong>
                  <p>{t.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <ConfirmModal
        open={deleteOpen}
        title="Silmək istədiyinizə əminsiniz?"
        message={item ? `“${azName}” məhsulu silinəcək.` : ''}
        confirmLabel="Sil"
        cancelLabel="Ləğv et"
        confirming={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleting) setDeleteOpen(false)
        }}
      />
    </div>
  )
}
