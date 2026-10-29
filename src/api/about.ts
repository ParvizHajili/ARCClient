import { apiClient } from './apiClient'
import type { LanguageCode } from './types'

export interface AboutTranslation {
  languageCode: LanguageCode | string
  title: string
  description: string
}

export interface AboutDetail {
  id: number
  image: string
  translations: AboutTranslation[]
}

export interface PublicAbout {
  imageUrl: string | null
  title: string
  description: string
}

export interface CreateAboutPayload {
  image: File
  translations: AboutTranslation[]
}

export interface UpdateAboutPayload {
  image?: File | null
  translations: AboutTranslation[]
}

const basePath = '/api/dashboard/about'

function toFormData(payload: {
  image?: File | null
  translations: AboutTranslation[]
}): FormData {
  const form = new FormData()
  if (payload.image) {
    form.append('Image', payload.image)
  }
  form.append('Translations', JSON.stringify(payload.translations))
  return form
}

export function getPublicAbout(lang?: string): Promise<PublicAbout> {
  return apiClient.get<PublicAbout>('/api/about', {
    skipAuth: true,
    query: lang ? { lang } : undefined,
  })
}

export function getAboutList(): Promise<AboutDetail[]> {
  return apiClient.get<AboutDetail[]>(basePath)
}

export function getAboutById(id: number): Promise<AboutDetail> {
  return apiClient.get<AboutDetail>(`${basePath}/${id}`)
}

export function createAbout(payload: CreateAboutPayload): Promise<AboutDetail> {
  return apiClient.post<AboutDetail>(basePath, toFormData(payload))
}

export function updateAbout(
  id: number,
  payload: UpdateAboutPayload,
): Promise<AboutDetail> {
  return apiClient.put<AboutDetail>(`${basePath}/${id}`, toFormData(payload))
}
