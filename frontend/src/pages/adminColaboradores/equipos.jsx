import React, { useMemo, useState } from 'react'
import TeamGrid from './componentes/teamGrid'
import ModalEditarMiembro from './componentes/modalEditableMiembro'

// Mapa de colores por puesto (el grid normaliza acentos y mayúsculas)
const ROLE_COLORS = {
  'asesor': '#10b981',
  'contador': '#2563eb',
  'nominista': '#8b5cf6',
  'devolucionista': '#0ea5e9',
  'cordinador': '#f59e0b',   // typo cubierto
  'coordinador': '#f59e0b',
  'lider': '#d97706',
  'desarrollador': '#22c55e',
  'reclutador': '#ec4899',
  'rh': '#f43f5e',
  'consultor en tf': '#4f46e5',
  'comunity manager': '#14b8a6',
  'community manager': '#14b8a6',
  'contador jr': '#60a5fa',
}

const ROLES = [
  'Asesor','Contador','Nominista','Devolucionista','Coordinador','Lider',
  'Desarrollador','Reclutador','RH','Consultor en TF','Community Manager','Contador Jr'
]

// Datos demo (cuando conectes API los sustituyes)
const INITIAL = [
  {
    id: 1,
    name: 'María López',
    role: 'Lider',
    org: 'Heza',
    email: 'maria.lopez@heza.com',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 2,
    name: 'Juan Pérez',
    role: 'Contador Jr',
    org: 'Heza',
    email: 'juan.perez@heza.com',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 3,
    name: 'Ana Ruiz',
    role: 'Nominista',
    org: 'Heza',
    email: 'ana.ruiz@heza.com',
    photo: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    id: 4,
    name: 'Carlos Ortega',
    role: 'Reclutador',
    org: 'Heza',
    email: 'carlos.ortega@heza.com',
    photo: 'https://randomuser.me/api/portraits/men/71.jpg',
  },
]

export default function Equipos() {
  const [team, setTeam] = useState(INITIAL)
  const [editing, setEditing] = useState(null) // miembro en edición

  const roleColors = useMemo(() => {
    // convierte mapa simple a { key: {label,color} } si quieres mostrar leyendas luego
    const out = {}
    Object.entries(ROLE_COLORS).forEach(([k, color]) => (out[k] = { label: k, color }))
    return out
  }, [])

  const openEdit = (m) => setEditing(m)
  const closeEdit = () => setEditing(null)

  const saveEdit = (updated) => {
    setTeam((list) => list.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)))
  }

  return (
    <div className="container py-4 fuente-formal">
      <h2 className="display-6 text-dark mb-2">
        <span className="text-gradient-primary">Equipo</span>
      </h2>

      <TeamGrid
        items={team}
        roleColors={roleColors}
        minItemWidth={280}
        alignment="start"
        renderActions={(m) => (
          <button className="btn btn-sm btn-primary" onClick={() => openEdit(m)}>
            Modificar
          </button>
        )}
      />

      {/* Modal de edición */}
      <ModalEditarMiembro
        open={Boolean(editing)}
        onClose={closeEdit}
        member={editing}
        roles={ROLES}
        onSave={saveEdit}
      />
    </div>
  )
}
