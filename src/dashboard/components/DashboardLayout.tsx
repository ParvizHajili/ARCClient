import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { DashboardSidebar } from './DashboardSidebar'

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="dash">
      <aside className="dash__sidebar">
        <div className="dash__brand">
          <NavLink to="/dashboard" className="dash__logo">
            ARC
          </NavLink>
          <span className="dash__brand-label">Dashboard</span>
        </div>
        <DashboardSidebar />
        <div className="dash__sidebar-foot">
          {user && (
            <div className="dash__user">
              <p className="dash__user-name">{user.displayName}</p>
              <p className="dash__user-meta">@{user.userName}</p>
              <button
                type="button"
                className="dash__logout"
                onClick={handleLogout}
              >
                Çıxış
              </button>
            </div>
          )}
          <a
            href="/"
            className="dash__site-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sayta qayıt
          </a>
        </div>
      </aside>

      <div className="dash__main">
        <Outlet />
      </div>
    </div>
  )
}
