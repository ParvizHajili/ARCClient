import { apiClient } from './apiClient'
import type { PaginationRequest, PaginationResponse } from './types'

export interface PowerDetail {
  id: number
  value: number
}

export interface PowerPayload {
  value: number
}

const basePath = '/api/dashboard/powers'

export function getPowers(
  params: PaginationRequest = {},
): Promise<PaginationResponse<PowerDetail>> {
  return apiClient.get<PaginationResponse<PowerDetail>>(basePath, {
    query: params,
  })
}

export function getPowerById(id: number): Promise<PowerDetail> {
  return apiClient.get<PowerDetail>(`${basePath}/${id}`)
}

export function createPower(payload: PowerPayload): Promise<PowerDetail> {
  return apiClient.post<PowerDetail>(basePath, payload)
}

export function updatePower(
  id: number,
  payload: PowerPayload,
): Promise<PowerDetail> {
  return apiClient.put<PowerDetail>(`${basePath}/${id}`, payload)
}

export function deletePower(id: number): Promise<void> {
  return apiClient.delete(`${basePath}/${id}`)
}
