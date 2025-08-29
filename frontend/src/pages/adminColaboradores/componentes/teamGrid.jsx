import React, { useMemo } from 'react'
import '../css/colaborado.css'

/**
 * items: [{ id?, name, role, org?, email?, photo? }]
 * roleColors: { [normalizado]: { label: string, color: string } }
 *   - el "normalizado" ignora acentos y mayúsculas
 * onItemClick?: (member) => void
 * minItemWidth?: number (px)
 * alignment?: 'start' | 'center'
 * loading?: boolean
 * emptyMessage?: string
 */
export default function TeamGrid({
  items = [],
  roleColors = {},
  onItemClick,
  minItemWidth = 260,
  alignment = 'start',         // 'start' | 'center'
  loading = false,
  emptyMessage = 'Sin integrantes',
  renderActions,               // (member) => ReactNode  (e.g. botón Modificar)
}) {
  const style = { gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))` }
  const colorIndex = useMemo(() => normalizeRoleMap(roleColors), [roleColors])

  if (loading) {
    return (
      <div className="team-grid" style={style}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="tm-card tm-skeleton" key={i} aria-hidden="true" />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="tm-empty">
        <span className="tm-empty-text">{emptyMessage}</span>
      </div>
    )
  }

  return (
    <div className="team-grid" style={style}>
      {items.map((m) => {
        const key = m.id ?? m.email ?? m.name
        const clickable = typeof onItemClick === 'function'
        const roleInfo = getRoleStyle(m.role, colorIndex) // { color, label }

        return (
          <div
            key={key}
            className={`tm-card ${clickable ? 'tm-clickable' : ''}`}
            {...(clickable
              ? {
                  role: 'button',
                  tabIndex: 0,
                  onClick: () => onItemClick(m),
                  onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && onItemClick(m),
                }
              : {})}
          >
            <div className={`tm-row tm-${alignment}`}>
              <div className="tm-avatar-wrap">
                {m.photo ? (
                  <img className="tm-avatar" src={m.photo} alt={m.name} />
                ) : (
                  <div className="tm-avatar tm-avatar--placeholder" aria-hidden="true">
                    {getInitials(m.name)}
                  </div>
                )}
                <span
                  className="tm-rolebadge"
                  style={{ backgroundColor: roleInfo.color }}
                  title={roleInfo.label}
                />
              </div>

              <div className="tm-info">
                <div className="tm-name">{m.name}</div>
                {m.role && <div className="tm-secondary">{m.role}</div>}
                {m.email && <div className="tm-tertiary">{m.email}</div>}
                {m.org && <div className="tm-quaternary">{m.org}</div>}
              </div>
            </div>

            {renderActions && (
              <div className="tm-actions">
                {renderActions(m)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* Utils */
function getInitials(name = '') {
  const p = String(name).trim().split(/\s+/)
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase()
}
function normalizeRole(s = '') {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
function normalizeRoleMap(map = {}) {
  const out = {}
  Object.entries(map).forEach(([k, v]) => {
    out[normalizeRole(k)] = typeof v === 'string' ? { label: k, color: v } : v
  })
  return out
}
function getRoleStyle(role, index) {
  const key = normalizeRole(role || '')
  return index[key] || { label: role || 'Sin puesto', color: '#9ca3af' } // gris por defecto
}