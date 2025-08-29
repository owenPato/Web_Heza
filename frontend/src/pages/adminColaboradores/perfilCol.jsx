import React, { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import FotoColaborador from '../adminColaboradores/componentes/fotoColaborador'
import '../adminColaboradores/css/colaborado.css'

export default function PerfilColaborador() {
  // viene del layout ColaboradorLayout (Outlet context)
  const { colaborador, setColaborador } = useOutletContext()

  const [form, setForm] = useState({
    nombre: '',
    puesto: '',
    correo: '',
    telefono: ''
  })
  const [errores, setErrores] = useState({})
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    if (colaborador) {
      setForm({
        nombre: colaborador.nombre || '',
        puesto: colaborador.puesto || '',
        correo: colaborador.correo || '',
        telefono: colaborador.telefono || ''
      })
    }
  }, [colaborador])

  const isEmailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo),
    [form.correo]
  )

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido'
    if (!form.puesto.trim()) e.puesto = 'Puesto requerido'
    if (!isEmailValid) e.correo = 'Correo inválido'
    if (form.telefono.trim().length < 7) e.telefono = 'Teléfono inválido'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const onChange = (ev) => {
    const { name, value } = ev.target
    setForm((f) => ({ ...f, [name]: value }))
    setGuardado(false)
  }

  const onSubmit = (ev) => {
    ev.preventDefault()
    if (!validar()) return
    setColaborador((prev) => ({ ...prev, ...form }))
    localStorage.setItem('colaborador_mock', JSON.stringify({ ...(colaborador || {}), ...form }))
    setGuardado(true)
  }

  if (!colaborador) {
    return <p className="ps-5 fs-4 fw-semibold text-secondary">Cargando perfil del colaborador...</p>
  }

  return (
    <div className="container py-4 fuente-formal">
      <h2 className="display-6 text-dark mb-0">
        <span className="text-gradient-primary">Editar datos </span>
        <span className="text-gradient-secondary">{colaborador.puesto}</span>
      </h2>

      {/* Card azul */}
      <form onSubmit={onSubmit} className="p-4 shadow-sm card shadow specialty-cards mt-4" noValidate>
        <div className="row g-4 align-items-start">
          {/* Izquierda: inputs */}
          <div className="col-12 col-md-7">
            <div className="form-group mb-3">
              <label className="form-label">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                placeholder="Ej. María López"
              />
              {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Puesto</label>
              <input
                name="puesto"
                value={form.puesto}
                onChange={onChange}
                className={`form-control ${errores.puesto ? 'is-invalid' : ''}`}
                placeholder="Ej. Supervisora de Auditoría"
              />
              {errores.puesto && <div className="invalid-feedback">{errores.puesto}</div>}
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Correo</label>
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={onChange}
                className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                placeholder="nombre@heza.com"
              />
              {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={onChange}
                className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                placeholder="+52 55 0000 0000"
              />
              {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
            </div>
          </div>

          {/* Derecha: fotos */}
          <div className="col-12 col-md-5">
            <FotoColaborador nombre={form.nombre} />
          </div>
        </div>

        {/* Botonera */}
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setForm({
                nombre: colaborador.nombre || '',
                puesto: colaborador.puesto || '',
                correo: colaborador.correo || '',
                telefono: colaborador.telefono || ''
              })
              setErrores({})
              setGuardado(false)
            }}
          >
            Deshacer cambios
          </button>

          <button type="submit" className="btn btn-primary px-4">Guardar cambios</button>
        </div>

        {guardado && (
          <div className="mt-2">
            <div className="alert alert-success mb-0">Datos guardados (mock)</div>
          </div>
        )}
      </form>
    </div>
  )
}
