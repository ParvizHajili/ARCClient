import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nContext'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="site-footer">
      <div className="site-footer__container container-fluid">
        <div className="site-footer__brand">
          <Link className="site-footer__logo" to="/" aria-label="ARC home">
            ARC
          </Link>
          <address className="site-footer__address">
            <span className="site-footer__address-line">{t('footer.address')}</span>
          </address>
          <a className="site-footer__phone site-footer__link" href="tel:+994501234567">
            {t('footer.phone')}
          </a>

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
        </div>

        <nav className="site-footer__navigation" aria-label="Footer navigation">
          <h3 className="site-footer__heading">{t('footer.navigation')}</h3>
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
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__bottom-container container-fluid">
          <p className="site-footer__copyright">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
