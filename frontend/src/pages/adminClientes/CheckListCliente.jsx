import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Cliente.css';

const CheckListCliente = () => {
  const location = useLocation();

  const checkDocs =
    location.state?.docs?.check ||
    JSON.parse(localStorage.getItem('docs'))?.check ||
    [];

  const mesRaw = localStorage.getItem('mes_actual') || '';     // ej: "01 Enero"
  const anioActual = localStorage.getItem('anio_actual') || ''; // ej: "2025"
  const mesNumero = mesRaw.split(' ')[0];
  const nombreMes = mesRaw.split(' ')[1] || '';

  const [estadoFirmas, setEstadoFirmas] = useState([]);

  useEffect(() => {
    const documentosFiltrados = checkDocs.filter((doc) =>
      doc.mes === mesRaw && doc.anio?.toString() === anioActual
    );

    const documentosIniciales = documentosFiltrados.map((doc) => ({
      id: doc.id,
      nombre: doc.nombre,
      url: `http://localhost:5000/archivos/${encodeURI(doc.ruta_archivo)}`,
      fecha: doc.fecha_subida,
      firmado: false,
      firmadoPor: '',
    }));

    setEstadoFirmas(documentosIniciales);
  }, [checkDocs, mesRaw, anioActual]);

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
    });

    if (nombre) {
      const actualizados = estadoFirmas.map((doc) =>
        doc.id === docId ? { ...doc, firmado: true, firmadoPor: nombre } : doc
      );
      setEstadoFirmas(actualizados);
      Swal.fire('Documento firmado', `Gracias, ${nombre}`, 'success');
    }
  };

  return (
    <div className="checklist-container">
      <div className="titulo-seccion-checklist text-center mb-4">
        <div className="meses-tabs justify-center">
          <button className="tab-btn activo">{nombreMes} de {anioActual}</button>
        </div>
      </div>

      <div className="card-flip-grid">
        {estadoFirmas.length === 0 ? (
          <p className="text-center sin-documentos">No hay documentos para este mes.</p>
        ) : (
          estadoFirmas.map((doc) => (
            <div key={doc.id} className={`flip-card ${doc.firmado ? 'flipped' : ''}`}>
              <div className="flip-inner">
                <div className="flip-front">
                  <h5>{doc.nombre}</h5>
                  <p>Fecha de entrega: {doc.fecha.slice(0, 10)}</p>
                  <span className={`etiqueta ${doc.firmado ? 'firmado' : 'pendiente'}`}>
                    {doc.firmado ? 'Firmado' : 'Pendiente'}
                  </span>
                  <div className="acciones">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                    >
                      Ver PDF
                    </a>
                    {!doc.firmado && (
                      <button className="btn-azul" onClick={() => firmarDocumento(doc.id)}>
                        Firmar Entrega
                      </button>
                    )}
                  </div>
                </div>
                <div className="flip-back">
                  <p className="firmado-titulo">Firmado por:</p>
                  <strong>{doc.firmadoPor}</strong>
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
