import { apiClient } from './apiClient'
import type { PaginationRequest, PaginationResponse } from './types'

export interface ContactInquiryPayload {
  name: string
  phone?: string | null
  email?: string | null
  message: string
}

export interface ContactInquiry {
  id: number
  name: string
  phone: string | null
  email: string | null
  message: string
  createDate: string
}

export function createContactInquiry(
  payload: ContactInquiryPayload,
): Promise<ContactInquiry> {
  return apiClient.post<ContactInquiry>('/api/contact', payload, { skipAuth: true })
}

export function getContactInquiries(
  params: PaginationRequest = {},
): Promise<PaginationResponse<ContactInquiry>> {
  return apiClient.get<PaginationResponse<ContactInquiry>>(
    '/api/dashboard/inquiries',
    { query: params },
  )
}

export function getContactInquiry(id: number): Promise<ContactInquiry> {
  return apiClient.get<ContactInquiry>(`/api/dashboard/inquiries/${id}`)
}
