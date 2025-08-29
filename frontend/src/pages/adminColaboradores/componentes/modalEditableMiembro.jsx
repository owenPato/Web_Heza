import React, { useEffect, useState } from 'react'
import '../../adminClientes/ModalCambioPassword.css' // mismo estilo del ejemplo

export default function ModalEditarMiembro({
  open,
  onClose,
  member,              // { id, name, role, email, photo }
  roles = [],          // ['Asesor', 'Contador', ...]
  onSave               // (updatedMember) => void
}) {
  const [form, setForm] = useState({ name: '', role: '', email: '' })

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || '',
        role: member.role || '',
        email: member.email || ''
      })
    }
  }, [member])

  if (!open) return null

  const change = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const guardar = () => {
    if (!form.name.trim() || !form.role.trim() || !form.email.trim()) return
    onSave?.({ ...member, ...form })
    onClose?.()
  }

  return (
    <>
      <div className="modal-backdrop show" />
      <div className="modal d-block" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h3 className="modal-title">Modificar integrante</h3>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label>Nombre</label>
                <input
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={change}
                  placeholder="Nombre completo"
                />
              </div>

              <div className="mb-3">
                <label>Puesto</label>
                <select
                  name="role"
                  className="select-custom-azul"
                  value={form.role}
                  onChange={change}
                >
                  <option value="" disabled>Selecciona un puesto…</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label>Correo</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={change}
                  placeholder="nombre@heza.com"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
