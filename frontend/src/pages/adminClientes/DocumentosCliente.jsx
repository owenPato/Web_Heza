import React from 'react';
import FacturacionResumen from './components/FacturacionResumen';
import EstadosCuentaResumen from './components/EstadosCuentaResumen';
import VisitablesResumen from './components/VisitablesResumen';
import ConstanciasResumen from './components/ConstanciasResumen';
import './Cliente.css';

const DocumentosCliente = () => {
  return (
    <div className="documentos-container">
      <div className="documentos-grid">
        <FacturacionResumen />
        <EstadosCuentaResumen />
        <VisitablesResumen />
        <ConstanciasResumen />
      </div>
    </div>
  );
};

export default DocumentosCliente;
