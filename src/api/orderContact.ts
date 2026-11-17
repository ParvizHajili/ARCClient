import { apiClient } from './apiClient'

export interface OrderContactDetail {
  id: number
  whatsAppNumber: string | null
  phoneNumber: string | null
  email: string | null
}

export interface PublicOrderContact {
  whatsAppNumber: string | null
  phoneNumber: string | null
  email: string | null
}

export interface UpsertOrderContactPayload {
  whatsAppNumber?: string | null
  phoneNumber?: string | null
  email?: string | null
}

const dashboardPath = '/api/dashboard/order-contact'

export function getPublicOrderContact(): Promise<PublicOrderContact> {
  return apiClient.get<PublicOrderContact>('/api/order-contact', { skipAuth: true })
}

export function getOrderContact(): Promise<OrderContactDetail> {
  return apiClient.get<OrderContactDetail>(dashboardPath)
}

export function saveOrderContact(
  payload: UpsertOrderContactPayload,
): Promise<OrderContactDetail> {
  return apiClient.put<OrderContactDetail>(dashboardPath, payload)
}

export function toTelHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned ? `tel:${cleaned}` : '#'
}

export function toWhatsAppHref(phone: string, text?: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return '#'
  const base = `https://wa.me/${digits}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export function toMailtoHref(email: string, subject?: string): string {
  const trimmed = email.trim()
  if (!trimmed) return '#'
  return subject
    ? `mailto:${trimmed}?subject=${encodeURIComponent(subject)}`
    : `mailto:${trimmed}`
}
