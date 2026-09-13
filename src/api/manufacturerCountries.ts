import { apiClient } from './apiClient'
import type {
  PaginationRequest,
  PaginationResponse,
  TranslationInput,
} from './types'

export interface ManufacturerCountryDetail {
  id: number
  translations: TranslationInput[]
}

export interface ManufacturerCountryPayload {
  translations: TranslationInput[]
}

const basePath = '/api/dashboard/manufacturer-countries'

export function getManufacturerCountries(
  params: PaginationRequest = {},
): Promise<PaginationResponse<ManufacturerCountryDetail>> {
  return apiClient.get<PaginationResponse<ManufacturerCountryDetail>>(basePath, {
    query: params,
  })
}

export function getManufacturerCountryById(
  id: number,
): Promise<ManufacturerCountryDetail> {
  return apiClient.get<ManufacturerCountryDetail>(`${basePath}/${id}`)
}

export function createManufacturerCountry(
  payload: ManufacturerCountryPayload,
): Promise<ManufacturerCountryDetail> {
  return apiClient.post<ManufacturerCountryDetail>(basePath, payload)
}

export function updateManufacturerCountry(
  id: number,
  payload: ManufacturerCountryPayload,
): Promise<ManufacturerCountryDetail> {
  return apiClient.put<ManufacturerCountryDetail>(`${basePath}/${id}`, payload)
}

export function deleteManufacturerCountry(id: number): Promise<void> {
  return apiClient.delete(`${basePath}/${id}`)
}
