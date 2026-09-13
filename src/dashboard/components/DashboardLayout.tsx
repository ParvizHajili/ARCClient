import { NavLink, Outlet } from 'react-router-dom'
import { DashboardSidebar } from './DashboardSidebar'

export function DashboardLayout() {
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
