import { useState } from 'react'

type OptionGroupProps = {
  label: string
  options: string[]
  defaultIndex?: number
}

export function OptionGroup({
  label,
  options,
  defaultIndex = 0,
}: OptionGroupProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex)

  return (
    <div className="option-group">
      <span className="option-group__label">{label}</span>
      <div className="option-group__buttons">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={`option-group__button${index === activeIndex ? ' is-active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
