import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import useChecklistProgreso from '../../../hooks/useChecklistProgreso';
import BarraProgresoCliente from './BarraProgresoCliente';
import InformeMensualCliente from './InformeMensualCliente';
import '../Cliente.css';

const ContaduriaAvance = ({
  porcentaje = 100,
  onVerMas,
  mostrarBoton = true,
  mostrarProgresoCliente = true,
  resumen: resumenProp
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const esVistaContaduria = location.pathname.includes('/clientes/dashboard/contaduria');

  // Estado local para el resumen
  const [resumen, setResumen] = useState(resumenProp || null);

  // Obtener mes y año desde localStorage
  const mesRaw = localStorage.getItem('mes_actual') || ''; // ej: "01 Enero"
  const anioActual = localStorage.getItem('anio_actual') || ''; // ej: "2025"
  const nombreMes = mesRaw.split(' ')[1] || '';

  // Refrescar resumen si no viene por props
  useEffect(() => {
    if (!resumen && esVistaContaduria) {
      const localResumen = localStorage.getItem('resumen_informe');
      if (localResumen) {
        setResumen(JSON.parse(localResumen));
      }
    }
  }, [location.pathname, resumen, esVistaContaduria]);

  const indicadores = resumen ? [
    { nombre: 'Ingresos facturados acumulados', valor2025: resumen.ingresos_2025_str, valor2024: resumen.ingresos_2024_str },
    { nombre: 'Coeficiente de utilidad', valor2025: resumen.coef_2025_str, valor2024: resumen.coef_2024_str },
    { nombre: 'Pérdidas fiscales', valor2025: '-', valor2024: '-' },
  ] : [
    { nombre: 'Ingresos facturados acumulados', valor2025: '24,779,386', valor2024: '39,637,019' },
    { nombre: 'Coeficiente de utilidad', valor2025: '0.0194', valor2024: '0.0211' },
    { nombre: 'Pérdidas fiscales', valor2025: '-', valor2024: '-' },
  ];

  const impuestos = resumen ? [
    { nombre: 'ISR', valor: resumen.isr_str },
    { nombre: 'IVA', valor: resumen.iva_str },
    { nombre: 'Retención Salarios', valor: resumen.retencion_salarios_str },
    { nombre: 'I.S.P.T. Asimilados', valor: resumen.ispt_asimilados_str },
    { nombre: 'Retención servicios profesionales', valor: resumen.retencion_profesionales_str },
    { nombre: 'Retención RESICO', valor: resumen.retencion_resico_str },
    { nombre: 'Retención arrendamiento', valor: resumen.retencion_arrendamiento_str },
    { nombre: 'Retención IVA', valor: resumen.retencion_iva_str },
    { nombre: 'Subsidio aplicado', valor: resumen.subsidio_aplicado_str },
    { nombre: 'Compensación', valor: resumen.compensacion_str },
    { nombre: 'Total', valor: resumen.total_str },
  ] : [
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

  const cumplimiento = resumen ? [
    { nombre: 'Impuestos Federales (SAT)', cumplida: resumen.cumplimiento?.sat === 'POSITIVA', opinion: resumen.cumplimiento?.sat },
    { nombre: 'Contabilidad Electrónica', cumplida: resumen.cumplimiento?.contabilidad === 'POSITIVA', opinion: resumen.cumplimiento?.contabilidad },
    { nombre: 'IMSS', cumplida: resumen.cumplimiento?.imss === 'POSITIVA', opinion: resumen.cumplimiento?.imss },
    { nombre: 'INFONAVIT', cumplida: resumen.cumplimiento?.infonavit === 'POSITIVA', opinion: resumen.cumplimiento?.infonavit },
    { nombre: 'Impuesto sobre Nóminas', cumplida: resumen.cumplimiento?.isn === 'POSITIVA', opinion: resumen.cumplimiento?.isn },
  ] : [
    { nombre: 'Impuestos Federales (SAT)', cumplida: true, opinion: 'POSITIVA' },
    { nombre: 'Contabilidad Electrónica', cumplida: false, opinion: 'N/A' },
    { nombre: 'IMSS', cumplida: true, opinion: 'POSITIVA' },
    { nombre: 'INFONAVIT', cumplida: true, opinion: 'POSITIVA' },
    { nombre: 'Impuesto sobre Nóminas', cumplida: true, opinion: 'POSITIVA' },
  ];

  const tareasCliente = [
    { nombre: 'Subida de Estados de Cuenta', completado: true },
    { nombre: 'Subida de Excel de Movimientos', completado: false },
    { nombre: 'Firma del Checklist', completado: false }
  ];

  const { progreso } = useChecklistProgreso(tareasCliente);

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

  return (
    
    <div className="contaduria-avance-layout">
      <div className="avance-contaduria-box mt-6">
        <h3>Avance de Contabilidad</h3>
        <div className="progreso-barra">
          <animated.div className="progreso" style={progressSpring}>
            <animated.span>{numberSpring.value.to(val => `${Math.round(val)}%`)}</animated.span>
          </animated.div>
        </div>
        <p>Tu servicio contable va en proceso.</p>

        {!esVistaContaduria && mostrarBoton && (
          <button onClick={onVerMas}>Ver más</button>
        )}
      </div>

      {esVistaContaduria && mostrarProgresoCliente && (
        <>
          <div className="avance-contaduria-box">
            <h5>Progreso de Documentación del Cliente</h5>
            <BarraProgresoCliente progreso={progreso} />
          </div>
          {/* Encabezado con mes y año */}
          <div className="titulo-seccion-checklist text-center ">
            <div className="meses-tabs justify-center">
              <button className="tab-btn activo">
                {nombreMes} {anioActual ? `de ${anioActual}` : ''}
              </button>
            </div>
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
