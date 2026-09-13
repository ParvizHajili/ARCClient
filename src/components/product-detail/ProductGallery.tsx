import { useEffect, useState } from 'react'
import { ProductLightbox } from './ProductLightbox'

const FADE_MS = 400

const GALLERY_IMAGES = [
  {
    src: '/assets/images/products/image1.png',
    alt: 'Ring Grand Style — görünüş 1',
    label: 'Şəkil 1',
  },
  {
    src: '/assets/images/products/image2.png',
    alt: 'Ring Grand Style — görünüş 2',
    label: 'Şəkil 2',
  },
  {
    src: '/assets/images/products/image3.png',
    alt: 'Ring Grand Style — görünüş 3',
    label: 'Şəkil 3',
  },
  {
    src: '/assets/images/products/image4.png',
    alt: 'Ring Grand Style — görünüş 4',
    label: 'Şəkil 4',
  },
]

export function ProductGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (activeIndex === displayIndex) return

    setFading(true)
    const timeout = window.setTimeout(() => {
      setDisplayIndex(activeIndex)
      setFading(false)
    }, FADE_MS)

    return () => window.clearTimeout(timeout)
  }, [activeIndex, displayIndex])

  const current = GALLERY_IMAGES[displayIndex]

  return (
    <>
      <div className="product-gallery" data-product-gallery>
        <div
          className="product-gallery__main"
          role="button"
          tabIndex={0}
          aria-label="Şəkli böyüt"
          onClick={() => setLightboxOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setLightboxOpen(true)
            }
          }}
        >
          <img
            className={`product-gallery__main-image${fading ? ' is-fading' : ''}`}
            src={current.src}
            alt="Ring Grand Style"
            width={640}
            height={640}
          />
        </div>
        <div className="product-gallery__thumbs">
          {GALLERY_IMAGES.map((image, index) => (
            <button
              key={image.src}
              type="button"
              className={`product-gallery__thumb${index === activeIndex ? ' is-active' : ''}`}
              aria-label={image.label}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
            >
              <img src={image.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      <ProductLightbox
        open={lightboxOpen}
        images={GALLERY_IMAGES}
        initialIndex={activeIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
