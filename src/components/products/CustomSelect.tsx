import { useEffect, useId, useRef, useState } from 'react'

type CustomSelectProps = {
  id: string
  labelId?: string
  value: string
  placeholder: string
  options: string[]
  onChange: (value: string) => void
}

export function CustomSelect({
  id,
  value,
  placeholder,
  options,
  onChange,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const selectedLabel = options.find((option) => option === value)
  const displayValue = selectedLabel || placeholder

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={`custom-select${open ? ' is-open' : ''}`}
      data-custom-select
    >
      <select
        className="custom-select__native"
        id={id}
        tabIndex={-1}
        aria-hidden="true"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="custom-select__trigger"
        id={`${id}Trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
      >
        <span
          className={`custom-select__value${!value ? ' is-placeholder' : ''}`}
        >
          {displayValue}
        </span>
        <svg
          className="custom-select__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="2 4 6 8 10 4"></polyline>
        </svg>
      </button>

      <div
        className={`custom-select__panel${open ? ' is-open' : ''}`}
        id={listboxId}
        role="listbox"
        hidden={!open}
      >
        <ul className="custom-select__options">
          {options.map((option) => {
            const isSelected = option === value
            return (
              <li key={option}>
                <button
                  type="button"
                  className={`custom-select__option${isSelected ? ' is-selected' : ''}`}
                  role="option"
                  aria-selected={isSelected}
                  data-value={option}
                  onClick={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                >
                  {option}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
