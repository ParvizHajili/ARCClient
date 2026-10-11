import type { PublicProductCard } from '../../api/publicCatalog'
import { useI18n } from '../../i18n/I18nContext'

type ProductListCardProps = {
  product: PublicProductCard
}

function prefetchDetail(id: number, lang: string) {
  const href = `/api/products/${id}?lang=${encodeURIComponent(lang)}`
  if (document.head.querySelector(`link[data-product-prefetch="${href}"]`)) return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'fetch'
  link.href = href
  link.dataset.productPrefetch = href
  document.head.appendChild(link)
}

export function ProductListCard({ product }: ProductListCardProps) {
  const { t, lang } = useI18n()
  const image = product.imageUrl || '/assets/images/products/image1.png'
  const detailTo = `/products/${product.id}`
  const warm = () => prefetchDetail(product.id, lang)

  return (
    <article className="product-list-card" onMouseEnter={warm} onFocus={warm}>
      <a
        href={detailTo}
        className="product-list-card__image-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="product-list-card__image"
          src={image}
          alt={product.name}
          loading="lazy"
        />
      </a>
      <div className="product-list-card__body">
        <h3 className="product-list-card__title">
          <a
            href={detailTo}
            className="product-list-card__title-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {product.name}
          </a>
        </h3>
        {product.description ? (
          <p className="product-list-card__description">{product.description}</p>
        ) : null}
        <span className="product-list-card__code">
          {t('products.codeLabel')} {product.code}
        </span>
      </div>
    </article>
  )
}
