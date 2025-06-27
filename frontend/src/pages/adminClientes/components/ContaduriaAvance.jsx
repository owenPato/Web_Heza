import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import useChecklistProgreso from '../../../hooks/useChecklistProgreso';
import BarraProgresoCliente from './BarraProgresoCliente';
import InformeMensualCliente from './InformeMensualCliente';
import '../Cliente.css';

const ContaduriaAvance = ({ porcentaje = 100 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const esVistaContaduria = location.pathname.includes('/clientes/dashboard/contaduria');

  const indicadores = [
  { nombre: 'Ingresos facturados acumulados', valor2025: '24,779,386', valor2024: '39,637,019' },
  { nombre: 'Coeficiente de utilidad', valor2025: '0.0194', valor2024: '0.0211' },
  { nombre: 'Pérdidas fiscales', valor2025: '-', valor2024: '-' },
  ];

const impuestos = [
  { nombre: 'ISR', valor: '15,452' },
  { nombre: 'IVA', valor: '708,877' },
  { nombre: 'Retención Salarios', valor: '70,382' },
  { nombre: 'I.S.P.T. Asimilados', valor: '-' },
  { nombre: 'Retención servicios profesionales', valor: '67' },
  { nombre: 'Retención RESICO', valor: '1,760' },
  { nombre: 'Retención arrendamiento', valor: '-' },
  { nombre: 'Retención IVA', valor: '-' },
  { nombre: 'Subsidio aplicado', valor: '-' },
  { nombre: 'Compensación', valor: '1,969' },
  { nombre: 'Total', valor: '794,569' },
];

const cumplimiento = [
  { nombre: 'Impuestos Federales (SAT)', cumplida: true, opinion: 'POSITIVA' },
  { nombre: 'Contabilidad Electrónica', cumplida: false, opinion: 'N/A' },
  { nombre: 'IMSS', cumplida: true, opinion: 'POSITIVA' },
  { nombre: 'INFONAVIT', cumplida: true, opinion: 'POSITIVA' },
  { nombre: 'Impuesto sobre Nóminas', cumplida: true, opinion: 'POSITIVA' },
];
  const progressSpring = useSpring({
    from: { width: '0%' },
    to: { width: `${porcentaje}%` },
    config: { tension: 250, friction: 250 },
  });

  const numberSpring = useSpring({
    from: { value: 0 },
    to: { value: porcentaje },
    config: { duration: 4500 },
  });

  const tareasCliente = [
    { nombre: 'Subida de Estados de Cuenta', completado: true },
    { nombre: 'Subida de Excel de Movimientos', completado: false },
    { nombre: 'Firma del Checklist', completado: false }
  ];

  const { progreso } = useChecklistProgreso(tareasCliente);

  return (
    <div className="contaduria-avance-layout">
      {/* Gráfica dorada */}
      <div className="avance-contaduria-box">
        <h3>Avance de Contaduría</h3>
        <div className="progreso-barra">
          <animated.div className="progreso" style={progressSpring}>
            <animated.span>{numberSpring.value.to(val => `${Math.round(val)}%`)}</animated.span>
          </animated.div>
        </div>
        <p>Tu servicio contable va en proceso.</p>

        {/* Solo mostrar el botón en el dashboard principal */}
        {!esVistaContaduria && (
          <button onClick={() => navigate('/clientes/dashboard/contaduria')}>
            Ver más
          </button>
        )}
      </div>

      {/* Solo mostrar gráfica azul en la vista de contaduría */}
      {esVistaContaduria && (
      <> 
        <div className="avance-contaduria-box">
          <h5>Progreso de Documentación del Cliente</h5>
          <BarraProgresoCliente progreso={progreso} />
        </div>
        
        <InformeMensualCliente
          indicadores={indicadores}
          impuestos={impuestos}
          cumplimiento={cumplimiento}
        />        
      </>

      )}
    </div>
  );
};

export default ContaduriaAvance;
