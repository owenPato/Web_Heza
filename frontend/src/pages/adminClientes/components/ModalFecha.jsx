// src/components/modals/ModalFecha.jsx
import React, { useState } from 'react';
 // crea un archivo con los estilos necesarios

const mesesFormato = [
  '01 Enero', '02 Febrero', '03 Marzo', '04 Abril', '05 Mayo', '06 Junio',
  '07 Julio', '08 Agosto', '09 Septiembre', '10 Octubre', '11 Noviembre', '12 Diciembre'
];

const ModalFecha = ({ onClose, onConfirm }) => {
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState(new Date().getFullYear().toString());

  const handleConfirmar = () => {
    if (!mes || !anio) {
      alert('Debes seleccionar mes y año');
      return;
    }
    onConfirm({ anio, mes });
  };

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal d-block">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h3 className="text-dark mb-2">
                <span className="text-gradient-primary">Seleccionar Mes y Año</span>
              </h3>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label>Mes</label>
                <select className="form-select" value={mes} onChange={e => setMes(e.target.value)}>
                  <option value="">-- Selecciona un mes --</option>
                  {mesesFormato.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label>Año</label>
                <input
                  type="number"
                  className="form-control"
                  value={anio}
                  onChange={e => setAnio(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleConfirmar}>Confirmar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalFecha;
