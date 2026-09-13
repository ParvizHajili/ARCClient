import { useEffect, useState } from 'react'

type LightboxImage = {
  src: string
  alt: string
}

type ProductLightboxProps = {
  open: boolean
  images: LightboxImage[]
  initialIndex: number
  onClose: () => void
}

const TRANSITION_MS = 350

export function ProductLightbox({
  open,
  images,
  initialIndex,
  onClose,
}: ProductLightboxProps) {
  const [index, setIndex] = useState(initialIndex)
  const [displayIndex, setDisplayIndex] = useState(initialIndex)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (open) {
      setIndex(initialIndex)
      setDisplayIndex(initialIndex)
      setFading(false)
      document.body.classList.add('product-lightbox-open')
    } else {
      document.body.classList.remove('product-lightbox-open')
    }

    return () => document.body.classList.remove('product-lightbox-open')
  }, [open, initialIndex])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setIndex((current) => (current + 1) % images.length)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setIndex((current) => (current - 1 + images.length) % images.length)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, images.length, onClose])

  useEffect(() => {
    if (index === displayIndex) return

    setFading(true)
    const timeout = window.setTimeout(() => {
      setDisplayIndex(index)
      setFading(false)
    }, TRANSITION_MS)

    return () => window.clearTimeout(timeout)
  }, [index, displayIndex])

  if (!open) return null

  const image = images[displayIndex]

  return (
    <div
      className="product-lightbox is-open"
      role="dialog"
      aria-modal="true"
      aria-hidden="false"
      aria-label="Məhsul qalereyası"
    >
      <div className="product-lightbox__overlay" onClick={onClose} />
      <div
        className="product-lightbox__content"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="product-lightbox__close"
          aria-label="Bağla"
          onClick={onClose}
          autoFocus
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <button
          type="button"
          className="product-lightbox__arrow product-lightbox__arrow--prev"
          aria-label="Əvvəlki şəkil"
          onClick={(event) => {
            event.stopPropagation()
            setIndex((current) => (current - 1 + images.length) % images.length)
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="product-lightbox__stage">
          <img
            className={`product-lightbox__image${fading ? ' is-fading' : ''}`}
            src={image.src}
            alt={image.alt}
          />
        </div>

        <button
          type="button"
          className="product-lightbox__arrow product-lightbox__arrow--next"
          aria-label="Növbəti şəkil"
          onClick={(event) => {
            event.stopPropagation()
            setIndex((current) => (current + 1) % images.length)
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  )
}
