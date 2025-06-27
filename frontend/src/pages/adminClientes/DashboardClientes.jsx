import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, DownloadCloud, FileText, CreditCard  } from 'react-feather';
import AccesoCard from './components/AccesoCard';
import FacturacionResumen from './components/FacturacionResumen';
import ContaduriaAvance from './components/ContaduriaAvance';
import ColaboradoresGaleria from './components/ColaboradoresGaleria';
import BitacoraMensajes from './components/BitacoraMensajes';

import './Cliente.css';

const DashboardClientes = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-clientes">
      <h2>Bienvenido al Portal del Cliente</h2>

      {/* 🟦 Accesos rápidos */}
      <div className="accesos-rapidos">
        <AccesoCard icono={FilePlus} titulo="Subir Archivos" descripcion="Envía archivos de forma segura." onClick={() => navigate('subir')} />
        <AccesoCard icono={DownloadCloud} titulo="Documentos Disponibles" descripcion="Descarga facturas y contratos." onClick={() => navigate('documentos')} />
        <AccesoCard icono={FileText} titulo="Checklist y Firmas" descripcion="Firma documentos requeridos." onClick={() => navigate('checklist')} />
      </div>

      {/* 🟨 Facturación y Avance */}
      <div className="resumen-contable flex-row">
       <ContaduriaAvance mostrarBoton={true} mostrarProgresoCliente={false} />
       <ColaboradoresGaleria />
      </div>

      {/* 🟩 Colaboradores */}


      {/* 🟥 Bitácora de mensajes */}
      <BitacoraMensajes />
    </div>
  );
};

export default DashboardClientes;
