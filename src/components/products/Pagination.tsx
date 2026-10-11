type PaginationProps = {
  page: number
  totalPages: number
  onChange: (page: number) => void
  labels: {
    prev: string
    next: string
    page: string
  }
}

function buildPages(page: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])
  if (page <= 3) {
    pages.add(2)
    pages.add(3)
    pages.add(4)
  }
  if (page >= totalPages - 2) {
    pages.add(totalPages - 1)
    pages.add(totalPages - 2)
    pages.add(totalPages - 3)
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const result: Array<number | 'ellipsis'> = []
  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i]
    const prev = sorted[i - 1]
    if (i > 0 && current - prev > 1) {
      result.push('ellipsis')
    }
    result.push(current)
  }
  return result
}

export function Pagination({ page, totalPages, onChange, labels }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPages(page, totalPages)

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__nav"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {labels.prev}
      </button>

      <ul className="pagination__list">
        {pages.map((item, index) =>
          item === 'ellipsis' ? (
            <li key={`e-${index}`} className="pagination__ellipsis" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={[
                  'pagination__page',
                  item === page ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`${labels.page} ${item}`}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className="pagination__nav"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        {labels.next}
      </button>
    </nav>
  )
}
