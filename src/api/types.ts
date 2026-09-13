export type LanguageCode = 'az' | 'en' | 'ru'

export interface TranslationInput {
  languageCode: LanguageCode
  name: string
}

export interface SubCategoryInput {
  id?: number | null
  translations: TranslationInput[]
}

export interface CategoryDetail {
  id: number
  image: string
  order: number
  translations: TranslationInput[]
  subCategories: Array<{
    id: number
    translations: TranslationInput[]
  }>
}

export interface CreateCategoryPayload {
  image: File
  order: number
  translations: TranslationInput[]
  subCategories: SubCategoryInput[]
}

export interface UpdateCategoryPayload {
  image?: File | null
  order: number
  translations: TranslationInput[]
  subCategories: SubCategoryInput[]
}

/** Mirrors backend PaginationRequestDto */
export interface PaginationRequest {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

/** Mirrors backend PaginationResponseDto<T> */
export interface PaginationResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

export interface ApiValidationError {
  title?: string
  errors?: Record<string, string[]>
  detail?: string
}

export class ApiError extends Error {
  status: number
  errors: Record<string, string[]>

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}
