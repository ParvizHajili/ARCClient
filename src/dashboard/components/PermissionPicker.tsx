import type { PermissionModule } from '../../api/users'

const MODULE_LABELS: Record<string, string> = {
  Categories: 'Kateqoriyalar',
  ManufacturerCountries: 'İstehsalçı ölkə',
  Brands: 'Marka',
  Colors: 'Rəng',
  Products: 'Məhsullar',
  Users: 'İstifadəçilər',
  Permissions: 'İcazələr',
}

const ACTION_LABELS: Record<string, string> = {
  List: 'Siyahı',
  View: 'Baxış',
  Create: 'Yaratma',
  Update: 'Düzəliş',
  Delete: 'Silmə',
}

interface PermissionPickerProps {
  modules: PermissionModule[]
  selected: string[]
  disabled?: boolean
  onChange: (codes: string[]) => void
}

export function PermissionPicker({
  modules,
  selected,
  disabled = false,
  onChange,
}: PermissionPickerProps) {
  const selectedSet = new Set(selected)

  function toggle(code: string) {
    if (disabled) return
    const next = new Set(selectedSet)
    if (next.has(code)) next.delete(code)
    else next.add(code)
    onChange([...next].sort())
  }

  function toggleModule(module: PermissionModule, checked: boolean) {
    if (disabled) return
    const next = new Set(selectedSet)
    for (const permission of module.permissions) {
      if (checked) next.add(permission.code)
      else next.delete(permission.code)
    }
    onChange([...next].sort())
  }

  function moduleState(module: PermissionModule) {
    const total = module.permissions.length
    const count = module.permissions.filter((p) => selectedSet.has(p.code)).length
    return {
      all: total > 0 && count === total,
      some: count > 0 && count < total,
      count,
      total,
    }
  }

  if (modules.length === 0) {
    return <p className="dash-empty">İcazə siyahısı boşdur.</p>
  }

  return (
    <div className={`perm-picker${disabled ? ' is-disabled' : ''}`}>
      {modules.map((module) => {
        const state = moduleState(module)
        const moduleId = `perm-mod-${module.module}`

        return (
          <section key={module.module} className="perm-picker__module">
            <div className="perm-picker__module-head">
              <label className="perm-picker__module-label" htmlFor={moduleId}>
                <input
                  id={moduleId}
                  type="checkbox"
                  className="perm-picker__checkbox"
                  checked={state.all}
                  ref={(el) => {
                    if (el) el.indeterminate = state.some
                  }}
                  disabled={disabled}
                  onChange={(ev) => toggleModule(module, ev.target.checked)}
                />
                <span>
                  {MODULE_LABELS[module.module] ?? module.module}
                  <span className="perm-picker__count">
                    {state.count}/{state.total}
                  </span>
                </span>
              </label>
            </div>

            <div className="perm-picker__grid">
              {module.permissions.map((permission) => (
                <label
                  key={permission.code}
                  className="perm-picker__item"
                  htmlFor={`perm-${permission.code}`}
                >
                  <input
                    id={`perm-${permission.code}`}
                    type="checkbox"
                    className="perm-picker__checkbox"
                    checked={selectedSet.has(permission.code)}
                    disabled={disabled}
                    onChange={() => toggle(permission.code)}
                  />
                  <span>
                    {ACTION_LABELS[permission.action] ?? permission.action}
                  </span>
                </label>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
