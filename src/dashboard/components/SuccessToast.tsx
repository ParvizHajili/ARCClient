import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { DashToastPayload, ToastVariant } from '../toast'

interface SuccessToastProps {
  message?: string | null
  variant?: ToastVariant
  toast?: DashToastPayload | null
  onDismiss: () => void
  durationMs?: number
}

export function SuccessToast({
  message,
  variant = 'success',
  toast = null,
  onDismiss,
  durationMs = 5000,
}: SuccessToastProps) {
  const payload = toast ?? (message ? { message, variant } : null)
  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  useEffect(() => {
    if (!payload?.message) return

    const timer = window.setTimeout(() => {
      onDismissRef.current()
    }, durationMs)

    return () => window.clearTimeout(timer)
  }, [payload?.message, payload?.variant, durationMs])

  if (!payload?.message) return null

  return createPortal(
    <div
      className={`dash-toast dash-toast--${payload.variant}`}
      role="status"
      aria-live="polite"
    >
      <p className="dash-toast__message">{payload.message}</p>
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
