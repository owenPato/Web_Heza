import React, { useEffect, useState } from 'react';
import FacturacionResumen from './components/FacturacionResumen';
import EstadosCuentaResumen from './components/EstadosCuentaResumen';
import VisitablesResumen from './components/VisitablesResumen';
import ConstanciasResumen from './components/ConstanciasResumen';
import { useLocation } from 'react-router-dom';
import './Cliente.css';

const DocumentosCliente = () => {
  const location = useLocation();
  const [docs, setDocs] = useState(location.state?.docs || []);

  useEffect(() => {
    if (!location.state?.docs) {
      const storedDocs = localStorage.getItem('docs');
      if (storedDocs) {
        setDocs(JSON.parse(storedDocs));
      }
    }
  }, [location.state]);

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
