import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface SuccessToastProps {
  message: string | null
  onDismiss: () => void
  durationMs?: number
}

export function SuccessToast({
  message,
  onDismiss,
  durationMs = 5000,
}: SuccessToastProps) {
  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  useEffect(() => {
    if (!message) return

    const timer = window.setTimeout(() => {
      onDismissRef.current()
    }, durationMs)

    return () => window.clearTimeout(timer)
  }, [message, durationMs])

  if (!message) return null

  return createPortal(
    <div
      className="dash-toast dash-toast--success"
      role="status"
      aria-live="polite"
    >
      <p className="dash-toast__message">{message}</p>
      <button
        type="button"
        className="dash-toast__close"
        aria-label="Bağla"
        onClick={() => onDismissRef.current()}
      >
        ×
      </button>
    </div>,
    document.body,
  )
}
