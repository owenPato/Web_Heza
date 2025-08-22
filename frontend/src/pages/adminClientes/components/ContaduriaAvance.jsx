// frontend/src/pages/adminClientes/components/ContaduriaAvance.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import axios from 'axios';
import BarraProgresoCliente from './BarraProgresoCliente';
import InformeMensualCliente from './InformeMensualCliente';
import '../Cliente.css';

const CATEGORIAS_REQUERIDAS = [4, 7, 8];
const TOTAL_REQUERIDAS = CATEGORIAS_REQUERIDAS.length;

function mesNumeroDe(cadena) {
  const s = String(cadena || '').trim();
  const num = s.split(' ')[0]?.padStart(2, '0') || '';
  return /^\d+$/.test(num) ? num : '';
}

function getIdClienteLocal(location) {
  // 1) state
  const fromState = location.state?.id_cliente ?? location.state?.idCliente;
  if (fromState != null && !Number.isNaN(Number(fromState))) return Number(fromState);

  // 2) localStorage directo
  const lsRaw = localStorage.getItem('id_cliente');
  if (lsRaw) {
    try {
      const parsed = JSON.parse(lsRaw);
      if (!Number.isNaN(Number(parsed))) return Number(parsed);
    } catch {
      if (!Number.isNaN(Number(lsRaw))) return Number(lsRaw);
    }
  }

  // 3) objeto cliente guardado
  try {
    const cliente = JSON.parse(localStorage.getItem('cliente') || 'null');
    if (cliente?.id != null) return Number(cliente.id);
  } catch {}

  // 4) derivar del primer documento en cache
  try {
    const docs = JSON.parse(localStorage.getItem('docs') || 'null')?.check || [];
    if (docs.length && docs[0]?.id_cliente != null) return Number(docs[0].id_cliente);
  } catch {}

  // 5) del user (si luego lo resolvemos por API)
  return null;
}

async function getIdClientePorAPI() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId =
      user?.id ?? user?.id_usuario ?? user?.userId ?? user?.idUser ?? null;
    if (!userId) return null;

    // Si usas baseURL/proxy puedes cambiar a '/api/clientes/por-user/...'
    const { data } = await axios.get(`http://localhost:5000/api/clientes/por-user/${userId}`);
    const id = data?.id ?? data?.id_cliente ?? null;
    return id ? Number(id) : null;
  } catch {
    return null;
  }
}

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

  const [resumen, setResumen] = useState(resumenProp || null);

  // Mes/Año activos
  const mesRaw = localStorage.getItem('mes_actual') || '';              // ej: "06 Junio"
  const anioActual = String(localStorage.getItem('anio_actual') || ''); // ej: "2025"
  const nombreMes = mesRaw.split(' ')[1] || '';
  const targetMesNum = mesNumeroDe(mesRaw); // "06"

  // Cliente activo
  const [idCliente, setIdCliente] = useState(() => getIdClienteLocal(location));

  // Progreso para la barra
  const [progreso, setProgreso] = useState(0);
  const [contadorFirmadas, setContadorFirmadas] = useState(0);

  // Token axios
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  // Resolver idCliente si no lo tenemos en local
  useEffect(() => {
    (async () => {
      if (idCliente == null) {
        const id = await getIdClientePorAPI();
        if (id != null) setIdCliente(id);
      }
    })();
    // también reintenta si cambia la navegación
  }, [idCliente, location.key]);

  // Cargar resumen si no viene por props
  useEffect(() => {
    if (!resumen && esVistaContaduria) {
      const localResumen = localStorage.getItem('resumen_informe');
      if (localResumen) setResumen(JSON.parse(localResumen));
    }
  }, [location.pathname, resumen, esVistaContaduria]);

  // Calcular progreso (firmas del mes/año activos en categorías 4,7,8)
  useEffect(() => {
    const calcularProgresoFirmas = async () => {
      if (!idCliente) {
        setProgreso(0);
        setContadorFirmadas(0);
        return;
      }

      try {
        const { data: firmas } = await axios.get(
          `http://localhost:5000/api/firmas/cliente/${idCliente}`
        );

        // cache meta de documentos por si faltara algo en la respuesta
        const docsCache = JSON.parse(localStorage.getItem('docs') || 'null')?.check || [];
        const metaPorDocId = new Map(
          docsCache.map((d) => [
            Number(d.id),
            {
              id_categoria: Number(d.id_categoria ?? d.categoria ?? d.idCategoria ?? 0),
              mes: d.mes,
              anio: d.anio
            }
          ])
        );

        const categoriasFirmadas = new Set();

        (firmas || []).forEach((f) => {
          const docId = Number(f.id_documento);
          const meta = metaPorDocId.get(docId);

          const cat = Number(
            f.id_categoria != null ? f.id_categoria : (meta?.id_categoria ?? 0)
          );

          const anio = String(
            f.anio != null ? f.anio : (meta?.anio ?? '')
          );

          const mesNum = mesNumeroDe(
            f.mes != null ? f.mes : (meta?.mes ?? '')
          );

          if (
            anio === anioActual &&
            mesNum === targetMesNum &&
            CATEGORIAS_REQUERIDAS.includes(cat)
          ) {
            categoriasFirmadas.add(cat);
          }
        });

        const firmadas = categoriasFirmadas.size; // 0..3
        const pct = Math.round((firmadas / TOTAL_REQUERIDAS) * 100);
        setContadorFirmadas(firmadas);
        setProgreso(pct);
      } catch (err) {
        console.error('Error calculando progreso (firmas):', err);
        setProgreso(0);
        setContadorFirmadas(0);
      }
    };

    calcularProgresoFirmas();
  }, [idCliente, targetMesNum, anioActual, mesRaw]);

  // Animaciones del bloque superior (Avance de Contabilidad)
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

  // Tablas (fallbacks si no hay resumen)
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
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
              {contadorFirmadas}/{TOTAL_REQUERIDAS} documentos requeridos firmados
            </div>
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
