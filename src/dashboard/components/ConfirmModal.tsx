import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmModalProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirming?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title = 'Təsdiq',
  message,
  confirmLabel = 'Sil',
  cancelLabel = 'Ləğv et',
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !confirming) {
        onCancel()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, confirming, onCancel])

  if (!open) return null

  return createPortal(
    <div className="dash-modal" role="presentation">
      <button
        type="button"
        className="dash-modal__backdrop"
        aria-label="Bağla"
        disabled={confirming}
        onClick={onCancel}
      />
      <div
        className="dash-modal__dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="dash-modal__title">
          {title}
        </h2>
        <p className="dash-modal__message">{message}</p>
        <div className="dash-modal__actions">
          <button
            ref={cancelRef}
            type="button"
            className="dash-btn dash-btn--ghost"
            disabled={confirming}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="dash-btn dash-btn--danger"
            disabled={confirming}
            onClick={onConfirm}
          >
            {confirming ? 'Silinir…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
