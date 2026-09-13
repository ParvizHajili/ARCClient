import { apiClient } from './apiClient'
import type {
  CategoryDetail,
  CreateCategoryPayload,
  PaginationRequest,
  PaginationResponse,
  UpdateCategoryPayload,
} from './types'

const basePath = '/api/dashboard/categories'

function toCreateFormData(payload: CreateCategoryPayload): FormData {
  const form = new FormData()
  form.append('Image', payload.image)
  form.append('Order', String(payload.order))
  form.append('Translations', JSON.stringify(payload.translations))
  form.append('SubCategories', JSON.stringify(payload.subCategories))
  return form
}

function toUpdateFormData(payload: UpdateCategoryPayload): FormData {
  const form = new FormData()
  if (payload.image) {
    form.append('Image', payload.image)
  }
  form.append('Order', String(payload.order))
  form.append('Translations', JSON.stringify(payload.translations))
  form.append('SubCategories', JSON.stringify(payload.subCategories))
  return form
}

export function createCategory(
  payload: CreateCategoryPayload,
): Promise<CategoryDetail> {
  return apiClient.post<CategoryDetail>(basePath, toCreateFormData(payload))
}

export function updateCategory(
  id: number,
  payload: UpdateCategoryPayload,
): Promise<CategoryDetail> {
  return apiClient.put<CategoryDetail>(
    `${basePath}/${id}`,
    toUpdateFormData(payload),
  )
}

export function getCategories(
  params: PaginationRequest = {},
): Promise<PaginationResponse<CategoryDetail>> {
  return apiClient.get<PaginationResponse<CategoryDetail>>(basePath, {
    query: params,
  })
}

export function getCategoryById(id: number): Promise<CategoryDetail> {
  return apiClient.get<CategoryDetail>(`${basePath}/${id}`)
}

export function deleteCategory(id: number): Promise<void> {
  return apiClient.delete(`${basePath}/${id}`)
}
