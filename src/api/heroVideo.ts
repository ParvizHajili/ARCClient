import { apiClient } from './apiClient'

export interface HeroVideo {
  videoUrl: string | null
}

export function getPublicHeroVideo(): Promise<HeroVideo> {
  return apiClient.get<HeroVideo>('/api/hero-video', { skipAuth: true })
}

export function getHeroVideo(): Promise<HeroVideo> {
  return apiClient.get<HeroVideo>('/api/dashboard/hero-video')
}

export function saveHeroVideo(video: File): Promise<HeroVideo> {
  const form = new FormData()
  form.append('video', video)
  return apiClient.put<HeroVideo>('/api/dashboard/hero-video', form)
}
