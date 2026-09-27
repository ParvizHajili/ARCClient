import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nContext'
import { useTheme } from '../../theme/ThemeContext'

export function Footer() {
  const { t } = useI18n()
  const { theme } = useTheme()
  const footerRef = useRef<HTMLElement>(null)
  const [spotsOn, setSpotsOn] = useState(false)

  useEffect(() => {
    const node = footerRef.current
    if (!node || theme !== 'dark') {
      setSpotsOn(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSpotsOn(entry.isIntersecting)
        if (!entry.isIntersecting) return
        const button = document.querySelector('.contact-form__submit')
        if (!button) return
        const top = button.getBoundingClientRect().top
        const reach = Math.max(window.innerHeight - top + 90, 260)
        document.documentElement.style.setProperty('--spot-reach', `${reach}px`)
      },
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [theme])

  return (
    <footer className="site-footer" ref={footerRef}>
      {theme === 'dark' ? (
        <div
          className={`footer-spots${spotsOn ? ' is-on' : ''}`}
          aria-hidden="true"
        >
          <span className="footer-spots__beam footer-spots__beam--left" />
          <span className="footer-spots__beam footer-spots__beam--right" />
        </div>
      ) : null}
      <div className="site-footer__container container-fluid">
        <div className="site-footer__brand">
          <Link className="site-footer__logo" to="/" aria-label="ARC home">
            ARC
          </Link>
          <p className="site-footer__meta">
            <span>{t('footer.address')}</span>
            <a className="site-footer__link" href="tel:+994501234567">
              {t('footer.phone')}
            </a>
          </p>
        </div>

        <nav className="site-footer__navigation" aria-label="Footer navigation">
          <ul className="site-footer__list">
            <li>
              <Link className="site-footer__link" to="/#hero">
                {t('footer.home')}
              </Link>
            </li>
            <li>
              <Link className="site-footer__link" to="/products">
                {t('nav.products')}
              </Link>
            </li>
            <li>
              <Link className="site-footer__link" to="/#about">
                {t('nav.about')}
              </Link>
            </li>
            <li>
              <Link className="site-footer__link" to="/#contact">
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="site-footer__social">
          <a className="site-footer__social-link" href="#" aria-label="Instagram">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a className="site-footer__social-link" href="#" aria-label="Facebook">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
        </div>

        <p className="site-footer__copyright">{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}
