import { useI18n } from '../../i18n/I18nContext'

const SPEC_KEYS = [
  ['voltage', 'voltageValue'],
  ['power', 'powerValue'],
  ['flux', 'fluxValue'],
  ['material', 'materialValue'],
  ['protection', 'protectionValue'],
  ['warranty', 'warrantyValue'],
] as const

export function TechnicalSpecs() {
  const { t } = useI18n()

  return (
    <section className="technical-specs" aria-labelledby="technicalSpecsTitle">
      <h2 className="technical-specs__title" id="technicalSpecsTitle">
        {t('productDetail.specs.title')}
      </h2>
      <div className="technical-specs__grid">
        {SPEC_KEYS.map(([labelKey, valueKey]) => (
          <div className="technical-specs__item" key={labelKey}>
            <span className="technical-specs__label">
              {t(`productDetail.specs.${labelKey}`)}
            </span>
            <span className="technical-specs__value">
              {t(`productDetail.specs.${valueKey}`)}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
