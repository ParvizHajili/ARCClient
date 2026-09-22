const TOKEN_KEY = 'arc-auth-token'
const USER_KEY = 'arc-auth-user'

export interface AuthUser {
  id: number
  userName: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  roles: string[]
  permissions: string[]
}

export interface LoginResponse {
  accessToken: string
  expiresAtUtc: string
  user: AuthUser
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function persistAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function persistUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function hasPermission(
  user: AuthUser | null | undefined,
  permission: string,
): boolean {
  if (!user) return false
  if (user.roles.some((r) => r.toUpperCase() === 'SUPERADMIN')) return true
  return user.permissions.some(
    (p) => p.toLowerCase() === permission.toLowerCase(),
  )
}
