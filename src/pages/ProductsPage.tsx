import { useMemo, useState } from 'react'
import { CustomSelect } from '../components/products/CustomSelect'
import { ProductListCard } from '../components/products/ProductListCard'
import { products } from '../data/products'
import { useI18n } from '../i18n/I18nContext'

function uniqueValues(field: 'country' | 'brand' | 'size') {
  return products
    .map((product) => product[field])
    .filter((value, index, list) => list.indexOf(value) === index)
}

export function ProductsPage() {
  const { t } = useI18n()
  const [country, setCountry] = useState('')
  const [brand, setBrand] = useState('')
  const [size, setSize] = useState('')

  const countries = useMemo(() => uniqueValues('country'), [])
  const brands = useMemo(() => uniqueValues('brand'), [])
  const sizes = useMemo(() => uniqueValues('size'), [])

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (country && product.country !== country) return false
      if (brand && product.brand !== brand) return false
      if (size && product.size !== size) return false
      return true
    })
  }, [country, brand, size])

  const countText = t('products.resultCount').replace(
    '{count}',
    String(filtered.length),
  )

  return (
    <main className="products-page">
      <div className="products-page__layout container-fluid">
        <aside className="products-page__sidebar">
          <div className="filters">
            <div className="filters__controls">
              <div className="filters__group">
                <label className="filters__label" htmlFor="filterCountryTrigger">
                  {t('products.filters.country')}
                </label>
                <div className="filters__select-wrap">
                  <CustomSelect
                    id="filterCountry"
                    value={country}
                    placeholder={t('products.filters.placeholder')}
                    options={countries}
                    onChange={setCountry}
                  />
                </div>
              </div>

              <div className="filters__group">
                <label className="filters__label" htmlFor="filterBrandTrigger">
                  {t('products.filters.brand')}
                </label>
                <div className="filters__select-wrap">
                  <CustomSelect
                    id="filterBrand"
                    value={brand}
                    placeholder={t('products.filters.placeholder')}
                    options={brands}
                    onChange={setBrand}
                  />
                </div>
              </div>

              <div className="filters__group">
                <label className="filters__label" htmlFor="filterSizeTrigger">
                  {t('products.filters.size')}
                </label>
                <div className="filters__select-wrap">
                  <CustomSelect
                    id="filterSize"
                    value={size}
                    placeholder={t('products.filters.placeholder')}
                    options={sizes}
                    onChange={setSize}
                  />
                </div>
              </div>

              <button
                type="button"
                className="filters__clear"
                onClick={() => {
                  setCountry('')
                  setBrand('')
                  setSize('')
                }}
              >
                {t('products.filters.clear')}
              </button>
            </div>
          </div>
        </aside>

        <div className="products-page__content">
          <header className="products-page__header">
            <h1 className="products-page__title">{t('nav.products')}</h1>
            <p className="products-page__count">{countText}</p>
          </header>

          {filtered.length === 0 ? (
            <p className="products-page__empty">{t('products.notFound')}</p>
          ) : (
            <div className="products-page__grid">
              {filtered.map((product) => (
                <ProductListCard key={product.code} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
