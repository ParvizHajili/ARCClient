import { apiClient } from './apiClient'
import type {
  PaginationRequest,
  PaginationResponse,
  TranslationInput,
} from './types'

export interface BrandDetail {
  id: number
  translations: TranslationInput[]
}

export interface BrandPayload {
  translations: TranslationInput[]
}

const basePath = '/api/dashboard/brands'

export function getBrands(
  params: PaginationRequest = {},
): Promise<PaginationResponse<BrandDetail>> {
  return apiClient.get<PaginationResponse<BrandDetail>>(basePath, {
    query: params,
  })
}

export function getBrandById(id: number): Promise<BrandDetail> {
  return apiClient.get<BrandDetail>(`${basePath}/${id}`)
}

export function createBrand(payload: BrandPayload): Promise<BrandDetail> {
  return apiClient.post<BrandDetail>(basePath, payload)
}

export function updateBrand(
  id: number,
  payload: BrandPayload,
): Promise<BrandDetail> {
  return apiClient.put<BrandDetail>(`${basePath}/${id}`, payload)
}

export function deleteBrand(id: number): Promise<void> {
  return apiClient.delete(`${basePath}/${id}`)
}
