import { Link } from 'react-router-dom'
import { selectedProducts } from '../../data/selectedProducts'
import { useI18n } from '../../i18n/I18nContext'
import { Reveal } from '../Reveal'

export function SelectedProducts() {
  const { t } = useI18n()

  return (
    <section className="selected-products" id="products">
      <div className="selected-products__ambient" aria-hidden="true" />

      <div className="selected-products__container container-fluid">
        <Reveal as="header" className="selected-products__header">
          <h2 className="selected-products__title">{t('selected.title')}</h2>
          <span className="selected-products__rule" aria-hidden="true" />
        </Reveal>

        <div className="selected-products__grid">
          {selectedProducts.map((product, index) => {
            const title = t(`products.${product.id}.title`)

            return (
              <Reveal
                key={product.id}
                as="article"
                className={`product-card${index % 2 === 1 ? ' product-card--offset' : ''}`}
                delay={index * 24}
              >
                <Link className="product-card__media" to="/product-detail">
                  <span className="product-card__glow" aria-hidden="true" />
                  <span className="product-card__shine" aria-hidden="true" />
                  <img
                    className="product-card__image"
                    src={product.image}
                    alt={title}
                    loading="lazy"
                    width={320}
                    height={320}
                  />
                  <span className="product-card__peek" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>

                <div className="product-card__body">
                  <span className="product-card__code">{product.code}</span>
                  <h3 className="product-card__title">
                    <Link to="/product-detail">{title}</Link>
                  </h3>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
