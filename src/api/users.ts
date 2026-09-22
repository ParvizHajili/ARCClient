import { apiClient } from './apiClient'
import type { PaginationRequest, PaginationResponse } from './types'

export interface UserListItem {
  id: number
  userName: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  isActive: boolean
  roles: string[]
  permissionCount: number
  createDate: string
}

export interface UserDetail {
  id: number
  userName: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  isActive: boolean
  roles: string[]
  permissionCodes: string[]
  effectivePermissions: string[]
  createDate: string
  updatedDate?: string | null
}

export interface CreateUserPayload {
  userName: string
  email: string
  firstName: string
  lastName: string
  password: string
  isActive: boolean
  permissionCodes: string[]
}

export interface UpdateUserPayload {
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  password?: string | null
  permissionCodes: string[]
}

export interface PermissionItem {
  id: number
  code: string
  module: string
  action: string
  displayName: string
  description?: string | null
}

export interface PermissionModule {
  module: string
  permissions: PermissionItem[]
}

const usersPath = '/api/dashboard/users'
const permissionsPath = '/api/dashboard/permissions'

export function getUsers(
  params: PaginationRequest = {},
): Promise<PaginationResponse<UserListItem>> {
  return apiClient.get<PaginationResponse<UserListItem>>(usersPath, {
    query: params,
  })
}

export function getUserById(id: number): Promise<UserDetail> {
  return apiClient.get<UserDetail>(`${usersPath}/${id}`)
}

export function createUser(payload: CreateUserPayload): Promise<UserDetail> {
  return apiClient.post<UserDetail>(usersPath, payload)
}

export function updateUser(
  id: number,
  payload: UpdateUserPayload,
): Promise<UserDetail> {
  return apiClient.put<UserDetail>(`${usersPath}/${id}`, payload)
}

export function deleteUser(id: number): Promise<void> {
  return apiClient.delete(`${usersPath}/${id}`)
}

export function getPermissionModules(): Promise<PermissionModule[]> {
  return apiClient.get<PermissionModule[]>(permissionsPath)
}
