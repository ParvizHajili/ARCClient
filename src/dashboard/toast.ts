export type ToastVariant = 'success' | 'warning' | 'danger'

export type DashToastPayload = {
  message: string
  variant: ToastVariant
}

/** Create / Edit / Detail səhifələrindən listə navigate state */
export type DashLocationToastState = {
  toast?: DashToastPayload
  /** @deprecated köhnə format — yaşıl kimi oxunur */
  success?: string
}

export function toastCreated(label: string): DashToastPayload {
  return {
    message: `“${label}” uğurla yaradıldı.`,
    variant: 'success',
  }
}

export function toastUpdated(label: string): DashToastPayload {
  return {
    message: `“${label}” uğurla yeniləndi.`,
    variant: 'warning',
  }
}

export function toastDeleted(label: string): DashToastPayload {
  return {
    message: `“${label}” uğurla silindi.`,
    variant: 'danger',
  }
}

export function readToastFromLocationState(
  state: unknown,
): DashToastPayload | null {
  const s = state as DashLocationToastState | null
  if (!s) return null
  if (s.toast?.message) return s.toast
  if (s.success) return { message: s.success, variant: 'success' }
  return null
}
