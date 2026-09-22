import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, refreshPermissions } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) return
    void refreshPermissions()
  }, [isAuthenticated, location.pathname, refreshPermissions])

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return children
}
