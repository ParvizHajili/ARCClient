type SpecItem = {
  label: string
  value: string
}

type TechnicalSpecsProps = {
  title: string
  items: SpecItem[]
}

export function TechnicalSpecs({ title, items }: TechnicalSpecsProps) {
  if (items.length === 0) return null

  return (
    <section className="technical-specs" aria-labelledby="technicalSpecsTitle">
      <h2 className="technical-specs__title" id="technicalSpecsTitle">
        {title}
      </h2>
      <div className="technical-specs__grid">
        {items.map((item) => (
          <div className="technical-specs__item" key={`${item.label}-${item.value}`}>
            <span className="technical-specs__label">{item.label}</span>
            <span className="technical-specs__value">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
