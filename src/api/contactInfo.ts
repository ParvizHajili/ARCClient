import { apiClient } from './apiClient'

export interface ContactInfoDetail {
  id: number
  phone1: string
  phone2: string | null
  instagramUrl: string
  facebookUrl: string
}

export interface PublicContactInfo {
  phone1: string | null
  phone2: string | null
  instagramUrl: string | null
  facebookUrl: string | null
}

export interface UpsertContactInfoPayload {
  phone1: string
  phone2?: string | null
  instagramUrl: string
  facebookUrl: string
}

const basePath = '/api/dashboard/contact-info'

export function getPublicContactInfo(): Promise<PublicContactInfo> {
  return apiClient.get<PublicContactInfo>('/api/contact-info', { skipAuth: true })
}

export function getContactInfoList(): Promise<ContactInfoDetail[]> {
  return apiClient.get<ContactInfoDetail[]>(basePath)
}

export function getContactInfoById(id: number): Promise<ContactInfoDetail> {
  return apiClient.get<ContactInfoDetail>(`${basePath}/${id}`)
}

export function createContactInfo(
  payload: UpsertContactInfoPayload,
): Promise<ContactInfoDetail> {
  return apiClient.post<ContactInfoDetail>(basePath, payload)
}

export function updateContactInfo(
  id: number,
  payload: UpsertContactInfoPayload,
): Promise<ContactInfoDetail> {
  return apiClient.put<ContactInfoDetail>(`${basePath}/${id}`, payload)
}

export function toTelHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned ? `tel:${cleaned}` : '#'
}
