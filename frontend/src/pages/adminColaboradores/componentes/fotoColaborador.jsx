import React, { useEffect, useMemo, useRef, useState } from 'react'

export default function FotoColaborador({ nombre = 'Colaborador' }) {
  const fileInputRef = useRef(null)

  // foto guardada (mock, si quieres puedes quitar localStorage y dejar null)
  const [foto, setFoto] = useState(null)
  // selección temporal (no persistida)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('colaborador_foto')
    if (saved) setFoto(saved)
  }, [])

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  const initials = useMemo(() => {
    const p = String(nombre).trim().split(/\s+/)
    return (p[0]?.[0] || '') + (p[1]?.[0] || '')
  }, [nombre])

  const handlePick = () => fileInputRef.current?.click()

  const onFile = (f) => {
    setError(null)
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('El archivo debe ser una imagen.'); return }
    if (f.size > 3 * 1024 * 1024) { setError('La imagen supera 3MB.'); return }

    const url = URL.createObjectURL(f)
    setPreview((old) => { if (old) URL.revokeObjectURL(old); return url })
  }

  const onInputChange = (e) => onFile(e.target.files?.[0])
  const onDrop = (e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]) }
  const onDragOver = (e) => e.preventDefault()

  const eliminarFoto = () => {
    localStorage.removeItem('colaborador_foto')
    setFoto(null)
    setPreview((old) => { if (old) URL.revokeObjectURL(old); return null })
  }

  const cancelarSeleccion = () => {
    setPreview((old) => { if (old) URL.revokeObjectURL(old); return null })
    setError(null)
  }

  const hasAnyPhoto = Boolean(preview || foto)

  return (
    <aside className="panel-foto">
      <div
        className={`dropzone ${error ? 'dropzone-error' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        role="button"
        tabIndex={0}
        onClick={handlePick}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handlePick()}
        aria-label="Área para seleccionar o arrastrar una foto"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="d-none"
          onChange={onInputChange}
        />

        <div className="avatar-preview">
          {preview ? (
            <img src={preview} alt="Vista previa" />
          ) : foto ? (
            <img src={foto} alt="Foto del colaborador" />
          ) : (
            <div className="avatar-placeholder" aria-hidden="true">
              {initials.toUpperCase()}
            </div>
          )}
        </div>

        <p className="dropzone-text">
          Arrastra una imagen o <span className="link">haz clic para seleccionar</span>
        </p>

        {error && <div className="text-error small">{error}</div>}
      </div>

      <div className="foto-actions foto-actions--with-vertical">
        {/* Eliminar vertical */}
        <button
          type="button"
          className="btn btn-outline-danger btn-vertical"
          disabled={!hasAnyPhoto}
          onClick={eliminarFoto}
          title="Eliminar foto"
        >
          Eliminar
        </button>

        {/* Cancelar selección temporal */}
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={!hasAnyPhoto}
          onClick={cancelarSeleccion}
        >
          Cancelar
        </button>
      </div>
    </aside>
  )
}
