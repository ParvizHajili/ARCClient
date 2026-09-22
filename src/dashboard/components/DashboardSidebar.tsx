import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

interface NavChild {
  to: string
  label: string
  permission?: string
}

interface NavGroup {
  id: string
  label: string
  children: NavChild[]
}

const topLinks: NavChild[] = [
  { to: '/dashboard/products', label: 'Məhsullar', permission: 'Products.List' },
  { to: '/dashboard/users', label: 'İstifadəçilər', permission: 'Users.List' },
]

const navGroups: NavGroup[] = [
  {
    id: 'directories',
    label: 'Soraqçalar',
    children: [
      {
        to: '/dashboard/categories',
        label: 'Kateqoriyalar',
        permission: 'Categories.List',
      },
      {
        to: '/dashboard/manufacturer-countries',
        label: 'İstehsalçı ölkə',
        permission: 'ManufacturerCountries.List',
      },
      { to: '/dashboard/brands', label: 'Marka', permission: 'Brands.List' },
      { to: '/dashboard/colors', label: 'Rəng', permission: 'Colors.List' },
    ],
  },
]

function groupHasActiveChild(group: NavGroup, pathname: string) {
  return group.children.some(
    (child) =>
      pathname === child.to || pathname.startsWith(`${child.to}/`),
  )
}

export function DashboardSidebar() {
  const { pathname } = useLocation()
  const { can } = useAuth()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const group of navGroups) {
      initial[group.id] = groupHasActiveChild(group, pathname)
    }
    return initial
  })

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev }
      for (const group of navGroups) {
        if (groupHasActiveChild(group, pathname)) {
          next[group.id] = true
        }
      }
      return next
    })
  }, [pathname])

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const visibleTopLinks = topLinks.filter(
    (item) => !item.permission || can(item.permission),
  )

  return (
    <nav className="dash-nav" aria-label="Dashboard menyu">
      <ul className="dash-nav__list dash-nav__list--top">
        {visibleTopLinks.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={false}
              className={({ isActive }) =>
                `dash-nav__link${isActive ? ' is-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {navGroups.map((group) => {
        const visibleChildren = group.children.filter(
          (item) => !item.permission || can(item.permission),
        )
        if (visibleChildren.length === 0) return null

        const isOpen = Boolean(openGroups[group.id])
        const panelId = `dash-nav-panel-${group.id}`

        return (
          <div key={group.id} className="dash-nav__group">
            <button
              type="button"
              className={`dash-nav__toggle${isOpen ? ' is-open' : ''}`}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleGroup(group.id)}
            >
              <span>{group.label}</span>
              <span className="dash-nav__chevron" aria-hidden />
            </button>

            <div
              id={panelId}
              className={`dash-nav__panel${isOpen ? ' is-open' : ''}`}
              hidden={!isOpen}
            >
              <ul className="dash-nav__list">
                {visibleChildren.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={false}
                      className={({ isActive }) =>
                        `dash-nav__link${isActive ? ' is-active' : ''}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
