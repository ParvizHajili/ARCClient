import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicCategories } from '../../api/categories'
import type { CategoryDetail, LanguageCode } from '../../api/types'
import { useI18n } from '../../i18n/I18nContext'
import { Reveal } from '../Reveal'

function translatedName(
  translations: Array<{ languageCode: string; name: string }>,
  lang: LanguageCode,
) {
  return (
    translations.find((item) => item.languageCode === lang)?.name ??
    translations.find((item) => item.languageCode === 'az')?.name ??
    translations[0]?.name ??
    ''
  )
}

export function Categories() {
  const { t, lang } = useI18n()
  const [items, setItems] = useState<CategoryDetail[]>([])

  useEffect(() => {
    let active = true
    void getPublicCategories()
      .then((data) => {
        if (active) setItems(data)
      })
      .catch(() => {
        if (active) setItems([])
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="categories-section" id="categories" aria-labelledby="categories-title">
      <div className="categories-section__container container-fluid">
        <Reveal as="header" className="categories-section__header">
          <div className="categories-section__intro">
            <h2 className="categories-section__title" id="categories-title">
              {t('categories.title')}
            </h2>
          </div>
        </Reveal>

        <div className="categories-section__grid">
          {items.map((item, index) => {
            const title = translatedName(item.translations, lang)
            const hasChildren = item.subCategories.length > 0
            const isAccent = (index + 1) % 3 === 0

            return (
              <Reveal key={item.id} delay={index * 28}>
                <Link
                  to={`/products?category=${item.id}`}
                  className={[
                    'category-card',
                    hasChildren ? 'category-card--has-subs' : '',
                    isAccent ? 'category-card--accent' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="category-card__title">{title}</span>

                  <div className="category-card__media" aria-hidden="true">
                    <img
                      className="category-card__image"
                      src={item.image}
                      alt=""
                      loading="lazy"
                    />
                  </div>

                  {hasChildren ? (
                    <div className="category-card__subs">
                      <ul className="category-card__subs-list">
                        {item.subCategories.map((child) => (
                          <li key={child.id}>
                            {translatedName(child.translations, lang)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
