import { apiClient } from './apiClient'
import type { PaginationRequest, PaginationResponse } from './types'

export interface SizeDetail {
  id: number
  value: number
}

export interface SizePayload {
  value: number
}

const basePath = '/api/dashboard/sizes'

export function getSizes(
  params: PaginationRequest = {},
): Promise<PaginationResponse<SizeDetail>> {
  return apiClient.get<PaginationResponse<SizeDetail>>(basePath, {
    query: params,
  })
}

export function getSizeById(id: number): Promise<SizeDetail> {
  return apiClient.get<SizeDetail>(`${basePath}/${id}`)
}

export function createSize(payload: SizePayload): Promise<SizeDetail> {
  return apiClient.post<SizeDetail>(basePath, payload)
}

export function updateSize(
  id: number,
  payload: SizePayload,
): Promise<SizeDetail> {
  return apiClient.put<SizeDetail>(`${basePath}/${id}`, payload)
}

export function deleteSize(id: number): Promise<void> {
  return apiClient.delete(`${basePath}/${id}`)
}
