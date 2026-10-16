import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface CatalogFormModalProps {
  title: string
  submitting?: boolean
  wide?: boolean
  onClose: () => void
  children: ReactNode
}

export function CatalogFormModal({
  title,
  submitting = false,
  wide = false,
  onClose,
  children,
}: CatalogFormModalProps) {
  const titleId = useId()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !submitting) onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, submitting])

  return createPortal(
    <div className="dash-modal" role="presentation">
      <button
        type="button"
        className="dash-modal__backdrop"
        aria-label="Bağla"
        disabled={submitting}
        onClick={onClose}
      />
      <div
        className={`dash-modal__dialog dash-modal__dialog--form${wide ? ' dash-modal__dialog--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="dash-modal__body">
          <h2 id={titleId} className="dash-modal__title">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
