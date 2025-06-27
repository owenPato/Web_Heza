import React from 'react';
import '../Cliente.css';

const InformeMensualCliente = ({ indicadores, impuestos, cumplimiento }) => {
  return (
    <div className="informe-mensual-box">
      
      {/* Indicadores */}
      <div className="indicadores-tarjetas">
        <h4>Indicadores</h4>
        <div className="accesos-rapidos">
            {indicadores.map((item, index) => (
            <div key={index} className="acceso-card">
                <h5>{item.nombre}</h5>
                <p><strong>2025:</strong> {item.valor2025}</p>
                <p><strong>2024:</strong> {item.valor2024}</p>
            </div>
            ))}
        </div>
    </div>

      {/* Impuestos */}
      <div className="impuestos">
        <h4>Resumen de Impuestos por Pagar</h4>
        <table>
          <tbody>
            {impuestos.map((item, index) => (
              <tr key={index}>
                <td>{item.nombre}</td>
                <td>{item.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cumplimiento */}
      <div className="cumplimiento">
        <h4>Cumplimiento de Obligaciones Fiscales y Seguridad Social</h4>
        <table>
          <thead>
            <tr>
              <th>Obligación</th>
              <th>¿Cumplida?</th>
              <th>Opinión</th>
            </tr>
          </thead>
          <tbody>
            {cumplimiento.map((item, index) => (
              <tr key={index}>
                <td>{item.nombre}</td>
                <td>{item.cumplida ? '✅' : '❌'}</td>
                <td>{item.opinion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InformeMensualCliente;
