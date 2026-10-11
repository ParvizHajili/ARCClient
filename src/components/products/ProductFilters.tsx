import type { CatalogFilterOption, CatalogFilterOptions } from '../../api/publicCatalog'
import type { CategoryDetail, LanguageCode } from '../../api/types'
import { resolveTranslatedName } from '../../utils/translations'

export type ProductFilterState = {
  categoryId: number | null
  subCategoryIds: number[]
  brandIds: number[]
  sizeIds: number[]
  diameterIds: number[]
  powerIds: number[]
  countryIds: number[]
  colorIds: number[]
  hasWarranty: boolean | null
  isMadeToOrder: boolean | null
}

type ProductFiltersProps = {
  categories: CategoryDetail[]
  options: CatalogFilterOptions | null
  value: ProductFilterState
  lang: LanguageCode
  labels: {
    title: string
    categories: string
    brands: string
    sizes: string
    diameters: string
    powers: string
    countries: string
    colors: string
    features: string
    warranty: string
    madeToOrder: string
    clear: string
    apply: string
    yes: string
    no: string
  }
  onChange: (next: ProductFilterState) => void
  onClear: () => void
  onApply?: () => void
  showApply?: boolean
}

function toggleId(list: number[], id: number): number[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

function FilterCheck({
  id,
  checked,
  label,
  swatch,
  onChange,
}: {
  id: string
  checked: boolean
  label: string
  swatch?: string | null
  onChange: () => void
}) {
  return (
    <label className="filter-check" htmlFor={id}>
      <input
        id={id}
        className="filter-check__input"
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className="filter-check__box" aria-hidden="true" />
      {swatch ? (
        <span
          className="filter-check__swatch"
          style={{ backgroundColor: swatch }}
          aria-hidden="true"
        />
      ) : null}
      <span className="filter-check__label">{label}</span>
    </label>
  )
}

function OptionGroup({
  title,
  options,
  selected,
  prefix,
  onToggle,
}: {
  title: string
  options: CatalogFilterOption[]
  selected: number[]
  prefix: string
  onToggle: (id: number) => void
}) {
  if (options.length === 0) return null

  return (
    <details className="filter-block" open>
      <summary className="filter-block__summary">{title}</summary>
      <div className="filter-block__body">
        {options.map((option) => (
          <FilterCheck
            key={option.id}
            id={`${prefix}-${option.id}`}
            checked={selected.includes(option.id)}
            label={option.label}
            swatch={option.hexCode}
            onChange={() => onToggle(option.id)}
          />
        ))}
      </div>
    </details>
  )
}

export function ProductFilters({
  categories,
  options,
  value,
  lang,
  labels,
  onChange,
  onClear,
  onApply,
  showApply = false,
}: ProductFiltersProps) {
  const selectedCategory = categories.find((item) => item.id === value.categoryId)

  return (
    <div className="product-filters">
      <div className="product-filters__head">
        <h2 className="product-filters__title">{labels.title}</h2>
        <button type="button" className="product-filters__clear" onClick={onClear}>
          {labels.clear}
        </button>
      </div>

      <details className="filter-block" open>
        <summary className="filter-block__summary">{labels.categories}</summary>
        <div className="filter-block__body">
          {categories.map((category) => {
            const name = resolveTranslatedName(category.translations, lang)
            const isActive = value.categoryId === category.id
            const hasSubs = category.subCategories.length > 0

            return (
              <div key={category.id} className="filter-category">
                <label className="filter-check" htmlFor={`cat-${category.id}`}>
                  <input
                    id={`cat-${category.id}`}
                    className="filter-check__input"
                    type="radio"
                    name="filter-category"
                    checked={isActive}
                    onChange={() =>
                      onChange({
                        ...value,
                        categoryId: category.id,
                        subCategoryIds: [],
                      })
                    }
                  />
                  <span className="filter-check__box filter-check__box--radio" aria-hidden="true" />
                  <span className="filter-check__label">{name}</span>
                </label>

                {isActive && hasSubs ? (
                  <div className="filter-category__subs">
                    {category.subCategories.map((sub) => (
                      <FilterCheck
                        key={sub.id}
                        id={`sub-${sub.id}`}
                        checked={value.subCategoryIds.includes(sub.id)}
                        label={resolveTranslatedName(sub.translations, lang)}
                        onChange={() =>
                          onChange({
                            ...value,
                            subCategoryIds: toggleId(value.subCategoryIds, sub.id),
                          })
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}

          {selectedCategory ? (
            <button
              type="button"
              className="filter-category__reset"
              onClick={() =>
                onChange({
                  ...value,
                  categoryId: null,
                  subCategoryIds: [],
                })
              }
            >
              {labels.clear}
            </button>
          ) : null}
        </div>
      </details>

      {options ? (
        <>
          <OptionGroup
            title={labels.brands}
            options={options.brands}
            selected={value.brandIds}
            prefix="brand"
            onToggle={(id) =>
              onChange({ ...value, brandIds: toggleId(value.brandIds, id) })
            }
          />
          <OptionGroup
            title={labels.sizes}
            options={options.sizes}
            selected={value.sizeIds}
            prefix="size"
            onToggle={(id) =>
              onChange({ ...value, sizeIds: toggleId(value.sizeIds, id) })
            }
          />
          <OptionGroup
            title={labels.diameters}
            options={options.diameters}
            selected={value.diameterIds}
            prefix="diameter"
            onToggle={(id) =>
              onChange({ ...value, diameterIds: toggleId(value.diameterIds, id) })
            }
          />
          <OptionGroup
            title={labels.powers}
            options={options.powers}
            selected={value.powerIds}
            prefix="power"
            onToggle={(id) =>
              onChange({ ...value, powerIds: toggleId(value.powerIds, id) })
            }
          />
          <OptionGroup
            title={labels.countries}
            options={options.countries}
            selected={value.countryIds}
            prefix="country"
            onToggle={(id) =>
              onChange({ ...value, countryIds: toggleId(value.countryIds, id) })
            }
          />
          <OptionGroup
            title={labels.colors}
            options={options.colors}
            selected={value.colorIds}
            prefix="color"
            onToggle={(id) =>
              onChange({ ...value, colorIds: toggleId(value.colorIds, id) })
            }
          />
        </>
      ) : null}

      <details className="filter-block" open>
        <summary className="filter-block__summary">{labels.features}</summary>
        <div className="filter-block__body">
          <p className="filter-block__mini">{labels.warranty}</p>
          <FilterCheck
            id="warranty-yes"
            checked={value.hasWarranty === true}
            label={labels.yes}
            onChange={() =>
              onChange({
                ...value,
                hasWarranty: value.hasWarranty === true ? null : true,
              })
            }
          />
          <FilterCheck
            id="warranty-no"
            checked={value.hasWarranty === false}
            label={labels.no}
            onChange={() =>
              onChange({
                ...value,
                hasWarranty: value.hasWarranty === false ? null : false,
              })
            }
          />

          <p className="filter-block__mini">{labels.madeToOrder}</p>
          <FilterCheck
            id="mto-yes"
            checked={value.isMadeToOrder === true}
            label={labels.yes}
            onChange={() =>
              onChange({
                ...value,
                isMadeToOrder: value.isMadeToOrder === true ? null : true,
              })
            }
          />
          <FilterCheck
            id="mto-no"
            checked={value.isMadeToOrder === false}
            label={labels.no}
            onChange={() =>
              onChange({
                ...value,
                isMadeToOrder: value.isMadeToOrder === false ? null : false,
              })
            }
          />
        </div>
      </details>

      {showApply && onApply ? (
        <button type="button" className="product-filters__apply" onClick={onApply}>
          {labels.apply}
        </button>
      ) : null}
    </div>
  )
}

export const emptyProductFilters = (): ProductFilterState => ({
  categoryId: null,
  subCategoryIds: [],
  brandIds: [],
  sizeIds: [],
  diameterIds: [],
  powerIds: [],
  countryIds: [],
  colorIds: [],
  hasWarranty: null,
  isMadeToOrder: null,
})
