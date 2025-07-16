import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Cliente.css';

const CheckListCliente = () => {
  const location = useLocation();
  const checkDocs = location.state?.docs?.check || JSON.parse(localStorage.getItem('docs'))?.check || [];

  const [estadoFirmas, setEstadoFirmas] = useState([]);
  const [mesActivo, setMesActivo] = useState(null);

  useEffect(() => {
    // Convertimos los docs a estructura esperada con campos extra para la firma
    const documentosIniciales = checkDocs.map(doc => ({
      id: doc.id,
      nombre: doc.nombre,
      url: `http://localhost:5000/archivos/${encodeURI(doc.ruta_archivo)}`,
      fecha: doc.fecha_subida,
      firmado: false,
      firmadoPor: ''
    }));
    setEstadoFirmas(documentosIniciales);
  }, [checkDocs]);

  const agruparPorMes = (docs) => {
    return docs.reduce((acc, doc) => {
      const fecha = new Date(doc.fecha);
      const key = fecha.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[key]) acc[key] = [];
      acc[key].push(doc);
      return acc;
    }, {});
  };

  const documentosPorMes = agruparPorMes(estadoFirmas);
  const mesesDisponibles = Object.keys(documentosPorMes);

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
      cancelButtonText: 'Cancelar'
    });

    if (nombre) {
      const actualizados = estadoFirmas.map(doc =>
        doc.id === docId ? { ...doc, firmado: true, firmadoPor: nombre } : doc
      );
      setEstadoFirmas(actualizados);
      Swal.fire('Documento firmado', `Gracias, ${nombre}`, 'success');
    }
  };

  return (
    <div className="checklist-container">
      <div className="meses-tabs">
        {mesesDisponibles.map((mes) => (
          <button
            key={mes}
            className={`tab-btn ${mes === mesActivo ? 'activo' : ''}`}
            onClick={() => setMesActivo(mes)}
          >
            {mes.charAt(0).toUpperCase() + mes.slice(1)}
          </button>
        ))}
      </div>

      <div className="card-flip-grid">
        {mesActivo &&
          documentosPorMes[mesActivo].map((doc) => (
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
          ))}
      </div>
    </div>
  );
};

export default CheckListCliente;
