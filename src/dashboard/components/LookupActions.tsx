import type { ReactNode } from 'react'

interface LookupActionsProps {
  canUpdate: boolean
  canDelete: boolean
  updateDisabled?: boolean
  deleteDisabled?: boolean
  onEdit: () => void
  onDelete: () => void
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

export function LookupActions({
  canUpdate,
  canDelete,
  updateDisabled = false,
  deleteDisabled = false,
  onEdit,
  onDelete,
}: LookupActionsProps) {
  if (!canUpdate && !canDelete) return null

  return (
    <span className="dash-lookup-actions">
      {canUpdate && (
        <button
          type="button"
          className="dash-icon-btn"
          title="Düzəliş et"
          aria-label="Düzəliş et"
          disabled={updateDisabled}
          onClick={onEdit}
        >
          <IconEdit />
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          className="dash-icon-btn dash-icon-btn--danger"
          title="Sil"
          aria-label="Sil"
          disabled={deleteDisabled}
          onClick={onDelete}
        >
          <IconDelete />
        </button>
      )}
    </span>
  )
}

interface LookupSectionProps {
  title: string
  hint?: string
  canCreate: boolean
  onCreate: () => void
  children: ReactNode
}

export function LookupSection({
  title,
  hint,
  canCreate,
  onCreate,
  children,
}: LookupSectionProps) {
  return (
    <section className="dash-panel">
      <div className="dash-panel__head dash-panel__head--row">
        <div>
          <h2 className="dash-panel__title">{title}</h2>
          {hint ? <p className="dash-panel__hint">{hint}</p> : null}
        </div>
        {canCreate && (
          <button
            type="button"
            className="dash-btn dash-btn--ghost dash-btn--compact"
            onClick={onCreate}
          >
            Yeni əlavə et
          </button>
        )}
      </div>
      <div className="dash-check-grid dash-check-grid--lookup">{children}</div>
    </section>
  )
}
