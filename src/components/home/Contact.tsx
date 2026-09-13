import { useState, type FormEvent } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import {
  formatAzerbaijanPhone,
  isValidAzerbaijanPhone,
  PHONE_PREFIX,
} from '../../utils/phone'

type FieldErrors = {
  name?: string
  phone?: string
  message?: string
}

type Touched = {
  name: boolean
  phone: boolean
  message: boolean
}

export function Contact() {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [touched, setTouched] = useState<Touched>({
    name: false,
    phone: false,
    message: false,
  })
  const [errors, setErrors] = useState<FieldErrors>({})

  const validateName = (value: string): string | undefined => {
    const trimmed = value.trim()
    if (!trimmed) return t('contact.errors.nameRequired')
    if (trimmed.length < 2) return t('contact.errors.nameMin')
    if (trimmed.length > 150) return t('contact.errors.nameMax')
    return undefined
  }

  const validatePhone = (value: string): string | undefined => {
    const trimmed = value.trim()
    if (!trimmed || trimmed === '+994') return t('contact.errors.phoneRequired')
    if (!isValidAzerbaijanPhone(trimmed)) return t('contact.errors.phoneInvalid')
    return undefined
  }

  const validateMessage = (value: string): string | undefined => {
    const trimmed = value.trim()
    if (!trimmed) return t('contact.errors.messageRequired')
    if (trimmed.length < 4) return t('contact.errors.messageMin')
    if (trimmed.length > 2000) return t('contact.errors.messageMax')
    return undefined
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const nextTouched = { name: true, phone: true, message: true }
    setTouched(nextTouched)

    const nextErrors = {
      name: validateName(name),
      phone: validatePhone(phone),
      message: validateMessage(message),
    }
    setErrors(nextErrors)

    if (nextErrors.name || nextErrors.phone || nextErrors.message) {
      return
    }

    console.log({
      name: name.trim(),
      phone: phone.trim(),
      message: message.trim(),
    })
  }

  return (
    <section className="contact-section" id="contact">
      <div className="contact-section__container container-fluid">
        <div className="contact-section__header">
          <h2 className="contact-section__title">{t('contact.title')}</h2>
          <p className="contact-section__subtitle">{t('contact.subtitle')}</p>
        </div>

        <form className="contact-form" id="contactForm" noValidate onSubmit={handleSubmit}>
          <div className="contact-form__row">
            <div className="contact-form__group">
              <label className="contact-form__label" htmlFor="contactName">
                {t('contact.name')}
              </label>
              <input
                className={`contact-form__input${errors.name ? ' is-invalid' : ''}`}
                id="contactName"
                name="name"
                type="text"
                maxLength={150}
                autoComplete="name"
                required
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  if (touched.name) {
                    setErrors((prev) => ({
                      ...prev,
                      name: validateName(event.target.value),
                    }))
                  }
                }}
                onBlur={() => {
                  const next = { ...touched, name: true }
                  setTouched(next)
                  setErrors((prev) => ({ ...prev, name: validateName(name) }))
                }}
              />
              <span className="contact-form__error">{errors.name ?? ''}</span>
            </div>

            <div className="contact-form__group">
              <label className="contact-form__label" htmlFor="contactPhone">
                {t('contact.phone')}
              </label>
              <input
                className={`contact-form__input${errors.phone ? ' is-invalid' : ''}`}
                id="contactPhone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="+994 70 xxx-xx-xx"
                required
                value={phone}
                onFocus={() => {
                  if (!phone) setPhone(PHONE_PREFIX)
                }}
                onKeyDown={(event) => {
                  const selectionStart = event.currentTarget.selectionStart || 0
                  if (
                    (event.key === 'Backspace' || event.key === 'Delete') &&
                    selectionStart <= PHONE_PREFIX.length
                  ) {
                    event.preventDefault()
                  }
                }}
                onChange={(event) => {
                  let formatted = formatAzerbaijanPhone(event.target.value)
                  if (!formatted.startsWith('+994')) formatted = PHONE_PREFIX
                  setPhone(formatted)
                  if (touched.phone) {
                    setErrors((prev) => ({
                      ...prev,
                      phone: validatePhone(formatted),
                    }))
                  }
                }}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, phone: true }))
                  setErrors((prev) => ({ ...prev, phone: validatePhone(phone) }))
                }}
              />
              <span className="contact-form__error">{errors.phone ?? ''}</span>
            </div>
          </div>

          <div className="contact-form__group contact-form__group--full">
            <label className="contact-form__label" htmlFor="contactMessage">
              {t('contact.message')}
            </label>
            <textarea
              className={`contact-form__textarea${errors.message ? ' is-invalid' : ''}`}
              id="contactMessage"
              name="message"
              rows={1}
              minLength={4}
              maxLength={2000}
              required
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                if (touched.message) {
                  setErrors((prev) => ({
                    ...prev,
                    message: validateMessage(event.target.value),
                  }))
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, message: true }))
                setErrors((prev) => ({
                  ...prev,
                  message: validateMessage(message),
                }))
              }}
            />
            <span className="contact-form__error">{errors.message ?? ''}</span>
          </div>

          <div className="contact-form__actions">
            <button className="contact-form__submit" type="submit">
              <span>{t('contact.submit')}</span>
              <span className="contact-form__submit-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
