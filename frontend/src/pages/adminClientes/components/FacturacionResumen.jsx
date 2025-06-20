import React from 'react';
import { Download, CreditCard, FileText } from 'react-feather';

const FacturacionResumen = () => {
  // TODO: reemplaza con datos reales
 const facturas = [
  { id: 1, nombre: 'Factura Enero 2024', fecha: '2024-01-05', estado: 'pagada' },
  { id: 2, nombre: 'Factura Febrero 2024', fecha: '2024-02-05', estado: 'pendiente' },
  { id: 3, nombre: 'Factura Marzo 2024', fecha: '2024-03-05', estado: 'pendiente' },
];

  return (
    <div className="lista-facturas">
      <h3>Facturas Recientes</h3>
      <ul>
        {facturas.map(f => (
          <li key={f.id} className={f.estado}>
            <div className="info">
              <FileText size={18} />
              <div>
                <strong>{f.nombre}</strong>
                <small>{f.fecha}</small>
              </div>
            </div>
            <div className="acciones">
              <button title="Ver"><FileText size={16} /></button>
              <button title="Descargar"><Download size={16} /></button>
              {f.estado === 'pendiente' && (
                <button title="Pagar"><CreditCard size={16} /></button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FacturacionResumen;
