import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getMe, login as loginRequest } from '../api/auth'
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  hasPermission,
  persistAuth,
  persistUser,
  type AuthUser,
} from './authStorage'

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (userNameOrEmail: string, password: string) => Promise<void>
  logout: () => void
  refreshPermissions: () => Promise<void>
  can: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())

  const logout = useCallback(() => {
    clearAuth()
    setToken(null)
    setUser(null)
  }, [])

  const refreshPermissions = useCallback(async () => {
    const currentToken = getStoredToken()
    if (!currentToken) return

    try {
      const me = await getMe()
      persistUser(me)
      setUser(me)
      setToken(currentToken)
    } catch {
      // 401 handled by apiClient; ignore transient failures here
    }
  }, [])

  const login = useCallback(async (userNameOrEmail: string, password: string) => {
    const result = await loginRequest({ userNameOrEmail, password })
    persistAuth(result.accessToken, result.user)
    setToken(result.accessToken)
    setUser(result.user)
  }, [])

  useEffect(() => {
    if (!token) return
    void refreshPermissions()
  }, [token, refreshPermissions])

  useEffect(() => {
    if (!token) return

    function onFocus() {
      void refreshPermissions()
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        void refreshPermissions()
      }
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [token, refreshPermissions])

  const can = useCallback(
    (permission: string) => hasPermission(user, permission),
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshPermissions,
      can,
    }),
    [token, user, login, logout, refreshPermissions, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
