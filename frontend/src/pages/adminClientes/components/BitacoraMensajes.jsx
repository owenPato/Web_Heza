import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
// este archivo vive en /components y Cliente.css en el padre:
import '../Cliente.css';

// ==== Helpers de bitácora (localStorage) ====
const key = (clienteId) => `bitacora_${clienteId}`;

const ensureSeed = (data) => {
  const empty =
    (!data.solicitudes || data.solicitudes.length === 0) &&
    (!data.conversacion || data.conversacion.length === 0) &&
    (!data.confirmaciones || data.confirmaciones.length === 0);

  if (empty) {
    return {
      solicitudes: [],
      conversacion: [
        { autor: 'Soporte', contenido: 'Bienvenido a HEZA', fecha: new Date().toISOString(), solIndex: null }
      ],
      confirmaciones: []
    };
  }
  return data;
};

const loadBitacora = (clienteId) => {
  const raw = localStorage.getItem(key(clienteId));
  if (!raw) return ensureSeed({ solicitudes: [], conversacion: [], confirmaciones: [] });
  try { return ensureSeed(JSON.parse(raw)); }
  catch { return ensureSeed({ solicitudes: [], conversacion: [], confirmaciones: [] }); }
};

const saveBitacora = (clienteId, data) => {
  localStorage.setItem(key(clienteId), JSON.stringify(data));
};

const addEntry = (clienteId, section, entry) => {
  const data = loadBitacora(clienteId);
  data[section] = [...(data[section] || []), entry];
  saveBitacora(clienteId, data);
  return data;
};

export default function BitacoraMensajes({ clienteId: clienteIdProp }) {
  const clienteId = useMemo(() => clienteIdProp || localStorage.getItem('cliente_id'), [clienteIdProp]);

  const [mensaje, setMensaje] = useState('');
  const [data, setData] = useState({ solicitudes: [], conversacion: [], confirmaciones: [] });
  const [activeSol, setActiveSol] = useState(null); // índice de la solicitud seleccionada

  useEffect(() => {
    if (!clienteId) {
      Swal.fire({ icon: 'warning', title: 'Sesión requerida', text: 'Inicia sesión para ver tu bitácora.' });
      return;
    }
    const d = loadBitacora(clienteId);
    setData(d);
    if (d.solicitudes.length > 0) setActiveSol(0);
  }, [clienteId]);

  // Enviar conversación (requiere solicitud activa)
  const enviarConversacion = () => {
    const txt = (mensaje || '').trim();
    if (!clienteId) {
      Swal.fire({ icon: 'warning', title: 'Sin cliente', text: 'No se encontró cliente_id.' });
      return;
    }
    if (activeSol === null || activeSol === undefined) {
      Swal.fire({ icon: 'info', title: 'Selecciona una solicitud', text: 'Elige una solicitud para conversar sobre ella.' });
      return;
    }
    if (!txt) return;

    const nuevo = { autor: 'Tú', contenido: txt, fecha: new Date().toISOString(), solIndex: activeSol };
    const updated = addEntry(clienteId, 'conversacion', nuevo);
    setMensaje('');
    setData(updated);
  };

  // Listas filtradas por solicitud activa
  const solicitudes = data.solicitudes || [];
  const convFiltrada = (data.conversacion || []).filter(m => m.solIndex === activeSol);
  const confFiltrada = (data.confirmaciones || []).filter(m => m.solIndex === activeSol);

  return (
    <div className="bitacora-container" style={{ padding: 16, minHeight: 520 }}>
      <h3 className="bitacora-header" style={{ marginBottom: 12 }}>Bitácora de Mensajes</h3>

      {/* fila superior: chips de solicitudes alineados a la derecha */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
          {solicitudes.length === 0 ? (
            <span className="text-muted">Sin solicitudes aún</span>
          ) : (
            solicitudes.map((s, i) => (
              <button
                key={`sol-chip-${i}`}
                type="button"
                className={`btn btn-sm rounded-pill ${activeSol === i ? 'btn-primary' : 'chip-gold'}`}
                title={s.contenido}
                onClick={() => setActiveSol(i)}
              >
                {s.titulo ? s.titulo : `Solicitud ${i + 1}`}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Conversación */}
      <div style={{ marginBottom: 8 }}>
        <h5 style={{ margin: '8px 0' }}>Conversación</h5>

        {convFiltrada.length === 0 ? (
          <p className="bitacora-mensaje text-muted">No hay mensajes para esta solicitud.</p>
        ) : (
          convFiltrada.map((msg, i) => (
            <p className="bitacora-mensaje" key={`conv-${i}`}>
              <strong>{msg.autor || 'Usuario'}:</strong> {msg.contenido}{' '}
              <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(msg.fecha).toLocaleString()}</span>
            </p>
          ))
        )}

        {/* Mantengo tu layout: textarea + botón Enviar a la derecha, sin clases que cambien bordes/colores */}
        <div className="bitacora-input" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <textarea
            placeholder="Escribe un mensaje."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            // sin 'form-control' para respetar tu estilo (sin redondeado ni color)
            style={{ flex: 1, minHeight: 120, resize: 'vertical' }}
          />
          <button onClick={enviarConversacion}>Enviar</button>
        </div>
      </div>

      {/* Confirmaciones */}
      <div style={{ marginTop: 16 }}>
        <h5 style={{ margin: '8px 0' }}>Confirmaciones</h5>
        {confFiltrada.length === 0 ? (
          <p className="bitacora-mensaje text-muted">Sin confirmaciones para esta solicitud.</p>
        ) : (
          confFiltrada.map((msg, i) => (
            <p className="bitacora-mensaje" key={`conf-${i}`}>
              <strong>{msg.autor || 'Sistema'}:</strong> {msg.contenido}{' '}
              <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(msg.fecha).toLocaleString()}</span>
            </p>
          ))
        )}
      </div>
    </div>
  );
}
