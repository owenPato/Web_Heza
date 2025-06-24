import React from 'react';
import { useParams, Link } from 'react-router-dom';

const DetalleDocumento = () => {
  const { id } = useParams();

  const documento = {
    id: id,
    nombre: `Documento ${id}`,
    tipo: 'PDF',
    fechaSubida: '2024-03-15',
    tamaño: '2.5 MB',
    descripción: 'Documento de ejemplo con detalles importantes',
    urlDescarga: '#'
  };

  return (
    <div className="container py-4">
      <div className="card-custom shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="titulo-documento mb-0">
              {documento.nombre}
            </h2>
            <Link to="/clientes/dashboard/documentos" className="btn btn-outline-secondary-custom">
              <i className="fas fa-arrow-left me-2"></i>Volver
            </Link>
          </div>

          <dl className="row">
            <dt className="col-sm-3">Tipo de Archivo:</dt>
            <dd className="col-sm-9">{documento.tipo}</dd>

            <dt className="col-sm-3">Fecha de Subida:</dt>
            <dd className="col-sm-9">{documento.fechaSubida}</dd>

            <dt className="col-sm-3">Tamaño:</dt>
            <dd className="col-sm-9">{documento.tamaño}</dd>

            <dt className="col-sm-3">Descripción:</dt>
            <dd className="col-sm-9">{documento.descripción}</dd>
          </dl>

          <div className="mt-4">
            <a href={documento.urlDescarga} className="btn btn-outline-secondary-custom" download>
              <i className="fas fa-download me-2"></i>Descargar Documento
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleDocumento;
