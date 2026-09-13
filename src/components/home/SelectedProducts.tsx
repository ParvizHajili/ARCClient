import { useCallback, useEffect, useRef, useState } from 'react'
import { selectedProducts } from '../../data/selectedProducts'
import { useI18n } from '../../i18n/I18nContext'

export function SelectedProducts() {
  const { t } = useI18n()
  const viewportRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const updateControls = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const maxScroll = viewport.scrollWidth - viewport.clientWidth
    setCanPrev(viewport.scrollLeft > 0)
    setCanNext(viewport.scrollLeft < maxScroll - 1)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    updateControls()
    viewport.addEventListener('scroll', updateControls, { passive: true })
    window.addEventListener('resize', updateControls)
    return () => {
      viewport.removeEventListener('scroll', updateControls)
      window.removeEventListener('resize', updateControls)
    }
  }, [updateControls])

  const getScrollStep = () => {
    const viewport = viewportRef.current
    if (!viewport) return 0

    const firstCard = viewport.querySelector('.product-card') as HTMLElement | null
    if (!firstCard) return viewport.clientWidth

    const grid = viewport.querySelector('.selected-products__grid') as HTMLElement | null
    const styles = grid ? window.getComputedStyle(grid) : null
    const gap = parseFloat(styles?.columnGap || styles?.gap || '16')
    return firstCard.offsetWidth + gap
  }

  return (
    <section className="selected-products" id="products">
      <div className="selected-products__container container-fluid">
        <div className="selected-products__header">
          <div className="selected-products__intro">
            <span className="selected-products__eyebrow">{t('selected.eyebrow')}</span>
            <h2 className="selected-products__title">{t('selected.title')}</h2>
          </div>

          <div className="selected-products__controls" aria-label="Product slider controls">
            <button
              className="selected-products__control selected-products__control--prev"
              type="button"
              aria-label="Previous products"
              disabled={!canPrev}
              onClick={() =>
                viewportRef.current?.scrollBy({ left: -getScrollStep(), behavior: 'smooth' })
              }
            >
              ‹
            </button>
            <button
              className="selected-products__control selected-products__control--next"
              type="button"
              aria-label="Next products"
              disabled={!canNext}
              onClick={() =>
                viewportRef.current?.scrollBy({ left: getScrollStep(), behavior: 'smooth' })
              }
            >
              ›
            </button>
          </div>
        </div>

        <div className="selected-products__viewport" ref={viewportRef}>
          <div className="selected-products__grid">
            {selectedProducts.map((product) => {
              const title = t(`products.${product.id}.title`)
              const description = t(`products.${product.id}.description`)

              return (
                <article
                  key={product.id}
                  className="product-card"
                  data-product-id={product.id}
                >
                  <a className="product-card__image-link" href="#products">
                    <img
                      className="product-card__image"
                      src={product.image}
                      alt={title}
                      loading="lazy"
                      width={240}
                      height={240}
                    />
                  </a>
                  <div className="product-card__body">
                    <span className="product-card__code">{product.code}</span>
                    <h3 className="product-card__title">{title}</h3>
                    <p className="product-card__description">{description}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
