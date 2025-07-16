import React from 'react';
import { Link } from 'react-router-dom';
import '../Cliente.css';

const getBadgeClass = (nombre) => {
  const lower = nombre.toLowerCase();
  if (lower.includes('buzón') || lower.includes('buzon tributario')) return 'badge-buzon';
  return '';
};

const getBadgeText = (nombre) => {
  const lower = nombre.toLowerCase();
  if (lower.includes('buzón') || lower.includes('buzon tributario')) return 'Buzón';
  return '';
};

const VisitablesResumen = ({ docs = [] }) => {
  return (
    <div className="facturacion-section">
      <div className="facturacion-header">Visitables</div>
      <div className="facturas-lista">
        {docs.map(doc => (
          <div className="factura-card" key={doc.id}>
            <div className="factura-header">
              <h3 className="factura-titulo">{doc.nombre}</h3>
              {getBadgeClass(doc.nombre) && (
                <span className={`badge-tipo ${getBadgeClass(doc.nombre)}`}>
                  {getBadgeText(doc.nombre)}
                </span>
              )}
            </div>
            <p className="factura-fecha">
              Subido: {doc.fecha_subida?.slice(0, 10)}
            </p>
            <div className="factura-actions">
              <a
                href={`http://localhost:5000/archivos/${encodeURI(doc.ruta_archivo)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pdf"
              >
                Ver
              </a>
              <Link
                to={`/clientes/dashboard/documentos/${doc.id}`}
                className="btn-detalle"
              >
                Ver Detalle
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitablesResumen;
