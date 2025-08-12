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

  // Obtener mes y año desde localStorage
  const mesRaw = localStorage.getItem('mes_actual') || ''; // ej: "01 Enero"
  const anioActual = localStorage.getItem('anio_actual') || ''; // ej: "2025"
  const nombreMes = mesRaw.split(' ')[1] || '';

  useEffect(() => {
    const data = location.state?.docs;

    const filtrarPorMesAnio = (docs = []) =>
      docs.filter((doc) => {
        const esCSF = doc.nombre?.toLowerCase().includes('csf');
        if (esCSF) return true; // ✅ siempre incluir CSF
        return doc.mes === mesRaw && String(doc.anio) === anioActual;
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
  }, [location.state, mesRaw, anioActual]);

  return (
    <div className="documentos-container">
      {/* Encabezado con el mes y año */}
      <div className="titulo-seccion-checklist text-center mb-4">
        <div className="meses-tabs justify-center">
          <button className="tab-btn activo">
            {nombreMes} de {anioActual}
          </button>
        </div>
      </div>

      <div className="documentos-grid">
        <EstadosCuentaResumen />
        <VisitablesResumen docs={visitables} />
        <ConstanciasResumen docs={constancias} />
      </div>
    </div>
  );
};

export default DocumentosCliente;
