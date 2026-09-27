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
  hasWarranty: boolean
  isMadeToOrder: boolean
  categoryId: number
  categoryName: string
  subCategoryId: number | null
  subCategoryName: string | null
  translations: ProductTranslation[]
  brands: ProductNamedRef[]
  sizes: ProductNamedRef[]
  diameters: ProductNamedRef[]
  powers: ProductNamedRef[]
  manufacturerCountries: ProductNamedRef[]
  images: ProductImageDetail[]
  colors: ProductColorDetail[]
}

export interface ProductListItem {
  id: number
  code: string
  name: string
  categoryName: string
  subCategoryName: string | null
  powers: string
  hasWarranty: boolean
  isMadeToOrder: boolean
}

export interface ProductFormPayload {
  code: string
  hasWarranty: boolean
  isMadeToOrder: boolean
  categoryId: number
  subCategoryId?: number | null
  translations: ProductTranslation[]
  brandIds: number[]
  sizeIds: number[]
  diameterIds: number[]
  powerIds: number[]
  manufacturerCountryIds: number[]
  colorIds: number[]
  /** New files + matching color ids (parallel) */
  images: File[]
  imageColorIds: number[]
  keepImageIds?: number[]
  /** Gallery files, not tied to a color */
  productImages: File[]
  keepProductImageIds?: number[]
}

const basePath = '/api/dashboard/products'

function toFormData(payload: ProductFormPayload): FormData {
  const form = new FormData()
  form.append('Code', payload.code)
  form.append('HasWarranty', String(payload.hasWarranty))
  form.append('IsMadeToOrder', String(payload.isMadeToOrder))
  form.append('CategoryId', String(payload.categoryId))
  if (payload.subCategoryId != null && payload.subCategoryId > 0) {
    form.append('SubCategoryId', String(payload.subCategoryId))
  }
  form.append('Translations', JSON.stringify(payload.translations))
  form.append('BrandIds', JSON.stringify(payload.brandIds))
  form.append('SizeIds', JSON.stringify(payload.sizeIds))
  form.append('DiameterIds', JSON.stringify(payload.diameterIds))
  form.append('PowerIds', JSON.stringify(payload.powerIds))
  form.append(
    'ManufacturerCountryIds',
    JSON.stringify(payload.manufacturerCountryIds),
  )
  form.append('ColorIds', JSON.stringify(payload.colorIds))
  form.append('ImageColorIds', JSON.stringify(payload.imageColorIds))
  form.append('KeepImageIds', JSON.stringify(payload.keepImageIds ?? []))
  form.append(
    'KeepProductImageIds',
    JSON.stringify(payload.keepProductImageIds ?? []),
  )

  for (const file of payload.images) {
    form.append('Images', file)
  }

  for (const file of payload.productImages) {
    form.append('ProductImages', file)
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
