import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPublicCategories } from '../api/categories'
import {
  getCatalogFilters,
  getPublicProducts,
  type CatalogFilterOptions,
  type PublicProductCard,
} from '../api/publicCatalog'
import type { CategoryDetail } from '../api/types'
import {
  emptyProductFilters,
  ProductFilters,
  type ProductFilterState,
} from '../components/products/ProductFilters'
import { ProductListCard } from '../components/products/ProductListCard'
import { useI18n } from '../i18n/I18nContext'

const PAGE_SIZE = 12

function parseIds(raw: string | null): number[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0)
}

function parseBool(raw: string | null): boolean | null {
  if (raw === 'true' || raw === '1') return true
  if (raw === 'false' || raw === '0') return false
  return null
}

function filtersFromParams(params: URLSearchParams): ProductFilterState {
  const categoryRaw = params.get('category') ?? params.get('categoryId')
  const categoryId = categoryRaw ? Number(categoryRaw) : NaN

  return {
    categoryId: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : null,
    subCategoryIds: parseIds(
      params.get('subCategory') ?? params.get('subCategoryIds'),
    ),
    brandIds: parseIds(params.get('brandIds')),
    sizeIds: parseIds(params.get('sizeIds')),
    diameterIds: parseIds(params.get('diameterIds')),
    powerIds: parseIds(params.get('powerIds')),
    countryIds: parseIds(params.get('countryIds')),
    colorIds: parseIds(params.get('colorIds')),
    hasWarranty: parseBool(params.get('hasWarranty')),
    isMadeToOrder: parseBool(params.get('isMadeToOrder')),
  }
}

function writeParams(filters: ProductFilterState): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.categoryId) params.set('category', String(filters.categoryId))
  if (filters.subCategoryIds.length) {
    params.set('subCategory', filters.subCategoryIds.join(','))
  }
  if (filters.brandIds.length) params.set('brandIds', filters.brandIds.join(','))
  if (filters.sizeIds.length) params.set('sizeIds', filters.sizeIds.join(','))
  if (filters.diameterIds.length) {
    params.set('diameterIds', filters.diameterIds.join(','))
  }
  if (filters.powerIds.length) params.set('powerIds', filters.powerIds.join(','))
  if (filters.countryIds.length) {
    params.set('countryIds', filters.countryIds.join(','))
  }
  if (filters.colorIds.length) params.set('colorIds', filters.colorIds.join(','))
  if (filters.hasWarranty != null) {
    params.set('hasWarranty', String(filters.hasWarranty))
  }
  if (filters.isMadeToOrder != null) {
    params.set('isMadeToOrder', String(filters.isMadeToOrder))
  }
  return params
}

function countActiveFilters(filters: ProductFilterState): number {
  let count = 0
  if (filters.categoryId) count += 1
  count += filters.subCategoryIds.length
  count += filters.brandIds.length
  count += filters.sizeIds.length
  count += filters.diameterIds.length
  count += filters.powerIds.length
  count += filters.countryIds.length
  count += filters.colorIds.length
  if (filters.hasWarranty != null) count += 1
  if (filters.isMadeToOrder != null) count += 1
  return count
}

