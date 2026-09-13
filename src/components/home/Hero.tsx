import { useI18n } from '../../i18n/I18nContext'

export function Hero() {
  const { t } = useI18n()

  return (
    <section className="hero-section hero-arc" id="hero" aria-labelledby="hero-title">
      <div className="hero-arc__background" aria-hidden="true">
        <img
          className="hero-arc__image"
          src="/assets/images/hero-bg.png"
          alt=""
          width={1280}
          height={952}
          fetchPriority="high"
        />
        <div className="hero-arc__overlay"></div>
      </div>

      <div className="hero-arc__container">
        <div className="hero-arc__content">
          <span className="hero-arc__badge">{t('hero.badge')}</span>
          <h1 className="hero-arc__title" id="hero-title">
            {t('hero.title')}
          </h1>
          <p className="hero-arc__subtitle">{t('hero.subtitle')}</p>
          <div className="hero-arc__actions">
            <a className="btn-arc btn-arc--primary" href="#products">
              {t('hero.ctaPrimary')}
            </a>
            <a className="btn-arc btn-arc--outline" href="#contact">
              {t('hero.ctaSecondary')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
