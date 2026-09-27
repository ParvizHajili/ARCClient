import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { getPublicHeroVideo } from '../../api/heroVideo'

export function Hero() {
  const { t } = useI18n()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void getPublicHeroVideo()
      .then((data) => {
        if (active) setVideoUrl(data.videoUrl)
      })
      .catch(() => {
        if (active) setVideoUrl(null)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="hero-section hero-arc" id="hero" aria-labelledby="hero-title">
      <div className="hero-arc__background" aria-hidden="true">
        {videoUrl ? (
          <video
            className="hero-arc__video"
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        ) : (
          <img
            className="hero-arc__image"
            src="/assets/images/hero-bg.png"
            alt=""
            width={1280}
            height={952}
            fetchPriority="high"
          />
        )}
        <div className="hero-arc__overlay"></div>
      </div>

      <div className="hero-arc__container">
        <div className="hero-arc__content">
          <span className="hero-arc__eyebrow">{t('hero.badge')}</span>
          <span className="hero-arc__rule" aria-hidden="true" />
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
