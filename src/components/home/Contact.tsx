import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { createContactInquiry } from '../../api/contact'
import { ApiError } from '../../api/types'
import { useI18n } from '../../i18n/I18nContext'
import {
  formatAzerbaijanPhone,
  isValidAzerbaijanPhone,
  PHONE_PREFIX,
} from '../../utils/phone'

type FieldErrors = {
  name?: string
  phone?: string
  email?: string
  contact?: string
  message?: string
}

type Touched = {
  name: boolean
  phone: boolean
  email: boolean
  message: boolean
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isPhoneBlank(value: string) {
  const trimmed = value.trim()
  return !trimmed || trimmed === '+994' || trimmed === '+994 '
}

export function Contact() {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [touched, setTouched] = useState<Touched>({
    name: false,
    phone: false,
    email: false,
    message: false,
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!success) return
    const timer = window.setTimeout(() => setSuccess(false), 5000)
    return () => window.clearTimeout(timer)
  }, [success])

  const validateName = (value: string): string | undefined => {
    const trimmed = value.trim()
    if (!trimmed) return t('contact.errors.nameRequired')
    if (trimmed.length < 2) return t('contact.errors.nameMin')
    if (trimmed.length > 150) return t('contact.errors.nameMax')
    return undefined
  }

  const validatePhone = (value: string): string | undefined => {
    if (isPhoneBlank(value)) return undefined
    if (!isValidAzerbaijanPhone(value.trim())) return t('contact.errors.phoneInvalid')
    return undefined
  }

  const validateEmail = (value: string): string | undefined => {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    if (trimmed.length > 200) return t('contact.errors.emailMax')
    if (!EMAIL_REGEX.test(trimmed)) return t('contact.errors.emailInvalid')
    return undefined
  }

  const validateContact = (phoneValue: string, emailValue: string): string | undefined => {
    if (isPhoneBlank(phoneValue) && !emailValue.trim()) {
      return t('contact.errors.eitherRequired')
    }
    return undefined
  }

  const validateMessage = (value: string): string | undefined => {
    const trimmed = value.trim()
    if (!trimmed) return t('contact.errors.messageRequired')
    if (trimmed.length < 4) return t('contact.errors.messageMin')
    if (trimmed.length > 2000) return t('contact.errors.messageMax')
    return undefined
  }

  const collectErrors = (
    nextName: string,
    nextPhone: string,
    nextEmail: string,
    nextMessage: string,
  ): FieldErrors => ({
    name: validateName(nextName),
    phone: validatePhone(nextPhone),
    email: validateEmail(nextEmail),
    contact: validateContact(nextPhone, nextEmail),
    message: validateMessage(nextMessage),
  })

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSuccess(false)
    setTouched({ name: true, phone: true, email: true, message: true })

    const nextErrors = collectErrors(name, phone, email, message)
    setErrors(nextErrors)
    if (
      nextErrors.name ||
      nextErrors.phone ||
      nextErrors.email ||
      nextErrors.contact ||
      nextErrors.message
    ) {
      return
    }

    setSubmitting(true)
    try {
      await createContactInquiry({
        name: name.trim(),
        phone: isPhoneBlank(phone) ? null : phone.trim(),
        email: email.trim() || null,
        message: message.trim(),
      })
      setName('')
      setPhone('')
      setEmail('')
      setMessage('')
      setTouched({ name: false, phone: false, email: false, message: false })
      setErrors({})
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({
          name: err.errors.name?.[0],
          phone: err.errors.phone?.[0],
          email: err.errors.email?.[0],
          contact: err.errors.contact?.[0],
          message: err.errors.message?.[0] ?? err.message,
        })
      } else {
        setErrors({ message: t('contact.errors.sendFailed') })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
    <section className="contact-section" id="contact">
      <div className="contact-section__ambient" aria-hidden="true" />
      <div className="contact-section__container container-fluid">
        <div className="contact-section__header">
          <h2 className="contact-section__title">{t('contact.title')}</h2>
          <span className="contact-section__rule" aria-hidden="true" />
          <p className="contact-section__subtitle">{t('contact.subtitle')}</p>
        </div>

        <form className="contact-form" id="contactForm" noValidate onSubmit={(event) => void handleSubmit(event)}>
          <div className="contact-form__row contact-form__row--3">
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
                  setSuccess(false)
                  if (touched.name) {
                    setErrors((prev) => ({
                      ...prev,
                      name: validateName(event.target.value),
                    }))
                  }
                }}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, name: true }))
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
                  setSuccess(false)
                  if (touched.phone || touched.email) {
                    setErrors((prev) => ({
                      ...prev,
                      phone: validatePhone(formatted),
                      contact: validateContact(formatted, email),
                    }))
                  }
                }}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, phone: true }))
                  setErrors((prev) => ({
                    ...prev,
                    phone: validatePhone(phone),
                    contact: validateContact(phone, email),
                  }))
                }}
              />
              <span className="contact-form__error">{errors.phone ?? ''}</span>
            </div>

            <div className="contact-form__group">
              <label className="contact-form__label" htmlFor="contactEmail">
                {t('contact.email')}
              </label>
              <input
                className={`contact-form__input${errors.email ? ' is-invalid' : ''}`}
                id="contactEmail"
                name="email"
                type="email"
                maxLength={200}
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setSuccess(false)
                  if (touched.email || touched.phone) {
                    setErrors((prev) => ({
                      ...prev,
                      email: validateEmail(event.target.value),
                      contact: validateContact(phone, event.target.value),
                    }))
                  }
                }}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, email: true }))
                  setErrors((prev) => ({
                    ...prev,
                    email: validateEmail(email),
                    contact: validateContact(phone, email),
                  }))
                }}
              />
              <span className="contact-form__error">{errors.email ?? ''}</span>
            </div>
          </div>

          <p className="contact-form__hint">{t('contact.eitherHint')}</p>
          <span className="contact-form__error">{errors.contact ?? ''}</span>

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
                setSuccess(false)
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
            <button className="contact-form__submit" type="submit" disabled={submitting}>
              <span>{submitting ? t('contact.sending') : t('contact.submit')}</span>
              <span className="contact-form__submit-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
    {success
      ? createPortal(
          <div className="contact-toast" role="status" aria-live="polite">
            {t('contact.success')}
          </div>,
          document.body,
        )
      : null}
    </>
  )
}
