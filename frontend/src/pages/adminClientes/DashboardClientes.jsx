import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, DownloadCloud, FileText } from 'react-feather';
import AccesoCard from './components/AccesoCard';
import FacturacionResumen from './components/FacturacionResumen';
import ContaduriaAvance from './components/ContaduriaAvance';
import ColaboradoresGaleria from './components/ColaboradoresGaleria';
import BitacoraMensajes from './components/BitacoraMensajes';
import axios from 'axios';
import './Cliente.css';

const DashboardClientes = () => {
  const navigate = useNavigate();

  const getClienteIdByUserId = async (userId) => {
  const { data } = await axios.get(`/api/clientes/por-user/${userId}`);
  return data.id; // id del cliente
};


const cargarYObtenerDocumentos = async (redirectPath = 'documentos') => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userId = storedUser?.id;

    if (!userId) throw new Error('ID de usuario no encontrado');

    const { data: cliente } = await axios.get(`/api/clientes/por-user/${userId}`);
    const idCliente = cliente?.id;
    if (!idCliente) throw new Error('ID de cliente no encontrado');

    // Rutas por separado con try/catch individuales
    const endpoints = [
      `/api/csf/${idCliente}`,
      `/api/entregables/buzon/${idCliente}`,
      `/api/informe/${idCliente}`,
      `/api/entregables/imss/${idCliente}`,
      `/api/entregables/sat/${idCliente}`,
      `/api/entregables/efos/${idCliente}`,
      `/api/entregables/modificable/${idCliente}`,
    ];

    for (const url of endpoints) {
      try {
        await axios.get(url);
      } catch (err) {
        console.warn(`⚠️ Skipping ${url}: ${err.response?.status} ${err.response?.data?.message}`);
        // Si quieres interrumpir aquí en ciertos casos, puedes usar:
        // if (err.response?.status === 409) throw err;
      }
    }

    // Consulta documentos reales agrupados
    const { data } = await axios.get(`/api/documentos/${idCliente}`);
    localStorage.setItem('docs', JSON.stringify(data));
    navigate(redirectPath, { state: { docs: data } });

  } catch (error) {
    console.error('❌ Error al cargar o agrupar documentos:', error.message);
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
          onClick={() => navigate('subir')}
        />
        <AccesoCard
          icono={DownloadCloud}
          titulo="Documentos Disponibles"
          descripcion="Descarga facturas y contratos."
          onClick={() => cargarYObtenerDocumentos('documentos')}
        />
        <AccesoCard
          icono={FileText}
          titulo="Checklist y Firmas"
          descripcion="Firma documentos requeridos."
          onClick={() => cargarYObtenerDocumentos('checklist')}
        />
      </div>

      {/* 🟨 Facturación y Avance */}
      <div className="resumen-contable flex-row">
        <ContaduriaAvance mostrarBoton={true} mostrarProgresoCliente={false} />
        <ColaboradoresGaleria />
      </div>

      {/* 🟥 Bitácora de mensajes */}
      <BitacoraMensajes />
    </div>
  );
};

export default DashboardClientes;
