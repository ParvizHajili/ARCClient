import { Link } from 'react-router-dom'
import { categoryGroups } from '../../data/categories'
import { useI18n } from '../../i18n/I18nContext'
import { Reveal } from '../Reveal'

/** Homepage catalog cards — architectural group (Raduga-style leaf grid). */
const catalogItems = categoryGroups[0].items

export function Categories() {
  const { t } = useI18n()

  return (
    <section className="categories-section" id="categories" aria-labelledby="categories-title">
      <div className="categories-section__container container-fluid">
        <Reveal as="header" className="categories-section__header">
          <div className="categories-section__intro">
            <span className="categories-section__eyebrow">
              {t('categories.eyebrow')}
            </span>
            <h2 className="categories-section__title" id="categories-title">
              {t('categories.title')}
            </h2>
          </div>
        </Reveal>

        <div className="categories-section__grid">
          {catalogItems.map((item, index) => {
            const title = t(`categories.items.${item.id}`)
            const hasChildren = Boolean(item.children?.length)
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
                        {item.children!.map((childId) => (
                          <li key={childId}>{t(`categories.subs.${childId}`)}</li>
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
