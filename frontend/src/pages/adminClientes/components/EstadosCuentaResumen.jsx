import React from 'react';
import { Link } from 'react-router-dom';
import '../Cliente.css';

const estados = [
  {
    id: 1,
    mes: 'Enero 2024',
    fecha: '2024-01-05',
    archivo: '/estados/cuenta-enero.pdf'
  },
  {
    id: 2,
    mes: 'Febrero 2024',
    fecha: '2024-02-05',
    archivo: '/estados/cuenta-febrero.pdf'
  }
];

const EstadosCuentaResumen = () => {
  return (
    <div className="facturacion-section">
      <div className="facturacion-header">Estados de Cuenta</div>
      <div className="facturas-lista">
        {estados.map(estado => (
          <div className="factura-card" key={estado.id}>
            <h3 className="factura-titulo">Estado {estado.mes}</h3>
            <p className="factura-fecha">Subido: {estado.fecha}</p>
            <div className="factura-actions">
              <a href={estado.archivo} target="_blank" rel="noopener noreferrer" className="btn-pdf">PDF</a>
             <Link to={`/clientes/dashboard/documentos/${estado.id}`} className="btn-detalle">
               Ver Detalle
             </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EstadosCuentaResumen;
