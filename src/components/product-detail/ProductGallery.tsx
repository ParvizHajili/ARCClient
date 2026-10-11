import { useEffect, useMemo, useState } from 'react'
import { ProductLightbox } from './ProductLightbox'

export type GalleryImage = {
  src: string
  alt: string
  label: string
}

type ProductGalleryProps = {
  images: GalleryImage[]
  moreImages?: GalleryImage[]
  productName: string
  onOpenSpin?: () => void
  spinLabel?: string
}

export function ProductGallery({
  images,
  moreImages = [],
  productName,
  onOpenSpin,
  spinLabel = '360',
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const colorImages = images
  const extraImages = moreImages

  const safeImages = useMemo(() => {
    const combined = [...colorImages, ...extraImages]
    if (combined.length > 0) return combined
    return [
      {
        src: '/assets/images/products/image1.png',
        alt: productName,
        label: '1',
      },
    ]
  }, [colorImages, extraImages, productName])

  useEffect(() => {
    setActiveIndex(0)
  }, [safeImages])

  const current = safeImages[activeIndex] ?? safeImages[0]

  function openAt(index: number) {
    setActiveIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="product-gallery" data-product-gallery>
        <div className="product-gallery__stage">
          <div
            className="product-gallery__main"
            role="button"
            tabIndex={0}
            aria-label="Şəkli böyüt"
            onClick={() => openAt(activeIndex)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openAt(activeIndex)
              }
            }}
          >
            <img
              className="product-gallery__main-image"
              src={current.src}
              alt={current.alt || productName}
              width={640}
              height={640}
            />
          </div>
          {onOpenSpin ? (
            <button
              type="button"
              className="product-gallery__spin"
              aria-label={spinLabel}
              onClick={onOpenSpin}
            >
              <span aria-hidden="true">360°</span>
            </button>
          ) : null}
        </div>

        {safeImages.length > 1 ? (
          <div className="product-gallery__thumbs" role="list">
            {colorImages.map((image, index) => (
              <button
                key={`color-${image.src}-${index}`}
                type="button"
                role="listitem"
                className={`product-gallery__thumb${index === activeIndex ? ' is-active' : ''}`}
                aria-label={image.label}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => openAt(index)}
              >
                <img src={image.src} alt="" />
              </button>
            ))}
            {colorImages.length > 0 && extraImages.length > 0 ? (
              <span className="product-gallery__split" aria-hidden="true" />
            ) : null}
            {extraImages.map((image, index) => {
              const imageIndex = colorImages.length + index
              return (
                <button
                  key={`more-${image.src}-${index}`}
                  type="button"
                  role="listitem"
                  className={`product-gallery__thumb${imageIndex === activeIndex ? ' is-active' : ''}`}
                  aria-label={image.label}
                  onMouseEnter={() => setActiveIndex(imageIndex)}
                  onFocus={() => setActiveIndex(imageIndex)}
                  onClick={() => openAt(imageIndex)}
                >
                  <img src={image.src} alt="" />
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      <ProductLightbox
        open={lightboxOpen}
        images={safeImages}
        initialIndex={activeIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
