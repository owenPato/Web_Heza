import React from 'react';
import { Link } from 'react-router-dom';
import '../Cliente.css';

const visitables = [
  {
    id: 1,
    titulo: 'Acta de Asamblea',
    fecha: '2024-03-10',
    archivo: '/visitables/acta-asamblea.pdf',
    tipo: 'Opinión'
  },
  {
    id: 2,
    titulo: 'Informe de Auditoría',
    fecha: '2024-04-22',
    archivo: '/visitables/informe-auditoria.pdf',
    tipo: 'Buzón'
  }
];

const VisitablesResumen = () => {
  return (
    <div className="facturacion-section">
      <div className="facturacion-header">Documentos Visitables</div>
      <div className="facturas-lista">
        {visitables.map(doc => (
          <div className="factura-card" key={doc.id}>
            <div className="factura-header">
              <h3 className="factura-titulo">{doc.titulo}</h3>
              <span className={`badge-tipo ${doc.tipo === 'Opinión' ? 'badge-opinion' : 'badge-buzon'}`}>
                {doc.tipo}
              </span>
            </div>
            <p className="factura-fecha">Disponible desde: {doc.fecha}</p>
            <div className="factura-actions">
              <a href={doc.archivo} target="_blank" rel="noopener noreferrer" className="btn-pdf">Ver</a>
              <Link to={`/clientes/dashboard/documentos/${doc.id}`} className="btn-detalle">
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

