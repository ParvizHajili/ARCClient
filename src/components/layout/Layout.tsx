import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ThemeProvider, useTheme } from '../../theme/ThemeContext'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { ScrollTop } from './ScrollTop'

function anchorPosition(element: HTMLElement) {
  return Math.round(element.getBoundingClientRect().top + window.scrollY)
}

function scrollToAnchor(id: string, behavior: ScrollBehavior) {
  const target = document.getElementById(id)
  if (!target) return null

  const root = document.documentElement
  const previous = root.style.scrollBehavior
  if (behavior === 'auto') root.style.scrollBehavior = 'auto'
  target.scrollIntoView({ block: 'start', behavior })
  root.style.scrollBehavior = previous
  return anchorPosition(target)
}

function SiteShell() {
  const location = useLocation()
  const { theme, flash } = useTheme()

  useEffect(() => {
    if (!location.hash) {
      const root = document.documentElement
      const previous = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      window.scrollTo(0, 0)
      root.style.scrollBehavior = previous
      return
    }

    const id = decodeURIComponent(location.hash.slice(1))
    let stopped = false
    let stableTicks = 0
    let lastPosition = scrollToAnchor(id, 'smooth')

    const realign = () => {
      if (stopped) return
      const target = document.getElementById(id)
      if (!target) {
        stableTicks = 0
        return
      }

      const position = anchorPosition(target)
      if (lastPosition === null || Math.abs(position - lastPosition) > 2) {
        lastPosition = scrollToAnchor(id, 'auto')
        stableTicks = 0
        return
      }

      stableTicks += 1
      if (stableTicks >= 8) stop()
    }

    const observer = new ResizeObserver(realign)
    observer.observe(document.body)
    const interval = window.setInterval(realign, 120)
    const timeout = window.setTimeout(stop, 4000)

    function stop() {
      if (stopped) return
      stopped = true
      observer.disconnect()
      window.clearInterval(interval)
      window.clearTimeout(timeout)
      window.removeEventListener('wheel', onUserScroll)
      window.removeEventListener('touchmove', onUserScroll)
    }

    function onUserScroll() {
      stop()
    }

    window.addEventListener('wheel', onUserScroll, { passive: true })
    window.addEventListener('touchmove', onUserScroll, { passive: true })

    return stop
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
