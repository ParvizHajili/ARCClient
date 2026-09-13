import { apiClient } from './apiClient'
import type { PaginationRequest, PaginationResponse } from './types'

export interface ProductTranslation {
  languageCode: string
  name: string
  description: string
}

export interface ProductNamedRef {
  id: number
  name: string
}

export interface ProductImageDetail {
  id: number
  imageUrl: string
  order: number
}

export interface ProductColorDetail {
  colorId: number
  hexCode: string
  name: string
  images: ProductImageDetail[]
}

export interface ProductDetail {
  id: number
  code: string
  size: string
  diameter: string
  hasWarranty: boolean
  isMadeToOrder: boolean
  powerAmperes: number
  categoryId: number
  categoryName: string
  subCategoryId: number | null
  subCategoryName: string | null
  translations: ProductTranslation[]
  brands: ProductNamedRef[]
  manufacturerCountries: ProductNamedRef[]
  colors: ProductColorDetail[]
}

export interface ProductListItem {
  id: number
  code: string
  name: string
  categoryName: string
  subCategoryName: string | null
  powerAmperes: number
  hasWarranty: boolean
  isMadeToOrder: boolean
}

export interface ProductFormPayload {
  code: string
  size: string
  diameter: string
  hasWarranty: boolean
  isMadeToOrder: boolean
  powerAmperes: number
  categoryId: number
  subCategoryId?: number | null
  translations: ProductTranslation[]
  brandIds: number[]
  manufacturerCountryIds: number[]
  colorIds: number[]
  /** New files + matching color ids (parallel) */
  images: File[]
  imageColorIds: number[]
  keepImageIds?: number[]
}

const basePath = '/api/dashboard/products'

function toFormData(payload: ProductFormPayload): FormData {
  const form = new FormData()
  form.append('Code', payload.code)
  form.append('Size', payload.size)
  form.append('Diameter', payload.diameter)
  form.append('HasWarranty', String(payload.hasWarranty))
  form.append('IsMadeToOrder', String(payload.isMadeToOrder))
  form.append('PowerAmperes', String(payload.powerAmperes))
  form.append('CategoryId', String(payload.categoryId))
  if (payload.subCategoryId != null && payload.subCategoryId > 0) {
    form.append('SubCategoryId', String(payload.subCategoryId))
  }
  form.append('Translations', JSON.stringify(payload.translations))
  form.append('BrandIds', JSON.stringify(payload.brandIds))
  form.append(
    'ManufacturerCountryIds',
    JSON.stringify(payload.manufacturerCountryIds),
  )
  form.append('ColorIds', JSON.stringify(payload.colorIds))
  form.append('ImageColorIds', JSON.stringify(payload.imageColorIds))
  form.append('KeepImageIds', JSON.stringify(payload.keepImageIds ?? []))

  for (const file of payload.images) {
    form.append('Images', file)
  }

  return form
}

export function getProducts(
  params: PaginationRequest = {},
): Promise<PaginationResponse<ProductListItem>> {
  return apiClient.get<PaginationResponse<ProductListItem>>(basePath, {
    query: params,
  })
}

export function getProductById(id: number): Promise<ProductDetail> {
  return apiClient.get<ProductDetail>(`${basePath}/${id}`)
}

export function createProduct(
  payload: ProductFormPayload,
): Promise<ProductDetail> {
  return apiClient.post<ProductDetail>(basePath, toFormData(payload))
}

export function updateProduct(
  id: number,
  payload: ProductFormPayload,
): Promise<ProductDetail> {
  return apiClient.put<ProductDetail>(`${basePath}/${id}`, toFormData(payload))
}

export function deleteProduct(id: number): Promise<void> {
  return apiClient.delete(`${basePath}/${id}`)
}
