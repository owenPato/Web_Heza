import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FilePlus, DownloadCloud, FileText } from 'react-feather';
import AccesoCard from './components/AccesoCard';
import ContaduriaAvance from './components/ContaduriaAvance';
import ColaboradoresGaleria from './components/ColaboradoresGaleria';
import BitacoraMensajes from './components/BitacoraMensajes';
import axios from 'axios';
import './Cliente.css';
import './ModalCambioPassword.css';
import ModalEncuesta from './ModalEncuesta';

const ModalFecha = ({ visible, onClose, onConfirm }) => {
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState(new Date().getFullYear().toString());

  const mesesFormato = [
    '01 Enero', '02 Febrero', '03 Marzo', '04 Abril', '05 Mayo', '06 Junio',
    '07 Julio', '08 Agosto', '09 Septiembre', '10 Octubre', '11 Noviembre', '12 Diciembre'
  ];

  const handleSubmit = () => {
    if (!mes || !anio) {
      alert('Selecciona ambos campos');
      return;
    }
    onConfirm({ mes, anio });
    onClose();
  };

  if (!visible) return null;

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h3 className="text gradient-secondary mb-2">Selecciona Mes y Año</h3>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Mes</label>
                <select className="form-select" value={mes} onChange={e => setMes(e.target.value)}>
                  <option value="">-- Mes --</option>
                  {mesesFormato.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Año</label>
                <input type="number" className="form-control" value={anio} onChange={e => setAnio(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Confirmar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const DashboardClientes = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ para saber si entras a /contaduria
  const [modalVisible, setModalVisible] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);
  const [mostrarEncuesta, setMostrarEncuesta] = useState(true);
  const [resumenInforme, setResumenInforme] = useState(
    JSON.parse(localStorage.getItem('resumen_informe')) || null
  );

  // ✅ Cargar automáticamente el resumen si entras directamente a /contaduria
  useEffect(() => {
    if (location.pathname.includes('/clientes/dashboard/contaduria')) {
      const resumen = localStorage.getItem('resumen_informe');
      if (resumen) {
        setResumenInforme(JSON.parse(resumen));
      }
    }
  }, [location.pathname]);

  const abrirModalPara = (accion) => {
    setAccionPendiente(accion);
    setModalVisible(true);
  };

  const handleFechaConfirmada = ({ anio, mes }) => {
    setModalVisible(false);
    localStorage.setItem('mes_actual', mes);
    localStorage.setItem('anio_actual', anio);

    if (accionPendiente === 'informe') {
      procesarInformeCliente({ anio, mes });
    } else {
      cargarYObtenerDocumentos(accionPendiente);
    }
  };

  const procesarInformeCliente = async ({ anio, mes }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userId = storedUser?.id;

      const { data: cliente } = await axios.get(`/api/clientes/por-user/${userId}`);
      const idCliente = cliente?.id;

      const { data } = await axios.get(`/api/informe/procesar/${idCliente}?anio=${anio}&mes=${encodeURIComponent(mes)}`);
      setResumenInforme(data.resumen);
      localStorage.setItem('resumen_informe', JSON.stringify(data.resumen));

      alert('Informe mensual procesado correctamente');
      navigate('/clientes/dashboard/contaduria');
    } catch (err) {
      console.error('❌ Error al procesar informe:', err);
      alert(err.response?.data?.mensaje || 'Error al procesar informe');
    }
  };

  const cargarYObtenerDocumentos = async (redirectPath = 'documentos') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userId = storedUser?.id;

      const { data: cliente } = await axios.get(`/api/clientes/por-user/${userId}`);
      const idCliente = cliente?.id;

      const anio = localStorage.getItem('anio_actual');
      const mes = localStorage.getItem('mes_actual');

      const endpoints = [
        `/api/csf/${idCliente}`,
        `/api/entregables/buzon/${idCliente}?anio=${anio}&mes=${encodeURIComponent(mes)}`,
        `/api/informe/${idCliente}?anio=${anio}&mes=${encodeURIComponent(mes)}`,
        `/api/entregables/imss/${idCliente}?anio=${anio}&mes=${encodeURIComponent(mes)}`,
        `/api/entregables/sat/${idCliente}?anio=${anio}&mes=${encodeURIComponent(mes)}`,
        `/api/entregables/efos/${idCliente}?anio=${anio}&mes=${encodeURIComponent(mes)}`,
        `/api/entregables/modificable/${idCliente}?anio=${anio}&mes=${encodeURIComponent(mes)}`
      ];

      for (const url of endpoints) {
        try {
          await axios.get(url);
        } catch (err) {
          console.warn(`Skipping ${url}: ${err.response?.status}`);
        }
      }

      const { data } = await axios.get(`/api/documentos/${idCliente}`);
      localStorage.setItem('docs', JSON.stringify(data));
      navigate(redirectPath, { state: { docs: data, id_cliente: idCliente } });
    } catch (error) {
      console.error('Error al cargar documentos:', error.message);
    }
  };

  return (
    <div className="dashboard-clientes">
      <div className="accesos-rapidos">
        <AccesoCard icono={FilePlus} titulo="Subir Archivos" descripcion="Envía archivos de forma segura." onClick={() => abrirModalPara('subir')} />
        <AccesoCard icono={DownloadCloud} titulo="Documentos Disponibles" descripcion="Descarga facturas y contratos." onClick={() => abrirModalPara('documentos')} />
        <AccesoCard icono={FileText} titulo="Checklist y Firmas" descripcion="Firma documentos requeridos." onClick={() => abrirModalPara('checklist')} />
      </div>

      <div className="resumen-contable flex-row">
        <ContaduriaAvance
          mostrarBoton={true}
          mostrarProgresoCliente={false}
          resumen={resumenInforme}
          onVerMas={() => abrirModalPara('informe')}
        />
        <ColaboradoresGaleria />
      </div>

      <BitacoraMensajes />

      <ModalFecha visible={modalVisible} onConfirm={handleFechaConfirmada} onClose={() => setModalVisible(false)} />
      <ModalEncuesta show={mostrarEncuesta} onClose={() => setMostrarEncuesta(false)} />
    </div>
  );
};

export default DashboardClientes;
