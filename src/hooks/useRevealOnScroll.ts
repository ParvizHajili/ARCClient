import { useEffect, useRef, useState, type RefObject } from 'react'

type UseRevealOnScrollOptions = {
  rootMargin?: string
  threshold?: number
}

/**
 * Replayable IntersectionObserver reveal.
 * Toggles when entering/leaving the viewport — no scroll listeners.
 */
export function useRevealOnScroll<T extends HTMLElement>(
  options: UseRevealOnScrollOptions = {},
): [RefObject<T | null>, boolean] {
  const { rootMargin = '0px 0px -6% 0px', threshold = 0.08 } = options
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true)
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(Boolean(entry?.isIntersecting))
      },
      { rootMargin, threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin, threshold])

  return [ref, visible]
}
