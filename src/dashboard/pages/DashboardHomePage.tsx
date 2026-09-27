import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getDashboardOverview,
  type DashboardOverview,
} from '../../api/dashboardOverview'
import { ApiError } from '../../api/types'

const COLORS = [
  '#c4a574',
  '#141414',
  '#2f6f6a',
  '#8a6d3f',
  '#3d5a80',
  '#b42318',
  '#6b6b6b',
]

export function DashboardHomePage() {
  const [data, setData] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void (async () => {
      setLoading(true)
      try {
        const overview = await getDashboardOverview()
        if (active) setData(overview)
      } catch (err) {
        if (active) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Statistika yüklənərkən xəta baş verdi.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const slices = useMemo(() => buildSlices(data?.productsByCategory ?? []), [data])
  const maxCategory = Math.max(
    1,
    ...(data?.productsByCategory.map((item) => item.productCount) ?? [1]),
  )
  const maxViews = Math.max(
    1,
    ...(data?.topProducts.map((item) => item.viewCount) ?? [1]),
  )

  return (
    <div className="dash-page dash-page--wide">
      <header className="dash-page__header">
        <h1 className="dash-page__title">Dashboard</h1>
      </header>

      {error && (
        <div className="dash-alert dash-alert--error" role="alert">
          {error}
        </div>
      )}

      {loading || !data ? (
        <p className="dash-empty">Yüklənir…</p>
      ) : (
        <>
          <section className="dash-stats">
            <Stat label="Kateqoriya" value={data.categoryCount} tone="gold" />
            <Stat label="Alt kateqoriya" value={data.subCategoryCount} tone="teal" />
            <Stat label="Məhsul" value={data.productCount} tone="ink" />
            <Stat label="Ümumi baxış" value={data.totalViews} tone="blue" />
            <Stat label="Son 30 gün" value={data.addedLast30Days} hint="yeni məhsul" />
            <Stat label="360 məhsul" value={data.spinProductCount} />
            <Stat label="Qarantiyalı" value={data.warrantyCount} />
            <Stat label="Sifarişlə" value={data.madeToOrderCount} />
            <Stat label="Marka" value={data.brandCount} />
            <Stat label="Rəng" value={data.colorCount} />
            <Stat label="İstehsalçı ölkə" value={data.manufacturerCountryCount} />
            <Stat label="Aktiv istifadəçi" value={data.userCount} />
          </section>

          <div className="dash-home-grid">
            <section className="dash-panel">
              <div className="dash-panel__head">
                <h2 className="dash-panel__title">Kateqoriyalar üzrə məhsul</h2>
              </div>
              {data.productsByCategory.length === 0 ? (
                <p className="dash-empty">Kateqoriya yoxdur.</p>
              ) : (
                <ul className="dash-bars">
                  {data.productsByCategory.map((item, index) => (
                    <li key={item.categoryId}>
                      <div className="dash-bars__meta">
                        <span>{item.name}</span>
                        <strong>{item.productCount}</strong>
                      </div>
                      <div className="dash-bars__track">
                        <span
                          style={{
                            width: `${(item.productCount / maxCategory) * 100}%`,
                            background: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="dash-panel">
              <div className="dash-panel__head">
                <h2 className="dash-panel__title">Məhsul payı</h2>
              </div>
              {data.productCount === 0 ? (
                <p className="dash-empty">Məhsul yoxdur.</p>
              ) : (
                <div className="dash-donut-wrap">
                  <Donut slices={slices} total={data.productCount} />
                  <ul className="dash-legend">
                    {slices.map((slice) => (
                      <li key={slice.name}>
                        <span style={{ background: slice.color }} />
                        {slice.name}
                        <strong>{slice.value}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>

          <section className="dash-panel">
            <div className="dash-panel__head">
              <h2 className="dash-panel__title">Ən çox baxılan məhsullar</h2>
            </div>
            {data.topProducts.length === 0 ? (
              <p className="dash-empty">
                Hələ baxış yoxdur. Saytda məhsula kliklədikcə say artacaq.
              </p>
            ) : (
              <ul className="dash-rank">
                {data.topProducts.map((item, index) => (
                  <li key={item.id}>
                    <span className="dash-rank__place">{index + 1}</span>
                    <div className="dash-rank__body">
                      <div className="dash-bars__meta">
                        <Link to={`/dashboard/products/${item.id}`}>{item.name}</Link>
                        <strong>{item.viewCount}</strong>
                      </div>
                      <div className="dash-bars__track">
                        <span
                          style={{
                            width: `${(item.viewCount / maxViews) * 100}%`,
                            background: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                      <span className="dash-rank__code">{item.code}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: number
  hint?: string
  tone?: 'gold' | 'teal' | 'ink' | 'blue'
}) {
  return (
    <article className={`dash-stat${tone ? ` dash-stat--${tone}` : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <em>{hint}</em>}
    </article>
  )
}

function buildSlices(
  categories: DashboardOverview['productsByCategory'],
): Array<{ name: string; value: number; color: string }> {
  const ranked = [...categories].sort((a, b) => b.productCount - a.productCount)
  const head = ranked.slice(0, 5).filter((item) => item.productCount > 0)
  const rest = ranked.slice(5).reduce((sum, item) => sum + item.productCount, 0)
  const slices = head.map((item, index) => ({
    name: item.name,
    value: item.productCount,
    color: COLORS[index % COLORS.length],
  }))
  if (rest > 0) {
    slices.push({ name: 'Digər', value: rest, color: '#d7d7db' })
  }
  return slices
}

function Donut({
  slices,
  total,
}: {
  slices: Array<{ name: string; value: number; color: string }>
  total: number
}) {
  const radius = 58
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <svg className="dash-donut" viewBox="0 0 160 160" role="img" aria-label="Məhsul payı">
      <circle cx="80" cy="80" r={radius} className="dash-donut__track" />
      {slices.map((slice) => {
        const length = total === 0 ? 0 : (slice.value / total) * circumference
        const dash = `${length} ${circumference - length}`
        const element = (
          <circle
            key={slice.name}
            cx="80"
            cy="80"
            r={radius}
            className="dash-donut__slice"
            stroke={slice.color}
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            transform="rotate(-90 80 80)"
          />
        )
        offset += length
        return element
      })}
      <text x="80" y="78" textAnchor="middle" className="dash-donut__value">
        {total}
      </text>
      <text x="80" y="96" textAnchor="middle" className="dash-donut__label">
        məhsul
      </text>
    </svg>
  )
}
