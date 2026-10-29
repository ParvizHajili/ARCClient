import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getPublicContactInfo,
  toTelHref,
  type PublicContactInfo,
} from '../../api/contactInfo'
import { useI18n } from '../../i18n/I18nContext'
import { useTheme } from '../../theme/ThemeContext'

const FALLBACK_PHONE = '+994 50 123 45 67'

export function Footer() {
  const { t } = useI18n()
  const { theme } = useTheme()
  const footerRef = useRef<HTMLElement>(null)
  const [spotsOn, setSpotsOn] = useState(false)
  const [contact, setContact] = useState<PublicContactInfo | null>(null)

  useEffect(() => {
    let active = true
    void getPublicContactInfo()
      .then((data) => {
        if (active) setContact(data)
      })
      .catch(() => {
        if (active) setContact(null)
      })
    return () => {
      active = false
    }
  }, [])

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

  const phones = [contact?.phone1, contact?.phone2]
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p))
  const displayPhones = phones.length > 0 ? phones : [FALLBACK_PHONE]
  const instagramUrl = contact?.instagramUrl?.trim() || null
  const facebookUrl = contact?.facebookUrl?.trim() || null

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
            {displayPhones.map((phone) => (
              <a
                key={phone}
                className="site-footer__link"
                href={toTelHref(phone)}
              >
                {phone}
              </a>
            ))}
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
          {instagramUrl ? (
            <a
              className="site-footer__social-link"
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
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
          ) : null}
          {facebookUrl ? (
            <a
              className="site-footer__social-link"
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
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
          ) : null}
        </div>

        <p className="site-footer__copyright">{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}
