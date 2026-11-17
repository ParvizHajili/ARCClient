import {
  toMailtoHref,
  toTelHref,
  toWhatsAppHref,
  type PublicOrderContact,
} from '../../api/orderContact'
import { useI18n } from '../../i18n/I18nContext'

type Props = {
  contact: PublicOrderContact
  productTitle: string
  productCode: string
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M17.47 14.38c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.62.14-.18.27-.71.9-.87 1.08-.16.18-.32.2-.6.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.38-1.64-1.54-1.92-.16-.27-.02-.42.12-.55.13-.13.28-.32.42-.48.14-.16.18-.27.28-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.05-.22-.53-.45-.46-.62-.47h-.53c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.98 2.67 1.12 2.85c.14.18 1.93 2.95 4.68 4.13.65.28 1.16.45 1.56.57.65.21 1.25.18 1.72.11.52-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.11-.25-.18-.53-.32Z"
      />
      <path
        fill="currentColor"
        d="M12.04 2C6.5 2 2 6.42 2 11.88c0 1.76.47 3.47 1.36 4.98L2 22l5.3-1.39c1.46.8 3.1 1.22 4.74 1.22h.01c5.54 0 10.04-4.42 10.04-9.88C22.09 6.42 17.58 2 12.04 2Zm0 18.06h-.01c-1.5 0-2.97-.4-4.26-1.16l-.3-.18-3.15.82.84-3.07-.2-.32a8.17 8.17 0 0 1-1.26-4.37c0-4.54 3.77-8.23 8.4-8.23 4.63 0 8.4 3.69 8.4 8.23 0 4.54-3.77 8.28-8.4 8.28Z"
      />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.4 21 3 13.6 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z"
      />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"
      />
    </svg>
  )
}

export function ProductOrderContacts({
  contact,
  productTitle,
  productCode,
}: Props) {
  const { t } = useI18n()
  const whatsApp = contact.whatsAppNumber?.trim() || null
  const phone = contact.phoneNumber?.trim() || null
  const email = contact.email?.trim() || null

  if (!whatsApp && !phone && !email) return null

  const orderMessage = t('productDetail.order.whatsappMessage')
    .replace('{title}', productTitle)
    .replace('{code}', productCode)

  const whatsAppHref = whatsApp ? toWhatsAppHref(whatsApp, orderMessage) : null

  return (
    <div className="product-order">
      <div className="product-order__strip" role="group" aria-label={t('productDetail.order.forOrder')}>
        <span className="product-order__label">
          <span className="product-order__dot" aria-hidden="true" />
          {t('productDetail.order.forOrder')}
        </span>

        <div className="product-order__channels">
          {whatsAppHref ? (
            <a
              className="product-order__channel product-order__channel--whatsapp"
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="product-order__icon">
                <WhatsAppIcon />
              </span>
              <span>{t('productDetail.order.whatsapp')}</span>
            </a>
          ) : null}

          {phone ? (
            <a className="product-order__channel" href={toTelHref(phone)}>
              <span className="product-order__icon">
                <PhoneIcon />
              </span>
              <span>{t('productDetail.order.call')}</span>
            </a>
          ) : null}

          {email ? (
            <a
              className="product-order__channel"
              href={toMailtoHref(
                email,
                `${productTitle} (${productCode})`,
              )}
            >
              <span className="product-order__icon">
                <EmailIcon />
              </span>
              <span>{t('productDetail.order.email')}</span>
            </a>
          ) : null}
        </div>
      </div>

      {whatsAppHref ? (
        <a
          className="product-order__cta"
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="product-order__cta-icon" aria-hidden="true">
            <WhatsAppIcon />
          </span>
          <span>{t('productDetail.order.orderNow')}</span>
          <span className="product-order__cta-arrow" aria-hidden="true">
            →
          </span>
        </a>
      ) : null}
    </div>
  )
}
