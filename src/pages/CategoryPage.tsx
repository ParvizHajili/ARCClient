import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getPublicCategories } from '../api/categories'
import type { CategoryDetail } from '../api/types'
import { Reveal } from '../components/Reveal'
import { useI18n } from '../i18n/I18nContext'
import { resolveTranslatedName } from '../utils/translations'

export function CategoryPage() {
  const { id } = useParams<{ id: string }>()
  const { t, lang } = useI18n()
  const categoryId = Number(id)

  const [categories, setCategories] = useState<CategoryDetail[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    setFailed(false)

    void getPublicCategories()
      .then((data) => {
        if (active) setCategories(data)
      })
      .catch(() => {
        if (active) {
          setCategories([])
          setFailed(true)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const category = useMemo(() => {
    if (!categories || !Number.isFinite(categoryId)) return null
    return categories.find((item) => item.id === categoryId) ?? null
  }, [categories, categoryId])

  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    return <Navigate to="/" replace />
  }

  if (categories && !category) {
    return <Navigate to="/" replace />
  }

  if (category && category.subCategories.length === 0) {
    return <Navigate to={`/products?category=${category.id}`} replace />
  }

  const title = category ? resolveTranslatedName(category.translations, lang) : ''
  const subCount = category?.subCategories.length ?? 0
  const countText = t('categories.detail.count').replace(
    '{count}',
    String(subCount),
  )

  return (
    <main className="category-page" id="main-content">
      <div className="category-page__shell container-fluid">
        <Reveal as="header" className="category-page__hero">
          <div className="category-page__hero-copy">
            <Link to="/#categories" className="category-page__back">
              <span aria-hidden="true">←</span>
              {t('categories.detail.back')}
            </Link>

            <p className="category-page__eyebrow">{t('categories.eyebrow')}</p>
            <h1 className="category-page__title">
              {failed ? t('categories.detail.notFound') : title || '…'}
            </h1>
            {category ? <p className="category-page__lead">{countText}</p> : null}

            {category ? (
              <Link
                to={`/products?category=${category.id}`}
                className="category-page__all"
              >
                {t('categories.detail.viewAll')}
              </Link>
            ) : null}
          </div>

          <div className="category-page__hero-media" aria-hidden="true">
            {category?.image ? (
              <img
                className="category-page__hero-image"
                src={category.image}
                alt=""
              />
            ) : (
              <div className="category-page__hero-placeholder" />
            )}
          </div>
        </Reveal>

        <section
          className="category-page__subs"
          aria-labelledby="category-subs-title"
        >
          <Reveal as="header" className="category-page__subs-header">
            <h2 className="category-page__subs-title" id="category-subs-title">
              {t('categories.detail.subcategories')}
            </h2>
          </Reveal>

          {!categories ? (
            <div className="category-page__grid category-page__grid--loading">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="subcategory-card subcategory-card--skeleton"
                  aria-hidden="true"
                />
              ))}
            </div>
          ) : (
            <div className="category-page__grid">
              {category?.subCategories.map((sub, index) => {
                const name = resolveTranslatedName(sub.translations, lang)
                const isAccent = (index + 1) % 3 === 0
                const indexLabel = String(index + 1).padStart(2, '0')

                return (
                  <Reveal key={sub.id} delay={index * 36}>
                    <Link
                      to={`/products?category=${category.id}&subCategory=${sub.id}`}
                      className={[
                        'subcategory-card',
                        isAccent ? 'subcategory-card--accent' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className="subcategory-card__index">{indexLabel}</span>
                      <span className="subcategory-card__name">{name}</span>
                      <span className="subcategory-card__arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
