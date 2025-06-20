import React from 'react';

const AccesoCard = ({ icono: Icono, titulo, descripcion, onClick }) => (
  <div className="acceso-card" onClick={onClick}>
    <Icono size={36} />
    <div>
      <h4>{titulo}</h4>
      <p>{descripcion}</p>
    </div>
  </div>
);

export default AccesoCard;
