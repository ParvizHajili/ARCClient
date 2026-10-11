import { apiClient } from './apiClient'
import type { PaginationResponse } from './types'

export interface PublicProductCard {
  id: number
  code: string
  name: string
  description: string
  imageUrl: string | null
  categoryId: number
  subCategoryId: number | null
  hasWarranty: boolean
  isMadeToOrder: boolean
}

export interface CatalogFilterOption {
  id: number
  label: string
  hexCode?: string | null
}

export interface CatalogFilterOptions {
  brands: CatalogFilterOption[]
  sizes: CatalogFilterOption[]
  diameters: CatalogFilterOption[]
  powers: CatalogFilterOption[]
  countries: CatalogFilterOption[]
  colors: CatalogFilterOption[]
}

export interface ProductCatalogQuery {
  categoryId?: number | null
  subCategoryIds?: number[]
  brandIds?: number[]
  sizeIds?: number[]
  diameterIds?: number[]
  powerIds?: number[]
  countryIds?: number[]
  colorIds?: number[]
  hasWarranty?: boolean | null
  isMadeToOrder?: boolean | null
  search?: string
  lang?: string
  page?: number
  pageSize?: number
}

function idsQuery(key: string, ids?: number[]): Record<string, string | number> {
  if (!ids?.length) return {}
  return { [key]: ids.join(',') }
}

export function getPublicProducts(
  query: ProductCatalogQuery = {},
): Promise<PaginationResponse<PublicProductCard>> {
  const {
    categoryId,
    subCategoryIds,
    brandIds,
    sizeIds,
    diameterIds,
    powerIds,
    countryIds,
    colorIds,
    hasWarranty,
    isMadeToOrder,
    search,
    lang,
    page = 1,
    pageSize = 12,
  } = query

  return apiClient.get<PaginationResponse<PublicProductCard>>('/api/products', {
    skipAuth: true,
    query: {
      page,
      pageSize,
      lang,
      search: search || undefined,
      categoryId: categoryId || undefined,
      hasWarranty: hasWarranty == null ? undefined : hasWarranty,
      isMadeToOrder: isMadeToOrder == null ? undefined : isMadeToOrder,
      ...idsQuery('subCategoryIds', subCategoryIds),
      ...idsQuery('brandIds', brandIds),
      ...idsQuery('sizeIds', sizeIds),
      ...idsQuery('diameterIds', diameterIds),
      ...idsQuery('powerIds', powerIds),
      ...idsQuery('countryIds', countryIds),
      ...idsQuery('colorIds', colorIds),
    },
  })
}

export function getCatalogFilters(lang?: string): Promise<CatalogFilterOptions> {
  return apiClient.get<CatalogFilterOptions>('/api/filters', {
    skipAuth: true,
    query: { lang },
  })
}

export interface PublicProductDetail {
  id: number
  code: string
  hasWarranty: boolean
  isMadeToOrder: boolean
  categoryId: number
  categoryName: string
  subCategoryId: number | null
  subCategoryName: string | null
  translations: Array<{
    languageCode: string
    name: string
    description: string
  }>
  brands: Array<{ id: number; name: string }>
  sizes: Array<{ id: number; name: string }>
  diameters: Array<{ id: number; name: string }>
  powers: Array<{ id: number; name: string }>
  manufacturerCountries: Array<{ id: number; name: string }>
  images: Array<{ id: number; imageUrl: string; order: number }>
  colors: Array<{
    colorId: number
    hexCode: string
    name: string
    images: Array<{ id: number; imageUrl: string; order: number }>
  }>
  hasSpin: boolean
}

export function getPublicProduct(
  id: number,
  lang?: string,
  signal?: AbortSignal,
): Promise<PublicProductDetail> {
  return apiClient.get<PublicProductDetail>(`/api/products/${id}`, {
    skipAuth: true,
    query: { lang },
    signal,
  })
}

export interface PublicSpinFrame {
  id: number
  imageUrl: string
  order: number
}

export function getPublicProductSpin(id: number): Promise<PublicSpinFrame[]> {
  return apiClient.get<PublicSpinFrame[]>(`/api/products/${id}/spin`, {
    skipAuth: true,
  })
}
