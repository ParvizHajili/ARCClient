import { apiClient } from './apiClient'
import type { PaginationRequest, PaginationResponse } from './types'

export type InquiryStatusFilter =
  | 'all'
  | 'unread'
  | 'read'
  | 'contacted'
  | 'uncontacted'

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
  isRead: boolean
  isContacted: boolean
  readAt: string | null
  contactedAt: string | null
}

export function createContactInquiry(
  payload: ContactInquiryPayload,
): Promise<ContactInquiry> {
  return apiClient.post<ContactInquiry>('/api/contact', payload, { skipAuth: true })
}

export function getContactInquiries(
  params: PaginationRequest & { status?: InquiryStatusFilter } = {},
): Promise<PaginationResponse<ContactInquiry>> {
  const { status, ...rest } = params
  return apiClient.get<PaginationResponse<ContactInquiry>>(
    '/api/dashboard/inquiries',
    {
      query: {
        ...rest,
        ...(status && status !== 'all' ? { status } : {}),
      },
    },
  )
}

export function getContactInquiry(id: number): Promise<ContactInquiry> {
  return apiClient.get<ContactInquiry>(`/api/dashboard/inquiries/${id}`)
}

export function setInquiryContacted(
  id: number,
  isContacted: boolean,
): Promise<ContactInquiry> {
  return apiClient.patch<ContactInquiry>(
    `/api/dashboard/inquiries/${id}/contacted`,
    { isContacted },
  )
}
