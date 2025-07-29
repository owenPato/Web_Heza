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

  const mesActual = localStorage.getItem('mes_actual') || ''; // ej: "01 Enero"
  const anioActual = localStorage.getItem('anio_actual') || ''; // ej: "2025"

  useEffect(() => {
    const data = location.state?.docs;

    const filtrarPorMesAnio = (docs = []) =>
      docs.filter((doc) => {
        const esCSF = doc.nombre?.toLowerCase().includes('csf');
        if (esCSF) return true; // ✅ siempre incluir CSF
        return doc.mes === mesActual && String(doc.anio) === anioActual;
      });

    if (data) {
      setConstancias(filtrarPorMesAnio(data.constancias));
      setVisitables(filtrarPorMesAnio(data.visitables));
      setCheck(filtrarPorMesAnio(data.check));
    } else {
      const stored = localStorage.getItem('docs');
      if (stored) {
        const parsed = JSON.parse(stored);
        setConstancias(filtrarPorMesAnio(parsed.constancias));
        setVisitables(filtrarPorMesAnio(parsed.visitables));
        setCheck(filtrarPorMesAnio(parsed.check));
      }
    }
  }, [location.state, mesActual, anioActual]);

  return (
    <div className="documentos-container">
      <div className="documentos-grid">
        <EstadosCuentaResumen />
        <VisitablesResumen docs={visitables} />
        <ConstanciasResumen docs={constancias} />
      </div>
    </div>
  );
};

export default DocumentosCliente;
