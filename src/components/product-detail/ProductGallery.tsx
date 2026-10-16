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
  videoUrl?: string | null
  videoLabel?: string
  videoCloseLabel?: string
}

export function ProductGallery({
  images,
  moreImages = [],
  productName,
  videoUrl = null,
  videoLabel = '360',
  videoCloseLabel = 'Close',
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)

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

  useEffect(() => {
    setVideoOpen(false)
  }, [videoUrl])

  useEffect(() => {
    if (!videoOpen) return

    document.body.classList.add('product-lightbox-open')
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setVideoOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('product-lightbox-open')
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [videoOpen])

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
          {videoUrl ? (
            <button
              type="button"
              className="product-gallery__spin"
              aria-label={videoLabel}
              onClick={() => setVideoOpen(true)}
            >
              360°
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

      {videoOpen && videoUrl ? (
        <div className="product-360" role="dialog" aria-modal="true" aria-label={videoLabel}>
          <button
            type="button"
            className="product-360__overlay"
            aria-label={videoCloseLabel}
            onClick={() => setVideoOpen(false)}
          />
          <div className="product-360__content">
            <video
              className="product-360__video"
              src={videoUrl}
              autoPlay
              loop
              playsInline
              controls
            />
          </div>
          <button
            type="button"
            className="product-lightbox__close"
            aria-label={videoCloseLabel}
            onClick={() => setVideoOpen(false)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>
      ) : null}

      <ProductLightbox
        open={lightboxOpen}
        images={safeImages}
        initialIndex={activeIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
