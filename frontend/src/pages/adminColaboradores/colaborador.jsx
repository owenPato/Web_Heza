// src/pages/adminColaboradores/colaborador.jsx
import React, { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { FaHome, FaUserCircle, FaClipboardList, FaBuilding, FaUsers } from 'react-icons/fa'
import '../adminColaboradores/css/colaborado.css' 

const NAV_ITEMS = [
  { to: 'dashboard',   label: 'Inicio',       Icon: FaHome },
  { to: 'perfil',      label: 'Perfil',       Icon: FaUserCircle },
  { to: 'solicitudes', label: 'Solicitudes',  Icon: FaClipboardList },
  { to: 'cliente',     label: 'Cliente',      Icon: FaBuilding },
  { to: 'equipo',      label: 'Equipo',       Icon: FaUsers },
]

function NavColaborador() {
  return (
    <nav className="card shadow-sm menu-cliente-lateral" aria-label="Menú de colaborador">
      <div className="list-group list-group-flush">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to} // rutas relativas al layout /colaboradores/*
            className={({ isActive }) => `list-group-item${isActive ? ' active' : ''}`}
          >
            <span className="section-badge bg-primary-soft text-primary boton-ovalado">
              <Icon aria-hidden="true" />
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default function ColaboradorLayout() {
  // Datos de ejemplo + estado compartido a rutas hijas (Outlet context)
  const [colaborador, setColaborador] = useState({
    nombre: 'María López',
    puesto: 'Supervisora de Auditoría',
    correo: 'maria.lopez@heza.com',
    telefono: '+52 55 1234 5678',
    esSupervisor: true,
    integrantes: ['Juan Pérez', 'Ana Ruiz', 'Carlos Ortega'],
    // equipo: 'Equipo Delta' // usar si NO es supervisora
  })

  const equipoRender = colaborador.esSupervisor
    ? (colaborador.integrantes?.length ? colaborador.integrantes.join(', ') : 'Sin integrantes')
    : (colaborador.equipo || '—')

  return (
    <div className="container py-5">
      <h1 className="display-2 text-dark mb-4">
        <span className="text-gradient-primary">Bienvenido</span>
        <span className="text-gradient-secondary"> {colaborador.puesto}</span>
      </h1>

      <div className="row">
        {/* Lateral: ficha + menú */}
        <div className="col-md-3">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="display-7 text-dark mb-4">
                <span className="text-gradient-primary">Información </span>
                <span className="text-gradient-secondary"> del colaborador</span>
              </h5>

              <ul className="list-group list-group-flush fuente-formal">
                <li className="list-group-item specialty-card">
                  <p>
                    <strong className="form-text text-primary">Nombre:</strong> {colaborador.nombre}
                  </p>
                </li>
                <li className="list-group-item specialty-card">
                  <p className="mb-1">
                    <strong className="form-text text-primary">Correo:</strong> {colaborador.correo}
                  </p>
                  <p className="mb-0">
                    <strong className="form-text text-primary">Teléfono:</strong> {colaborador.telefono}
                  </p>
                </li>
                <li className="list-group-item specialty-card">
                  <p>
                    <strong className="form-text text-primary">Equipo:</strong> {equipoRender}
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <NavColaborador />
        </div>

        {/* Contenido de cada sección */}
        <div className="col-md-9">
          {/* Pasamos el estado para que /colaboradores/perfil pueda editar y reflejar cambios */}
          <Outlet context={{ colaborador, setColaborador }} />
        </div>
      </div>
    </div>
  )
}
