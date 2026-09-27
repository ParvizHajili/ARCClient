import { apiClient } from './apiClient'
import type { PaginationRequest, PaginationResponse } from './types'

export interface DiameterDetail {
  id: number
  value: number
}

export interface DiameterPayload {
  value: number
}

const basePath = '/api/dashboard/diameters'

export function getDiameters(
  params: PaginationRequest = {},
): Promise<PaginationResponse<DiameterDetail>> {
  return apiClient.get<PaginationResponse<DiameterDetail>>(basePath, {
    query: params,
  })
}

export function getDiameterById(id: number): Promise<DiameterDetail> {
  return apiClient.get<DiameterDetail>(`${basePath}/${id}`)
}

export function createDiameter(payload: DiameterPayload): Promise<DiameterDetail> {
  return apiClient.post<DiameterDetail>(basePath, payload)
}

export function updateDiameter(
  id: number,
  payload: DiameterPayload,
): Promise<DiameterDetail> {
  return apiClient.put<DiameterDetail>(`${basePath}/${id}`, payload)
}

export function deleteDiameter(id: number): Promise<void> {
  return apiClient.delete(`${basePath}/${id}`)
}
