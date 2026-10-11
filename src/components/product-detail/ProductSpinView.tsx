import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { CI360Viewer } from '@cloudimage/360-view/react'
import '@cloudimage/360-view/css'
import { getPublicProductSpin } from '../../api/publicCatalog'
import { useI18n } from '../../i18n/I18nContext'

type ProductSpinViewProps = {
  open: boolean
  productId: number
  onClose: () => void
}

export function ProductSpinView({ open, productId, onClose }: ProductSpinViewProps) {
  const { t } = useI18n()
  const [urls, setUrls] = useState<string[]>([])
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!open) {
      setPhase('loading')
      setUrls([])
      return
    }

    let active = true
    setPhase('loading')
    setUrls([])

    void getPublicProductSpin(productId)
      .then((frames) => {
        if (!active) return
        setUrls(
          [...frames]
            .sort((a, b) => a.order - b.order)
            .map((frame) => frame.imageUrl)
            .filter(Boolean),
        )
        setPhase('ready')
      })
      .catch(() => {
        if (active) setPhase('error')
      })

    return () => {
      active = false
    }
  }, [open, productId])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="product-spin" role="presentation">
      <button
        type="button"
        className="product-spin__backdrop"
        aria-label={t('productDetail.spinClose')}
        onClick={onClose}
      />
      <div className="product-spin__dialog" role="dialog" aria-modal="true">
        <button
          type="button"
          className="product-spin__close"
          aria-label={t('productDetail.spinClose')}
          onClick={onClose}
        >
          ×
        </button>
        {phase === 'loading' ? (
          <p className="product-spin__status">{t('productDetail.spinLoading')}</p>
        ) : phase === 'error' || urls.length < 2 ? (
          <p className="product-spin__status">{t('productDetail.spinEmpty')}</p>
        ) : (
          <CI360Viewer
            key={urls.join('|')}
            imageListX={urls}
            amountX={urls.length}
            dragSpeed={100}
            aspectRatio="1/1"
            hide360Logo
            style={{ width: '100%' }}
          />
        )}
      </div>
    </div>,
    document.body,
  )
}
