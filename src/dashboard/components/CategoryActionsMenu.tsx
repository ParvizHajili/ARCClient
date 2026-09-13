import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface CategoryActionsMenuProps {
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

function IconView() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
      />
      <circle
        cx="12"
        cy="12"
        r="2.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 20h4.2L19.2 9l-4.2-4.2L4 15.8V20Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m13.2 6.6 4.2 4.2"
      />
    </svg>
  )
}

function IconDelete() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 7h14M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7m-7 0 0.7 11.2A1.5 1.5 0 0 0 9.7 20h4.6a1.5 1.5 0 0 0 1.5-1.4L16.5 7M10 11v5.5M14 11v5.5"
      />
    </svg>
  )
}

export function CategoryActionsMenu({
  onView,
  onEdit,
  onDelete,
}: CategoryActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    function onScroll() {
      setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  function toggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      })
    }
    setOpen((prev) => !prev)
  }

  return (
    <div className="dash-actions">
      <button
        ref={buttonRef}
        type="button"
        className={`dash-actions__trigger${open ? ' is-open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Əməliyyatlar"
        onClick={toggle}
      >
        <span />
        <span />
        <span />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            className="dash-actions__menu"
            role="menu"
            style={{ top: coords.top, right: coords.right }}
          >
            <button
              type="button"
              role="menuitem"
              className="dash-actions__item"
              aria-label="Bax"
              title="Bax"
              onClick={() => {
                setOpen(false)
                onView()
              }}
            >
              <IconView />
            </button>
            <button
              type="button"
              role="menuitem"
              className="dash-actions__item"
              aria-label="Düzəliş et"
              title="Düzəliş et"
              onClick={() => {
                setOpen(false)
                onEdit()
              }}
            >
              <IconEdit />
            </button>
            <button
              type="button"
              role="menuitem"
              className="dash-actions__item dash-actions__item--danger"
              aria-label="Sil"
              title="Sil"
              onClick={() => {
                setOpen(false)
                onDelete()
              }}
            >
              <IconDelete />
            </button>
          </div>,
          document.body,
        )}
    </div>
  )
}
