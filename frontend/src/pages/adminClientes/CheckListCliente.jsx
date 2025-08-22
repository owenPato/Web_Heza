import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import './Cliente.css';

const CheckListCliente = () => {
  const location = useLocation();

  // Docs que ya traes del dashboard/localStorage
  const checkDocs =
    location.state?.docs?.check ||
    JSON.parse(localStorage.getItem('docs'))?.check ||
    [];

  // Id del cliente (dashboard → fallback localStorage)
  const idCliente =
    location.state?.id_cliente ??
    location.state?.idCliente ??
    JSON.parse(localStorage.getItem('id_cliente') || 'null');

  const mesRaw = localStorage.getItem('mes_actual') || '';     // ej: "01 Enero"
  const anioActual = localStorage.getItem('anio_actual') || ''; // ej: "2025"
  const nombreMes = mesRaw.split(' ')[1] || '';

  const [estadoFirmas, setEstadoFirmas] = useState([]);

  // Adjunta token (si lo usas) a axios
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Cargar docs del mes y marcar "firmado" según lo registrado en BD
  useEffect(() => {
    const cargarDocsConFirmas = async () => {
      const documentosFiltrados = checkDocs.filter(
        (doc) => doc.mes === mesRaw && doc.anio?.toString() === anioActual
      );

      const documentosIniciales = documentosFiltrados.map((doc) => ({
        id: doc.id,
        nombre: doc.nombre,
        url: `http://localhost:5000/archivos/${encodeURI(doc.ruta_archivo)}`,
        fecha: doc.fecha_subida,
        firmado: false,
        firmadoPor: '',
      }));

      if (!idCliente) {
        setEstadoFirmas(documentosIniciales);
        return;
      }

      try {
        const { data: firmas } = await axios.get(
          `http://localhost:5000/api/firmas/cliente/${idCliente}`
        );
        const firmasPorDoc = new Map((firmas || []).map((f) => [f.id_documento, f]));
        const fusionados = documentosIniciales.map((doc) =>
          firmasPorDoc.has(doc.id)
            ? {
                ...doc,
                firmado: true,
                firmadoPor: firmasPorDoc.get(doc.id).nombre_firmante || '',
              }
            : doc
        );
        setEstadoFirmas(fusionados);
      } catch (e) {
        console.error('No se pudieron cargar firmas del cliente:', e);
        setEstadoFirmas(documentosIniciales);
      }
    };

    cargarDocsConFirmas();
  }, [checkDocs, mesRaw, anioActual, idCliente]);

  // Modal + POST a /api/firmas; actualiza UI al éxito
  const firmarDocumento = async (docId) => {
    const { value: nombre } = await Swal.fire({
      title: 'Confirmar firma',
      html: `
        <p>Confirmas haber revisado y recibido este documento.</p>
        <p>Por favor, escribe tu nombre completo para firmar digitalmente:</p>
      `,
      input: 'text',
      inputPlaceholder: 'Tu nombre completo',
      showCancelButton: true,
      confirmButtonText: 'Firmar',
      cancelButtonText: 'Cancelar',
      inputValidator: (val) => (!val ? 'Ingresa tu nombre' : undefined),
    });

    if (!nombre) return false;

    if (!idCliente) {
      await Swal.fire('Error', 'No se detectó el cliente activo', 'error');
      return false;
    }

    try {
      await axios.post('http://localhost:5000/api/firmas', {
        id_documento: docId,
        id_cliente: idCliente,
        nombre_firmante: nombre,
      });

      setEstadoFirmas((prev) =>
        prev.map((doc) =>
          doc.id === docId ? { ...doc, firmado: true, firmadoPor: nombre } : doc
        )
      );

      await Swal.fire('Documento firmado', `Gracias, ${nombre}`, 'success');
      return true;
    } catch (error) {
      if (error?.response?.status === 409) {
        await Swal.fire('Ya registrado', 'Este documento ya estaba firmado para este cliente', 'info');
      } else if (error?.response?.status === 404) {
        await Swal.fire('No encontrado', 'Documento o cliente no existe', 'error');
      } else {
        await Swal.fire('Error', 'No se pudo registrar la firma', 'error');
      }
      return false;
    }
  };

  return (
    <div className="checklist-container">
      <div className="titulo-seccion-checklist text-center mb-4">
        <div className="meses-tabs justify-center">
          <button className="tab-btn activo">
            {nombreMes} de {anioActual}
          </button>
        </div>
      </div>

      <div className="card-flip-grid">
        {estadoFirmas.length === 0 ? (
          <p className="text-center sin-documentos">No hay documentos para este mes.</p>
        ) : (
          estadoFirmas.map((doc) => (
            <div key={doc.id} className={`flip-card ${doc.firmado ? 'flipped' : ''}`}>
              <div className="flip-inner">
                {/* FRONT */}
                <div className="flip-front">
                  <h5>{doc.nombre}</h5>
                  <p>Fecha de entrega: {doc.fecha?.slice(0, 10)}</p>
                  <span className={`etiqueta ${doc.firmado ? 'firmado' : 'pendiente'}`}>
                    {doc.firmado ? 'Firmado' : 'Pendiente'}
                  </span>
                  <div className="acciones">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-azul"
                      onClick={async (e) => {
                        if (!doc.firmado) {
                          e.preventDefault(); // evita abrir antes de firmar
                          const ok = await firmarDocumento(doc.id);
                          if (ok) {
                            window.open(doc.url, '_blank', 'noopener,noreferrer');
                          }
                        }
                        // si ya está firmado NO prevenimos, se abre normal
                      }}
                    >
                      Ver PDF
                    </a>
                  </div>
                </div>

                {/* BACK */}
                <div className="flip-back">
                  <p className="firmado-titulo">Firmado por:</p>
                  <strong>{doc.firmadoPor}</strong>

                  {/* ⬇️ Mostrar SIEMPRE botón para ver PDF también en el reverso */}
                  <div className="acciones" style={{ marginTop: '12px' }}>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-azul"
                    >
                      Ver PDF
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CheckListCliente;
