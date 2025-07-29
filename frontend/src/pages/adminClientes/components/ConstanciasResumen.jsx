import React from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2'; // 👈 Importar SweetAlert2
import '../Cliente.css';

// ✅ Solo regresa la clase específica sin incluir "badge" base
const getBadgeClass = (nombre) => {
  const lower = nombre.toLowerCase();
  if (lower.includes('csf') || lower.includes('situación fiscal')) return 'badge-fiscal';
  if (lower.includes('imss')) return 'badge-imss';
  if (lower.includes('sat') || lower.includes('laboral')) return 'badge-laboral';
  return ''; // No badge si no coincide
};

const getBadgeText = (nombre) => {
  const lower = nombre.toLowerCase();
  if (lower.includes('csf') || lower.includes('situación fiscal')) return 'Fiscal';
  if (lower.includes('imss')) return 'IMSS';
  if (lower.includes('sat')) return 'SAT';
  if (lower.includes('laboral')) return 'Laboral';
  return '';
};

const ConstanciasResumen = ({ docs = [] }) => {
  const handleVerClick = (doc) => {
    const esCSF = doc.nombre?.toLowerCase().includes('csf');
    const url = `http://localhost:5000/archivos/${encodeURI(doc.ruta_archivo)}`;

    if (esCSF) {
      Swal.fire({
        icon: 'info',
        title: 'Importante',
        html: `
          <p><strong>Recuerda que la Constancia de Situación Fiscal</strong> es del <strong>mes actual</strong> para evitar conflictos.</p>
          <p>Se renueva automáticamente cada <strong>día 5</strong> del mes.</p>
        `,
        confirmButtonText: 'Ver documento',
        confirmButtonColor: '#3085d6'
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(url, '_blank');
        }
      });
    } else {
      window.open(url, '_blank');
    }
  };

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
              <button
                className="btn-pdf"
                onClick={() => handleVerClick(doc)}
              >
                Ver
              </button>
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
