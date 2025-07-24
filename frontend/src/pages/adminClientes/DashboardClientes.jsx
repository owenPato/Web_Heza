import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, DownloadCloud, FileText } from 'react-feather';
import AccesoCard from './components/AccesoCard';
import FacturacionResumen from './components/FacturacionResumen';
import ContaduriaAvance from './components/ContaduriaAvance';
import ColaboradoresGaleria from './components/ColaboradoresGaleria';
import BitacoraMensajes from './components/BitacoraMensajes';
import axios from 'axios';
import './Cliente.css';

// ✅ Modal embebido
const ModalFecha = ({ visible, onClose, onConfirm }) => {
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState(new Date().getFullYear().toString());

  const mesesFormato = [
    '01 Enero', '02 Febrero', '03 Marzo', '04 Abril', '05 Mayo', '06 Junio',
    '07 Julio', '08 Agosto', '09 Septiembre', '10 Octubre', '11 Noviembre', '12 Diciembre'
  ];

  if (!visible) return null;

  const handleSubmit = () => {
    if (!mes || !anio) {
      alert('Selecciona ambos campos');
      return;
    }

    console.log('✅ Fecha seleccionada:', { mes, anio });
    onConfirm({ mes, anio });
    onClose();
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 999
    }}>
      <div className="modal-contenido" style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
        <h3>Selecciona Mes y Año</h3>
        <select value={mes} onChange={e => setMes(e.target.value)}>
          <option value="">-- Mes --</option>
          {mesesFormato.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <br />
        <input
          type="number"
          placeholder="Año"
          value={anio}
          onChange={e => setAnio(e.target.value)}
          style={{ marginTop: 10 }}
        />
        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button onClick={onClose} style={{ marginRight: 10 }}>Cancelar</button>
          <button onClick={handleSubmit}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

// 🟩 Principal
const DashboardClientes = () => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);

  const abrirModalPara = (accion) => {
    setAccionPendiente(accion);
    setModalVisible(true);
  };

  const handleFechaConfirmada = async ({ anio, mes }) => {
    console.log('⏳ Confirmando fecha y acción:', accionPendiente);
    setModalVisible(false);

    localStorage.setItem('mes_actual', mes);
    localStorage.setItem('anio_actual', anio);

    switch (accionPendiente) {
      case 'subir':
        navigate('subir');
        break;
      case 'documentos':
        await cargarYObtenerDocumentos('documentos');
        break;
      case 'checklist':
        await cargarYObtenerDocumentos('checklist');
        break;
      default:
        console.warn('Acción no reconocida');
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
          console.log('📥 Llamando:', url);
          await axios.get(url);
        } catch (err) {
          console.warn(`⚠️ Skipping ${url}: ${err.response?.status}`);
        }
      }

      const { data } = await axios.get(`/api/documentos/${idCliente}`);
      localStorage.setItem('docs', JSON.stringify(data));
      navigate(redirectPath, { state: { docs: data } });

    } catch (error) {
      console.error('❌ Error al cargar documentos:', error.message);
    }
  };

  return (
    <div className="dashboard-clientes">
      <h2>Bienvenido al Portal del Cliente</h2>

      {/* 🟦 Accesos rápidos */}
      <div className="accesos-rapidos">
        <AccesoCard
          icono={FilePlus}
          titulo="Subir Archivos"
          descripcion="Envía archivos de forma segura."
          onClick={() => abrirModalPara('subir')}
        />
        <AccesoCard
          icono={DownloadCloud}
          titulo="Documentos Disponibles"
          descripcion="Descarga facturas y contratos."
          onClick={() => abrirModalPara('documentos')}
        />
        <AccesoCard
          icono={FileText}
          titulo="Checklist y Firmas"
          descripcion="Firma documentos requeridos."
          onClick={() => abrirModalPara('checklist')}
        />
      </div>

      {/* 🟨 Facturación y Avance */}
      <div className="resumen-contable flex-row">
        <ContaduriaAvance mostrarBoton={true} mostrarProgresoCliente={false} />
        <ColaboradoresGaleria />
      </div>

      {/* 🟥 Bitácora de mensajes */}
      <BitacoraMensajes />

      {/* ⏱ Modal */}
      <ModalFecha
        visible={modalVisible}
        onConfirm={handleFechaConfirmada}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default DashboardClientes;
