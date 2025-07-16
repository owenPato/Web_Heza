import React from 'react';
import { Link } from 'react-router-dom';
import '../Cliente.css';

// ✅ Solo regresa la clase específica sin incluir "badge" base
const getBadgeClass = (nombre) => {
  const lower = nombre.toLowerCase();
  if (lower.includes('csf') || lower.includes('situación fiscal')) return 'badge-fiscal';
  if (lower.includes('imss')) return 'badge-imss';
  if (lower.includes('sat') || lower.includes('laboral')) return 'badge-laboral';
  return ''; // No badge si no coincide
};

// ✅ Regresa el texto visible dentro del badge
const getBadgeText = (nombre) => {
  const lower = nombre.toLowerCase();
  if (lower.includes('csf') || lower.includes('situación fiscal')) return 'Fiscal';
  if (lower.includes('imss')) return 'IMSS';
  if (lower.includes('sat')) return 'SAT';
  if (lower.includes('laboral')) return 'Laboral';
  return '';
};

const ConstanciasResumen = ({ docs = [] }) => {
  return (
    <div className="facturacion-section">
      <div className="facturacion-header">Constancias</div>
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

export default ConstanciasResumen;
