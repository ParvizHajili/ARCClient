import { useEffect, useState } from 'react'
import { getPublicAbout, type PublicAbout } from '../../api/about'
import { useI18n } from '../../i18n/I18nContext'
import { Reveal } from '../Reveal'

const FALLBACK_IMAGE = '/assets/images/about/about-showroom-preview.jpg'

function splitTitle(title: string): string[] {
  const lines = title
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  return lines.length > 0 ? lines : [title]
}

function resolveContent(
  data: PublicAbout | null,
  fallbackTitle: string,
  fallbackDescription: string,
) {
  const imageUrl = data?.imageUrl?.trim() || FALLBACK_IMAGE
  const title = data?.title?.trim() || fallbackTitle
  const description = data?.description?.trim() || fallbackDescription
  return { imageUrl, title, description, titleLines: splitTitle(title) }
}

export function About() {
  const { t, lang } = useI18n()
  const [data, setData] = useState<PublicAbout | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    void getPublicAbout(lang)
      .then((result) => {
        if (!active) return
        setData(result)
      })
      .catch(() => {
        if (!active) return
        setData(null)
      })
      .finally(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [lang])

  const fallbackTitle = `${t('about.titleLine1')}\n${t('about.titleLine2')}`
  const { imageUrl, description, titleLines } = resolveContent(
    data,
    fallbackTitle,
    t('about.description'),
  )

  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div className="about-section__ambient" aria-hidden="true" />

      <div
        className={`about-section__container container-fluid${ready ? ' is-loaded' : ''}`}
      >
        <Reveal className="about-section__media">
          <img
            className="about-section__image"
            src={imageUrl}
            alt=""
            width={1200}
            height={960}
            loading="lazy"
          />
        </Reveal>

        <Reveal className="about-section__content" delay={40}>
          <span className="about-section__eyebrow">{t('about.eyebrow')}</span>
          <h2 className="about-section__title" id="about-title">
            {titleLines.map((line, index) => (
              <span
                key={`${index}-${line}`}
                className="about-section__title-line"
              >
                {line}
              </span>
            ))}
          </h2>
          <span className="about-section__rule" aria-hidden="true" />
          <p className="about-section__description">{description}</p>

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
