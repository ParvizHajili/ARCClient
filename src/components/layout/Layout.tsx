import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ThemeProvider, useTheme } from '../../theme/ThemeContext'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { ScrollTop } from './ScrollTop'

function SiteShell() {
  const location = useLocation()
  const { theme, flash } = useTheme()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }

    window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  return (
    <div className="site-shell" data-theme={theme}>
      {flash ? (
        <span
          key={flash.id}
          className="site-shell__flash"
          style={{ left: flash.x, top: flash.y }}
          aria-hidden="true"
        />
      ) : null}
      <Navbar />
      <Outlet />
      <ScrollTop />
      <Footer />
    </div>
  )
}

export function Layout() {
  return (
    <ThemeProvider>
      <SiteShell />
    </ThemeProvider>
  )
}
