// src/components/ColaboradoresGaleria.jsx
import React from 'react';


const colaboradores = [
  {
    nombre: 'Laura Méndez',
    puesto: 'Contadora',
    imagen: '/img/colaboradores/laura.jpg',
  },
  {
    nombre: 'Carlos Ríos',
    puesto: 'Asistente Fiscal',
    imagen: '/img/colaboradores/carlos.jpg',
  },
];

const ColaboradoresGaleria = () => {
  return (
    <div className="galeria-colaboradores">
      {colaboradores.map((colaborador, i) => (
        <div className="avatar-wrapper" key={i}>
          <img
            src={colaborador.imagen}
            alt={colaborador.nombre}
            className="avatar-img"
          />
          <div className="avatar-hover">
            <strong>{colaborador.nombre}</strong>
            <span>{colaborador.puesto}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ColaboradoresGaleria;