export function ProductsPage() {
  const { t, lang } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<ProductFilterState>(() =>
    filtersFromParams(searchParams),
  )
  const [categories, setCategories] = useState<CategoryDetail[]>([])
  const [options, setOptions] = useState<CatalogFilterOptions | null>(null)
  const [products, setProducts] = useState<PublicProductCard[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 992px)').matches
      : true,
  )

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const fetchLockRef = useRef(false)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 992px)')
    const onChange = () => setIsDesktop(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    setFilters(filtersFromParams(searchParams))
  }, [searchParams])

  useEffect(() => {
    let active = true
    void Promise.all([getPublicCategories(), getCatalogFilters(lang)])
      .then(([cats, filterOptions]) => {
        if (!active) return
        setCategories(cats)
        setOptions(filterOptions)
      })
      .catch(() => {
        if (!active) return
        setCategories([])
        setOptions(null)
      })
    return () => {
      active = false
    }
  }, [lang])

  const loadPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (fetchLockRef.current) return
      fetchLockRef.current = true

      if (append) setLoadingMore(true)
      else setLoading(true)

      try {
        const result = await getPublicProducts({
          categoryId: filters.categoryId,
          subCategoryIds: filters.subCategoryIds,
          brandIds: filters.brandIds,
          sizeIds: filters.sizeIds,
          diameterIds: filters.diameterIds,
          powerIds: filters.powerIds,
          countryIds: filters.countryIds,
          colorIds: filters.colorIds,
          hasWarranty: filters.hasWarranty,
          isMadeToOrder: filters.isMadeToOrder,
          lang,
          page: pageToLoad,
          pageSize: PAGE_SIZE,
        })

        setTotalCount(result.totalCount)
        setProducts((prev) =>
          append ? [...prev, ...result.items] : result.items,
        )
        setPage(pageToLoad)
        setHasMore(result.hasNext)
      } catch {
        if (!append) {
          setProducts([])
          setTotalCount(0)
        }
        setHasMore(false)
      } finally {
        fetchLockRef.current = false
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [filters, lang],
  )

  useEffect(() => {
    setProducts([])
    setPage(1)
    setHasMore(true)
    void loadPage(1, false)
  }, [loadPage])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        if (!hasMore || loading || loadingMore || fetchLockRef.current) return
        void loadPage(page + 1, true)
      },
      { root: null, rootMargin: '280px 0px', threshold: 0 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore, page, loadPage])

  useEffect(() => {
    document.body.classList.toggle('filters-open', filtersOpen)
    return () => document.body.classList.remove('filters-open')
  }, [filtersOpen])

  const filterLabels = useMemo(
    () => ({
      title: t('products.filters.title'),
      categories: t('products.filters.categories'),
      brands: t('products.filters.brand'),
      sizes: t('products.filters.size'),
      diameters: t('products.filters.diameter'),
      powers: t('products.filters.power'),
      countries: t('products.filters.country'),
      colors: t('products.filters.color'),
      features: t('products.filters.features'),
      warranty: t('products.filters.warranty'),
      madeToOrder: t('products.filters.madeToOrder'),
      clear: t('products.filters.clear'),
      apply: t('products.filters.apply'),
      yes: t('products.filters.yes'),
      no: t('products.filters.no'),
    }),
    [t],
  )

  const countText = t('products.resultCount').replace(
    '{count}',
    String(totalCount),
  )
  const activeCount = countActiveFilters(filters)

  function commitFilters(next: ProductFilterState) {
    setSearchParams(writeParams(next), { replace: true })
  }

  function clearFilters() {
    commitFilters(emptyProductFilters())
  }

  const filterPanel = (
    <ProductFilters
      categories={categories}
      options={options}
      value={filters}
      lang={lang}
      labels={filterLabels}
      onChange={commitFilters}
      onClear={clearFilters}
      showApply={filtersOpen}
      onApply={() => setFiltersOpen(false)}
    />
  )

  return (
    <main className="products-page">
      <div className="products-page__layout container-fluid">
        {isDesktop ? (
          <aside className="products-page__sidebar products-page__sidebar--desktop">
            {filterPanel}
          </aside>
        ) : null}

        <div className="products-page__content">
          <header className="products-page__header">
            <div className="products-page__heading">
              <h1 className="products-page__title">{t('nav.products')}</h1>
              <p className="products-page__count">{countText}</p>
            </div>

            {!isDesktop ? (
              <button
                type="button"
                className="products-page__filter-toggle"
                onClick={() => setFiltersOpen(true)}
              >
                {t('products.filters.open')}
                {activeCount > 0 ? (
                  <span className="products-page__filter-badge">{activeCount}</span>
                ) : null}
              </button>
            ) : null}
          </header>

          {loading && products.length === 0 ? (
            <p className="products-page__empty">{t('products.loading')}</p>
          ) : products.length === 0 ? (
            <p className="products-page__empty">{t('products.notFound')}</p>
          ) : (
            <>
              <div className="products-page__grid">
                {products.map((product) => (
                  <ProductListCard key={product.id} product={product} />
                ))}
              </div>

              <div
                ref={sentinelRef}
                className="products-page__infinite"
                aria-hidden={!hasMore}
              >
                {loadingMore ? (
                  <p className="products-page__infinite-status">
                    {t('products.loadingMore')}
                  </p>
                ) : null}
                {!hasMore && products.length > 0 ? (
                  <p className="products-page__infinite-status">
                    {t('products.endOfList')}
                  </p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      {!isDesktop ? (
        <>
          <div
            className={`products-page__drawer-backdrop${filtersOpen ? ' is-open' : ''}`}
            onClick={() => setFiltersOpen(false)}
            aria-hidden={!filtersOpen}
          />
          <aside
            className={`products-page__drawer${filtersOpen ? ' is-open' : ''}`}
            aria-hidden={!filtersOpen}
          >
            <div className="products-page__drawer-bar">
              <p className="products-page__drawer-title">{t('products.filters.title')}</p>
              <button
                type="button"
                className="products-page__drawer-close"
                onClick={() => setFiltersOpen(false)}
                aria-label={t('products.filters.close')}
              >
                ×
              </button>
            </div>
            <div className="products-page__drawer-body">{filterPanel}</div>
          </aside>
        </>
      ) : null}
    </main>
  )
}
