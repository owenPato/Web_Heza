import React, { useEffect, useState } from 'react';
import FacturacionResumen from './components/FacturacionResumen';
import EstadosCuentaResumen from './components/EstadosCuentaResumen';
import VisitablesResumen from './components/VisitablesResumen';
import ConstanciasResumen from './components/ConstanciasResumen';
import { useLocation } from 'react-router-dom';
import './Cliente.css';

const DocumentosCliente = () => {
  const location = useLocation();
  const [constancias, setConstancias] = useState([]);
const [visitables, setVisitables] = useState([]);
const [check, setCheck] = useState([]);

useEffect(() => {
  const data = location.state?.docs;
  if (data) {
    setConstancias(data.constancias || []);
    setVisitables(data.visitables || []);
    setCheck(data.check || []);
  } else {
    const stored = localStorage.getItem('docs');
    if (stored) {
      const parsed = JSON.parse(stored);
      setConstancias(parsed.constancias || []);
      setVisitables(parsed.visitables || []);
      setCheck(parsed.check || []);
    }
  }
}, [location.state]);

  return (
    <div className="documentos-container">
      <div className="documentos-grid">
        <EstadosCuentaResumen />
        <VisitablesResumen docs={visitables || []} />
        <ConstanciasResumen docs={constancias} />
      </div>
    </div>
  );
};

export default DocumentosCliente;
