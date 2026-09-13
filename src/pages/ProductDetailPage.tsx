import { OptionGroup } from '../components/product-detail/OptionGroup'
import { ProductGallery } from '../components/product-detail/ProductGallery'
import { TechnicalSpecs } from '../components/product-detail/TechnicalSpecs'
import { useI18n } from '../i18n/I18nContext'

export function ProductDetailPage() {
  const { t } = useI18n()

  return (
    <main className="product-detail-page">
      <div className="product-detail-page__layout container-fluid">
        <ProductGallery />

        <div className="product-detail-page__info">
          <p className="product-detail-page__collection">
            {t('productDetail.collection')}
          </p>
          <h1 className="product-detail-page__title">{t('productDetail.title')}</h1>
          <p className="product-detail-page__code">
            <span>{t('productDetail.codeLabel')}</span>{' '}
            <span>{t('productDetail.code')}</span>
          </p>
          <p className="product-detail-page__description">
            {t('productDetail.description')}
          </p>

          <div className="product-detail-page__options">
            <OptionGroup
              label={t('productDetail.options.country')}
              options={[
                t('productDetail.options.countryItaly'),
                t('productDetail.options.countryGermany'),
                t('productDetail.options.countryTurkey'),
              ]}
              defaultIndex={0}
            />
            <OptionGroup
              label={t('productDetail.options.brand')}
              options={[
                t('productDetail.options.brandArcPro'),
                t('productDetail.options.brandFocusElite'),
                t('productDetail.options.brandAuraLux'),
              ]}
              defaultIndex={1}
            />
            <OptionGroup
              label={t('productDetail.options.size')}
              options={[
                t('productDetail.options.size60'),
                t('productDetail.options.size80'),
                t('productDetail.options.size120'),
                t('productDetail.options.size150'),
              ]}
              defaultIndex={2}
            />
          </div>
        </div>
      </div>

      <TechnicalSpecs />
    </main>
  )
}
