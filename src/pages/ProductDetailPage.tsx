import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { recordProductView } from '../api/dashboardOverview'
import {
  getPublicProduct,
  type PublicProductDetail,
} from '../api/publicCatalog'
import {
  ProductGallery,
  type GalleryImage,
} from '../components/product-detail/ProductGallery'
import { TechnicalSpecs } from '../components/product-detail/TechnicalSpecs'
import { ProductSpinView } from '../components/product-detail/ProductSpinView'
import { useI18n } from '../i18n/I18nContext'
import { resolveTranslation } from '../utils/translations'

function normalizeDetail(data: PublicProductDetail): PublicProductDetail {
  return {
    ...data,
    translations: data.translations ?? [],
    brands: data.brands ?? [],
    sizes: data.sizes ?? [],
    diameters: data.diameters ?? [],
    powers: data.powers ?? [],
    manufacturerCountries: data.manufacturerCountries ?? [],
    images: data.images ?? [],
    colors: (data.colors ?? []).map((color) => ({
      ...color,
      images: color.images ?? [],
    })),
    hasSpin: Boolean(data.hasSpin),
  }
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, lang } = useI18n()
  const productId = Number(id)

  const [product, setProduct] = useState<PublicProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null)
  const [spinOpen, setSpinOpen] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(productId) || productId <= 0) {
      setProduct(null)
      setFailed(true)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    setLoading(true)
    setFailed(false)
    setProduct(null)

    const timeoutId = window.setTimeout(() => controller.abort(), 20000)

    void getPublicProduct(productId, lang, controller.signal)
      .then((data) => {
        if (cancelled) return
        const detail = normalizeDetail(data)
        const hasGeneralImage = detail.images.some((image) => image.imageUrl)
        const firstColorWithImage = detail.colors.find((color) =>
          color.images.some((image) => image.imageUrl),
        )
        setProduct(detail)
        setSelectedColorId(hasGeneralImage ? null : (firstColorWithImage?.colorId ?? null))
        setFailed(false)
        void recordProductView(detail.code)
      })
      .catch(() => {
        if (cancelled) return
        setProduct(null)
        setFailed(true)
      })
      .finally(() => {
        window.clearTimeout(timeoutId)
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [productId, lang])

  const translation = useMemo(
    () => resolveTranslation(product?.translations, lang),
    [product, lang],
  )

  const title = translation?.name ?? product?.code ?? ''
  const description = translation?.description ?? ''

  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = `${title} · ARC`
    return () => {
      document.title = previous
    }
  }, [title])

  const { colorGallery, moreGallery } = useMemo(() => {
    const toGallery = (
      images: Array<{ id: number; imageUrl: string }>,
    ): GalleryImage[] =>
      images
        .filter((image) => image.imageUrl)
        .map((image, index) => ({
          src: image.imageUrl,
          alt: title,
          label: String(index + 1),
        }))

    if (!product) return { colorGallery: [], moreGallery: [] }

    const selectedColor = product.colors.find((c) => c.colorId === selectedColorId)
    const colorImages = (selectedColor?.images ?? []).filter((image) => image.imageUrl)
    const generalImages = product.images.filter((image) => image.imageUrl)
    const colorIds = new Set(colorImages.map((image) => image.id))

    if (colorImages.length === 0) {
      return { colorGallery: toGallery(generalImages), moreGallery: [] }
    }

    return {
      colorGallery: toGallery(colorImages),
      moreGallery: toGallery(generalImages.filter((image) => !colorIds.has(image.id))),
    }
  }, [product, selectedColorId, title])

  const specItems = useMemo(() => {
    if (!product) return []
    const items: Array<{ label: string; value: string }> = []

    if (product.categoryName) {
      items.push({
        label: t('productDetail.specs.category'),
        value: product.subCategoryName
          ? `${product.categoryName} / ${product.subCategoryName}`
          : product.categoryName,
      })
    }
    if (product.brands.length) {
      items.push({
        label: t('productDetail.specs.brand'),
        value: product.brands.map((b) => b.name).join(', '),
      })
    }
    if (product.manufacturerCountries.length) {
      items.push({
        label: t('productDetail.specs.country'),
        value: product.manufacturerCountries.map((c) => c.name).join(', '),
      })
    }
    if (product.sizes.length) {
      items.push({
        label: t('productDetail.specs.size'),
        value: product.sizes.map((s) => s.name).join(', '),
      })
    }
    if (product.diameters.length) {
      items.push({
        label: t('productDetail.specs.diameter'),
        value: product.diameters.map((d) => d.name).join(', '),
      })
    }
    if (product.powers.length) {
      items.push({
        label: t('productDetail.specs.power'),
        value: product.powers.map((p) => `${p.name}A`).join(', '),
      })
    }
    items.push({
      label: t('productDetail.specs.warranty'),
      value: product.hasWarranty
        ? t('productDetail.specs.warrantyYes')
        : t('productDetail.specs.warrantyNo'),
    })
    items.push({
      label: t('productDetail.specs.availability'),
      value: product.isMadeToOrder
        ? t('productDetail.specs.madeToOrder')
        : t('productDetail.specs.inStock'),
    })

    return items
  }, [product, t])

  if (loading) {
    return (
      <main className="product-detail-page">
        <div className="product-detail-page__shell container-fluid">
          <p className="product-detail-page__status">{t('productDetail.loading')}</p>
        </div>
      </main>
    )
  }

  if (failed || !product) {
    return (
      <main className="product-detail-page">
        <div className="product-detail-page__shell container-fluid">
          <p className="product-detail-page__status">{t('productDetail.notFound')}</p>
          <Link to="/products" className="product-detail-page__back-link">
            {t('productDetail.backToProducts')}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="product-detail-page">
      <div className="product-detail-page__shell container-fluid">
        <nav className="product-detail-page__crumb" aria-label="Breadcrumb">
          <Link to="/products">{t('nav.products')}</Link>
          <span aria-hidden="true">/</span>
          <span>{title}</span>
        </nav>

        <div className="product-detail-page__layout">
          <ProductGallery
            images={colorGallery}
            moreImages={moreGallery}
            productName={title}
            spinLabel={t('productDetail.spinOpen')}
            onOpenSpin={product.hasSpin ? () => setSpinOpen(true) : undefined}
          />

          <div className="product-detail-page__info">
            <p className="product-detail-page__collection">
              {product.categoryName || t('productDetail.collection')}
            </p>
            <h1 className="product-detail-page__title">{title}</h1>
            <p className="product-detail-page__code">
              <span>{t('productDetail.codeLabel')}</span> {product.code}
            </p>

            <div className="product-detail-page__badges">
              {product.hasWarranty ? (
                <span className="product-detail-page__badge">
                  {t('productDetail.badges.warranty')}
                </span>
              ) : null}
              {product.isMadeToOrder ? (
                <span className="product-detail-page__badge product-detail-page__badge--muted">
                  {t('productDetail.badges.madeToOrder')}
                </span>
              ) : (
                <span className="product-detail-page__badge product-detail-page__badge--muted">
                  {t('productDetail.badges.inStock')}
                </span>
              )}
            </div>

            {description ? (
              <p className="product-detail-page__description">{description}</p>
            ) : null}

            {product.colors.length > 0 ? (
              <div className="product-detail-page__colors">
                <p className="product-detail-page__colors-label">
                  {t('productDetail.colors')}
                </p>
                <div className="product-detail-page__swatches" role="list">
                  {product.colors.map((color) => (
                    <button
                      key={color.colorId}
                      type="button"
                      role="listitem"
                      className={[
                        'product-detail-page__swatch',
                        selectedColorId === color.colorId ? 'is-active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      title={color.name}
                      aria-label={color.name}
                      aria-pressed={selectedColorId === color.colorId}
                      style={{ backgroundColor: color.hexCode || '#ccc' }}
                      onClick={() => setSelectedColorId(color.colorId)}
                    />
                  ))}
                </div>
                <p className="product-detail-page__color-name">
                  {product.colors.find((c) => c.colorId === selectedColorId)?.name}
                </p>
              </div>
            ) : null}

            {(product.sizes.length > 0 ||
              product.diameters.length > 0 ||
              product.powers.length > 0) && (
              <div className="product-detail-page__chips">
                {product.sizes.map((size) => (
                  <span key={`s-${size.id}`} className="product-detail-page__chip">
                    {t('productDetail.chipSize')} {size.name}
                  </span>
                ))}
                {product.diameters.map((diameter) => (
                  <span key={`d-${diameter.id}`} className="product-detail-page__chip">
                    {t('productDetail.chipDiameter')} {diameter.name}
                  </span>
                ))}
                {product.powers.map((power) => (
                  <span key={`p-${power.id}`} className="product-detail-page__chip">
                    {power.name}A
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <TechnicalSpecs title={t('productDetail.specs.title')} items={specItems} />
      </div>
      <ProductSpinView
        open={spinOpen}
        productId={product.id}
        onClose={() => setSpinOpen(false)}
      />
    </main>
  )
}
