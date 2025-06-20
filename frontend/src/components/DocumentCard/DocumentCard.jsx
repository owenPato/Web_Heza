import React from 'react';
import { Link } from 'react-router-dom';


const DocumentCard = ({ documento }) => {
  const getIcon = (tipo) => {
    switch(tipo.toLowerCase()) {
      case 'pdf': return 'fas fa-file-pdf text-danger';
      case 'docx': return 'fas fa-file-word text-primary';
      case 'xlsx': return 'fas fa-file-excel text-success';
      default: return 'fas fa-file-alt text-secondary';
    }
  };

  return (
    <div className="col">
      <div className="card h-90 shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-center gap-3 ">
            <i className={`${getIcon(documento.tipo)} fa-2x`}></i>
            <div>
              <h5 className="card-title mb-1">{documento.nombre}</h5>
              <small className="text-muted">Subido: {documento.fecha}</small>
            </div>
          </div>
        </div>
        <div className="card-footer bg-transparent">
          <div className="d-flex justify-content-between align-items-center">
            <span className="badge bg-secondary specialty-card">{documento.tipo}</span>
            <Link 
              to={`/clientes/dashboard/documentos/${documento.id}`}
              className="btn btn-sm btn-outline-primary"
            >
              <i className="fas fa-eye me-2"></i>Ver Detalle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;