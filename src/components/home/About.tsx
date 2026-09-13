import { useI18n } from '../../i18n/I18nContext'

export function About() {
  const { t } = useI18n()

  return (
    <section className="about-section" id="about">
      <div className="about-section__container container-fluid">
        <div className="about-section__media">
          <img
            className="about-section__image"
            src="/assets/images/about/about-showroom-preview.jpg"
            alt="ARC lighting showroom"
            width={1280}
            height={720}
            loading="lazy"
          />
        </div>

        <div className="about-section__content">
          <span className="about-section__eyebrow">{t('about.eyebrow')}</span>

          <h2 className="about-section__title">
            <span className="about-section__title-line">{t('about.titleLine1')}</span>
            <span className="about-section__title-line">{t('about.titleLine2')}</span>
          </h2>

          <p className="about-section__description">{t('about.description')}</p>

          <div className="about-section__stats">
            <div className="about-section__stat">
              <strong className="about-section__stat-value">10+</strong>
              <span className="about-section__stat-label">
                {t('about.stats.experience')}
              </span>
            </div>

            <div className="about-section__stat">
              <strong className="about-section__stat-value">500+</strong>
              <span className="about-section__stat-label">
                {t('about.stats.projects')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
