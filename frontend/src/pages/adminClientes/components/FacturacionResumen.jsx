import React from 'react';
import { Link } from 'react-router-dom';
import '../Cliente.css';

const facturas = [
  {
    id: 1,
    mes: 'Enero 2024',
    fecha: '2024-01-05',
    archivo: '/facturas/factura-enero.pdf'
  },
  {
    id: 2,
    mes: 'Febrero 2024',
    fecha: '2024-02-05',
    archivo: '/facturas/factura-febrero.pdf'
  }
];

const FacturacionResumen = () => {
  return (
    <div className="facturacion-section">
      <div className="facturacion-header">Facturación</div>
      <div className="facturas-lista">
        {facturas.map(factura => (
          <div className="factura-card" key={factura.id}>
            <h3 className="factura-titulo">Factura {factura.mes}</h3>
            <p className="factura-fecha">Subido: {factura.fecha}</p>
            <div className="factura-actions">
              <a href={factura.archivo} target="_blank" rel="noopener noreferrer" className="btn-pdf">PDF</a>
              <Link to={`/clientes/dashboard/documentos/${factura.id}`} className="btn-detalle">
                Ver Detalle
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacturacionResumen;
