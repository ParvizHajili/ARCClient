import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface NavChild {
  to: string
  label: string
}

interface NavGroup {
  id: string
  label: string
  children: NavChild[]
}

const topLinks: NavChild[] = [
  { to: '/dashboard/products', label: 'Məhsullar' },
]

const navGroups: NavGroup[] = [
  {
    id: 'directories',
    label: 'Soraqçalar',
    children: [
      { to: '/dashboard/categories', label: 'Kateqoriyalar' },
      {
        to: '/dashboard/manufacturer-countries',
        label: 'İstehsalçı ölkə',
      },
      { to: '/dashboard/brands', label: 'Marka' },
      { to: '/dashboard/colors', label: 'Rəng' },
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

  return (
    <nav className="dash-nav" aria-label="Dashboard menyu">
      <ul className="dash-nav__list dash-nav__list--top">
        {topLinks.map((item) => (
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
                {group.children.map((item) => (
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
