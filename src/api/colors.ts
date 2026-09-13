import { apiClient } from './apiClient'
import type {
  PaginationRequest,
  PaginationResponse,
  TranslationInput,
} from './types'

export interface ColorDetail {
  id: number
  hexCode: string
  translations: TranslationInput[]
}

export interface ColorPayload {
  hexCode: string
  translations: TranslationInput[]
}

const basePath = '/api/dashboard/colors'

export function getColors(
  params: PaginationRequest = {},
): Promise<PaginationResponse<ColorDetail>> {
  return apiClient.get<PaginationResponse<ColorDetail>>(basePath, {
    query: params,
  })
}

export function getColorById(id: number): Promise<ColorDetail> {
  return apiClient.get<ColorDetail>(`${basePath}/${id}`)
}

export function createColor(payload: ColorPayload): Promise<ColorDetail> {
  return apiClient.post<ColorDetail>(basePath, payload)
}

export function updateColor(
  id: number,
  payload: ColorPayload,
): Promise<ColorDetail> {
  return apiClient.put<ColorDetail>(`${basePath}/${id}`, payload)
}

export function deleteColor(id: number): Promise<void> {
  return apiClient.delete(`${basePath}/${id}`)
}
