import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Cliente.css';
import { FileText, MapPin, Settings, AlertCircle, UserPlus } from 'react-feather';

// Webpack (CRA): usa REACT_APP_API_URL. Fallback a localhost.
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TARJETAS = [
  { tipo: 'estados_financieros',    titulo: 'Estados Financieros',       descripcion: 'Estado de resultados y balance.', icono: FileText },
  { tipo: 'verificacion_domicilio', titulo: 'Verificación de Domicilio', descripcion: 'Solicita visita fiscal.',        icono: MapPin },
  { tipo: 'actualizar_obligaciones',titulo: 'Actualizar Obligaciones',   descripcion: 'Actualiza en SAT.',              icono: Settings },
  { tipo: 'carta_invitacion',       titulo: 'Carta Invitación',          descripcion: 'Atiende requerimientos SAT.',    icono: AlertCircle },
  { tipo: 'alta_imss',              titulo: 'Alta en IMSS',              descripcion: 'Alta de trabajadores.',          icono: UserPlus },
];

// Motivos SOLO para "estados_financieros"
const EF_MOTIVOS = [
  'Informe de Resultados',
  'Trámites fiscales y con autoridades',
  'Trámites financieros y bancarios',
  'Trámites mercantiles y corporativos',
  'Trámites jurídicos y regulatorios',
  'Otros casos frecuentes'
];

// === Helpers de bitácora en localStorage ===
const loadBitacora = (clienteId) => {
  const raw = localStorage.getItem(`bitacora_${clienteId}`);
  if (!raw) return { solicitudes: [], conversacion: [], confirmaciones: [] };
  try { return JSON.parse(raw); } catch { return { solicitudes: [], conversacion: [], confirmaciones: [] }; }
};

const saveBitacora = (clienteId, data) => {
  localStorage.setItem(`bitacora_${clienteId}`, JSON.stringify(data));
};

const addBitacoraEntry = (clienteId, section, entry) => {
  const data = loadBitacora(clienteId);
  data[section] = [...(data[section] || []), entry];
  saveBitacora(clienteId, data);
};

export default function Solicitudes() {
  const [cliente, setCliente] = useState(null);
  const [loadingTipo, setLoadingTipo] = useState(null);

  useEffect(() => {
    const fetchCliente = async () => {
      const clienteId = localStorage.getItem('cliente_id');
      if (!clienteId) {
        Swal.fire({ icon: 'warning', title: 'Sesión requerida', text: 'Inicia sesión nuevamente.' });
        return;
      }
      try {
        const { data } = await axios.get(`${API}/api/clientes/por-id/${clienteId}`);
        setCliente(data);
      } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'No se pudo cargar el cliente', text: 'Intenta más tarde.' });
      }
    };
    fetchCliente();
  }, []);

  // Modal especial para Estados Financieros (motivo + mensaje)
  const openEFModal = async () => {
    const optionsHtml = EF_MOTIVOS.map(m => `<option value="${m}">${m}</option>`).join('');
    const { isConfirmed, value } = await Swal.fire({
      title: 'Estados Financieros',
      html: `
        <div class="text-start">
          <label class="form-label">Motivo</label>
          <select id="swal-motivo" class="form-select">
            <option value="" selected disabled>Selecciona un motivo</option>
            ${optionsHtml}
          </select>
          <label class="form-label mt-3">Mensaje</label>
          <textarea id="swal-msg" class="form-control" placeholder="Escribe los detalles..."></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      heightAuto: false,
      preConfirm: () => {
        const motivo = (document.getElementById('swal-motivo')?.value || '').trim();
        const mensaje = (document.getElementById('swal-msg')?.value || '').trim();
        if (!motivo) { Swal.showValidationMessage('Selecciona un motivo'); return false; }
        if (!mensaje || mensaje.length < 5) { Swal.showValidationMessage('El mensaje es requerido (min. 5 caracteres)'); return false; }
        return { motivo, mensaje };
      }
    });
    if (!isConfirmed) return null;
    return value; // { motivo, mensaje }
  };

  // Modal básico (solo mensaje) para otros tipos
  const openMsgModal = async () => {
    const { value: mensaje, isConfirmed } = await Swal.fire({
      title: 'Describe tu solicitud',
      input: 'textarea',
      inputLabel: 'Mensaje',
      inputPlaceholder: 'Escribe los detalles...',
      inputAttributes: { 'aria-label': 'Mensaje de la solicitud' },
      inputValidator: (value) => {
        const v = (value || '').trim();
        if (!v) return 'El mensaje es requerido';
        if (v.length < 5) return 'Añade un poco más de detalle';
        return undefined;
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      heightAuto: false,
    });
    if (!isConfirmed) return null;
    return { mensaje };
  };

  const openSolicitudModal = async (tipo) => {
    if (tipo === 'estados_financieros') {
      const data = await openEFModal();
      if (data) handleSolicitud({ tipo, ...data });
    } else {
      const data = await openMsgModal();
      if (data) handleSolicitud({ tipo, ...data });
    }
  };

  const handleSolicitud = async ({ tipo, mensaje, motivo }) => {
    const clienteId = localStorage.getItem('cliente_id');
    if (!clienteId) {
      Swal.fire({ icon: 'error', title: 'Cliente no identificado', text: 'Inicia sesión de nuevo.' });
      return;
    }

    // EF: guardar el motivo dentro de "mensaje" (campo único en BD)
    const mensajePayload = motivo ? `[Motivo: ${motivo}] ${mensaje}` : mensaje;

    setLoadingTipo(tipo);
    try {
      await axios.post(
        `${API}/api/solicitudes`,
        {
          cliente_id: Number(clienteId),
          empleado_id: null,
          tipo,
          mensaje: mensajePayload.trim(),
          estado: 'pendiente',
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // === Registrar en bitácora (sección: solicitudes) ===
      addBitacoraEntry(clienteId, 'solicitudes', {
        autor: 'Tú',
        titulo: `Solicitud: ${tipo}`,
        contenido: mensajePayload.trim(),
        fecha: new Date().toISOString(),
        estado: 'pendiente'
      });

      Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada',
        text: 'Tu solicitud fue enviada correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('❌ Error al enviar solicitud:', error);
      const msg = error?.response?.data?.error || 'Hubo un problema. Intenta más tarde.';
      Swal.fire({ icon: 'error', title: 'Error al enviar solicitud', text: msg });
    } finally {
      setLoadingTipo(null);
    }
  };

  return (
    <div className="solicitudes-container">
      <h2 className="solicitudes-title">
        Solicitudes {cliente?.empresa ? <small className="text-muted">· {cliente.empresa}</small> : null}
      </h2>

      <div className="row g-4">
        {TARJETAS.map(({ tipo, titulo, descripcion, icono: Icon }) => (
          <div className="col-md-4" key={tipo}>
            <div className="card-solicitud">
              <div className="icono-y-titulo">
                <Icon size={24} className="icono" aria-hidden />
                <h5 className="titulo">{titulo}</h5>
              </div>
              <p className="descripcion">{descripcion}</p>
              <button
                className="btn-solicitud"
                onClick={() => openSolicitudModal(tipo)}
                disabled={loadingTipo === tipo || !cliente}
                aria-busy={loadingTipo === tipo}
              >
                {loadingTipo === tipo ? 'Enviando…' : 'Solicitar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
