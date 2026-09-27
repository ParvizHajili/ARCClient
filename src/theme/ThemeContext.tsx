import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'arc-theme'

type ThemeContextValue = {
  theme: ThemeMode
  lightsOn: boolean
  toggleLights: (origin?: { x: number; y: number }) => void
  flash: { x: number; y: number; id: number } | null
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readTheme(): ThemeMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(readTheme)
  const [flash, setFlash] = useState<ThemeContextValue['flash']>(null)

  const toggleLights = useCallback((origin?: { x: number; y: number }) => {
    setTheme((current) => {
      const next: ThemeMode = current === 'light' ? 'dark' : 'light'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // ignore private mode
      }
      return next
    })
    if (origin && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFlash({ ...origin, id: Date.now() })
    }
  }, [])

  const value = useMemo(
    () => ({
      theme,
      lightsOn: theme === 'light',
      toggleLights,
      flash,
    }),
    [theme, toggleLights, flash],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
