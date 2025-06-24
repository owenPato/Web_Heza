import React from 'react';
import { Link } from 'react-router-dom';
import '../Cliente.css';

const constancias = [
  {
    id: 1,
    titulo: 'Constancia de Situación Fiscal',
    fecha: '2024-03-01',
    archivo: '/constancias/constancia-fiscal.pdf',
    tipo: 'Fiscal'
  },
  {
    id: 2,
    titulo: 'Constancia de Alta IMSS',
    fecha: '2024-04-15',
    archivo: '/constancias/alta-imss.pdf',
    tipo: 'IMSS'
  },
  {
    id: 3,
    titulo: 'Constancia Laboral',
    fecha: '2024-05-10',
    archivo: '/constancias/constancia-laboral.pdf',
    tipo: 'Laboral'
  }
];

const ConstanciasResumen = () => {
  return (
   <div className="facturacion-section">
     <div className="facturacion-header">Constancias</div>
        <div className="facturas-lista">
            {constancias.map(constancia => (
            <div className="factura-card" key={constancia.id}>
                <div className="factura-header">
                <h3 className="factura-titulo">{constancia.titulo}</h3>

                <span className={`badge-tipo ${
                    constancia.tipo === 'Fiscal' ? 'badge-fiscal' :
                    constancia.tipo === 'IMSS' ? 'badge-imss' :
                    constancia.tipo === 'Laboral' ? 'badge-laboral' :
                    ''
                }`}>
                    {constancia.tipo}
                </span>
                </div>

                <p className="factura-fecha">Emitida: {constancia.fecha}</p>
                <div className="factura-actions">
                <a 
                    href={constancia.archivo} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-pdf"
                >
                    Ver
                </a>
                <Link 
                    to={`/clientes/dashboard/documentos/${constancia.id}`} 
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
