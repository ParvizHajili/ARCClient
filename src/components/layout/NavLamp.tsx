import { useTheme } from '../../theme/ThemeContext'
import { useI18n } from '../../i18n/I18nContext'

export function NavLamp() {
  const { lightsOn, toggleLights } = useTheme()
  const { t } = useI18n()

  return (
    <button
      type="button"
      className={`nav-lamp${lightsOn ? ' is-lit' : ''}`}
      aria-pressed={lightsOn}
      aria-label={lightsOn ? t('theme.turnOff') : t('theme.turnOn')}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        toggleLights({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height * 0.62,
        })
      }}
    >
      <span className="nav-lamp__swing">
        <span className="nav-lamp__cord" aria-hidden="true" />
        <svg className="nav-lamp__lantern" viewBox="0 0 40 44" aria-hidden="true">
          <circle className="nav-lamp__metal" cx="20" cy="3.2" r="1.7" />
          <path className="nav-lamp__metal" d="M18.4 4.6 H21.6 V7.2 H18.4 Z" />
          <path className="nav-lamp__metal" d="M7 13.5 L20 6.2 L33 13.5 L31 16.2 H9 Z" />
          <rect className="nav-lamp__glass" x="10" y="16" width="20" height="16" rx="1.2" />
          <path className="nav-lamp__bar" d="M16.5 16.4 V31.6 M23.5 16.4 V31.6 M10.4 23.8 H29.6" />
          <path className="nav-lamp__metal" d="M9 31.4 H31 L28.2 36.2 H11.8 Z" />
          <path className="nav-lamp__metal" d="M16 36.2 H24 V38.4 H16 Z" />
        </svg>
      </span>
    </button>
  )
}
