import { useI18n } from '../../i18n/I18nContext'
import { Reveal } from '../Reveal'

export function About() {
  const { t } = useI18n()

  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="about-section__ambient" aria-hidden="true" />

      <div className="about-section__container container-fluid">
        <Reveal className="about-section__media">
          <img
            className="about-section__image"
            src="/assets/images/about/about-showroom-preview.jpg"
            alt=""
            width={1280}
            height={720}
            loading="lazy"
          />
        </Reveal>

        <Reveal className="about-section__content" delay={40}>
          <span className="about-section__eyebrow">{t('about.eyebrow')}</span>
          <h2 className="about-section__title" id="about-title">
            <span className="about-section__title-line">{t('about.titleLine1')}</span>
            <span className="about-section__title-line">{t('about.titleLine2')}</span>
          </h2>
          <span className="about-section__rule" aria-hidden="true" />
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
        </Reveal>
      </div>
    </section>
  )
}
