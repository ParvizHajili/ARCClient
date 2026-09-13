import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'article' | 'header' | 'section'
}

export function Reveal({
  children,
  className = '',
  delay = 0,
  as = 'div',
}: RevealProps) {
  const [ref, visible] = useRevealOnScroll<HTMLElement>()
  const Tag = as as ElementType

  const style =
    delay > 0
      ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties)
      : undefined

  return (
    <Tag
      ref={ref}
      className={['reveal', visible ? 'is-revealed' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {children}
    </Tag>
  )
}
