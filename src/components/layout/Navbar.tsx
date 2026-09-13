import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nContext'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Navbar() {
  const { t } = useI18n()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const aboutHref = location.pathname === '/' ? '#about' : '/#about'
  const contactHref = location.pathname === '/' ? '#contact' : '/#contact'

  return (
    <header className="site-header">
      <nav className="navbar-arc" aria-label="Main navigation" ref={navRef}>
        <div className="navbar-arc__container container-fluid">
          <Link className="navbar-arc__brand" to="/" aria-label="Arc home">
            ARC
          </Link>

          <div
            className={`navbar-arc__menu${menuOpen ? ' is-open' : ''}`}
            id="mainMenu"
          >
            <ul className="navbar-arc__list">
              <li>
                <Link
                  className="navbar-arc__link"
                  to="/products"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <a
                  className="navbar-arc__link"
                  href={aboutHref}
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.about')}
                </a>
              </li>
              <li>
                <a
                  className="navbar-arc__link"
                  href={contactHref}
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.contact')}
                </a>
              </li>
            </ul>
          </div>

          <div className="navbar-arc__actions">
            <LanguageSwitcher />

            <button
              className="navbar-arc__toggle"
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mainMenu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <div
          className={`navbar-arc__overlay${menuOpen ? ' is-visible' : ''}`}
          id="menuOverlay"
          aria-hidden={!menuOpen}
          onClick={() => setMenuOpen(false)}
        />
      </nav>
    </header>
  )
}
