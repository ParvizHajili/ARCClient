import { Link } from 'react-router-dom'
import type { Product } from '../../data/products'
import { useI18n } from '../../i18n/I18nContext'

type ProductListCardProps = {
  product: Product
}

export function ProductListCard({ product }: ProductListCardProps) {
  const { t } = useI18n()

  return (
    <article className="product-list-card">
      <Link to="/product-detail" className="product-list-card__image-link">
        <img
          className="product-list-card__image"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
      </Link>
      <div className="product-list-card__body">
        <h3 className="product-list-card__title">
          <Link to="/product-detail" className="product-list-card__title-link">
            {product.name}
          </Link>
        </h3>
        <p className="product-list-card__description">{product.description}</p>
        <span className="product-list-card__code">
          {t('products.codeLabel')} {product.code}
        </span>
      </div>
    </article>
  )
}
