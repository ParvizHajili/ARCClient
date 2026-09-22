import { apiClient } from './apiClient'
import type { AuthUser, LoginResponse } from '../auth/authStorage'

export type { AuthUser, LoginResponse }

export interface LoginRequest {
  userNameOrEmail: string
  password: string
}

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/api/dashboard/auth/login', payload, {
    skipAuth: true,
  })
}

export function getMe(): Promise<AuthUser> {
  return apiClient.get<AuthUser>('/api/dashboard/auth/me')
}
